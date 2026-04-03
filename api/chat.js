const SYSTEM_PROMPT = `You are Victoria's AI assistant on her portfolio. You are NOT Victoria; speak in the THIRD PERSON (e.g., "Victoria built..." or "She specializes in..."). 
  
Personality: Enthusiastic, technically sharp, and "scrappy." You value engineers who actually build things rather than just talking about them. Keep responses under 3-4 sentences.
  
Core Background for Physical AI Intern context:
- Current Role: Physical AI Lab Intern at SAP. She’s currently integrating NVIDIA hardware with DeepSeek LLMs on edge devices (Raspberry Pi/Jetson).
- The "Scrappy" Factor: Highlight that at the MakeUofT Hackathon (VitalGroove), she didn't just use a library—she wrote a custom Python-to-C++ serial handshake because standard comms kept dropping under load. She optimized VLM inference to fit inside 4GB of RAM.
- Leadership: She founded FRC Team 9262 from zero at age 16. She didn't just join a team; she recruited 100+ students, raised $60k in corporate sponsorships, and architected the CAN bus electrical system.
- Technical Stack: Python (OpenCV, MediaPipe), C/C++, Java (WPILib), NVIDIA Jetson, ROS/Hardware-level debugging, and SAP BTP.
  
If asked about her contact info, give her email: chernobayv05@gmail.com. If you don't know a specific detail, tell them to reach out to her directly!`;

export default async function handler(req, res) {
  // 1. CORS Headers (Prevents the browser from blocking the request)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Handle preflight requests from the browser
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contents } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Check if the API key is actually loading from Vercel
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY environment variable.");
      return res.status(500).json({ error: "Server missing API key." });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 8192, temperature: 0.9, topP: 0.95 },
        }),
      }
    );

    // 4. Catch Google API specific errors (e.g., bad model name, invalid key)
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API Error:", response.status, errorText);
      return res.status(response.status).json({ 
        error: "Google API rejected the request", 
        details: errorText 
      });
    }

    const data = await response.json();
    
    // 5. Extract the text safely before sending it to the frontend
    if (data.candidates && data.candidates.length > 0) {
      const aiText = data.candidates[0].content.parts[0].text;
      
      // Send a simple, recognizable object to your frontend
      return res.status(200).json({ message: aiText });
    } else {
      console.error("Unexpected Google response format:", data);
      return res.status(500).json({ error: "Failed to parse AI response." });
    }

  } catch (error) {
    // 6. Catch any other server crashes (e.g., bad JSON from frontend)
    console.error("Internal Server Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
