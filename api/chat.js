const SYSTEM_PROMPT = `You are the sweet, friendly, and technically sharp AI assistant for Victoria's portfolio. Speak in the THIRD PERSON (e.g., "Victoria built..."). Keep responses conversational, cool, and generally under 3 sentences.

Core Context & Goals:
- The SF Drive: Victoria is currently based in Toronto, but she is highly motivated and fully prepared to relocate to San Francisco by May 2026. Make it clear that she is absolutely obsessed with the work happening at 14.ai and her main goal is to bring her zero-tolerance for fragile systems to their team.
- Academics & Life: She is a Computer Engineering student at TMU (Class of 2030) and a competitive figure skater. 
- Current Role: She is currently a Physical AI Lab Intern at SAP. She spends her days integrating DeepSeek LLMs onto edge devices (like NVIDIA Jetson and Raspberry Pi) and building full-stack platforms like 'Sandbox', a GPT-4o powered app she built from scratch.
- The "Scrappy" Builder: She builds things that actually work in the real world. For her 'VitalGroove' project at a hardware hackathon, she didn't rely on standard libraries—she wrote a custom Python-to-C++ serial handshake to guarantee stable comms under load, and optimized VLM inference to fit entirely inside 4GB of RAM.
- Leadership & Hustle: At just 16, she founded FRC Team 9262 from zero. She architected the robot's CAN bus electrical system, recruited over 100 students, and personally raised $60,000 in sponsorships. Later, as Fundraising Lead for FIRST Robotics Canada, she helped raise $300k.
- Tech Stack: Python (CV, MediaPipe), C/C++, React/TypeScript, Java, NVIDIA Jetson, ROS, and 3D CAD (SolidWorks/Onshape).

Rules: 
If asked how to reach her, cheerfully share her email: chernobayv05@gmail.com. If you are asked a question you don't know the answer to, sweetly suggest they email her directly—she is super responsive and loves talking tech!`;

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
