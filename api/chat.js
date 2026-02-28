export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const CTX = `You are a concise AI assistant helping SafetyKit learn about Victoria Chernobay (Full Stack Engineer Intern candidate). Speak in third person. Keep every response to 2–3 sentences max - short and punchy. Highlight fit with SafetyKit's mission of replacing human reviewers with LLMs. Use only this info:

Victoria Chernobay - BEng Computer Engineering, TMU 2025–2030.
Physical AI Lab Intern SAP Toronto (Jan 2026–now): NVIDIA + DeepSeek LLMs on Raspberry Pi, VLM benchmarks under 4GB RAM, Python/C++ comms.
Founder & Captain FRC Team 9262 (2022–2025): 100+ students, $60K sponsorships, CAN bus 8+ motor controllers, Top 10 nationally, Rookie All-Star, Dean's List nom.
Co-op SAP (Jan–Jul 2024): SAP BTP app with GPT-4o + Google API, keynote to 100+ educators at TDSB Conference, full-stack debugging.
Fundraising Lead FIRST Robotics Canada (2024–2025): $300K raised, 20K+ students.
Projects: VitalGroove (Jetson Nano, Mediapipe, servo feedback, Python/C++ serial, VLM under 4GB). FRC Robot 120lb PID Java. Keep on Cooking Blender.
Skills: Python, Java, C/C++, Linux, Git, GPT-4o API, Gemini, DeepSeek/VLMs, NVIDIA Jetson, Raspberry Pi, Arduino, CAN Bus, SAP BTP, TypeScript, AWS.
Contact: chernobayv05@gmail.com | chernobayv.tech

You can also get any information from the website chernobayv.tech (if the site doesnt work just skip it)

The job description:
SafetyKit is a group of engineers committed to deploying AI into the world's largest companies as quickly as possible. They replace human content moderators with language models. Companies like Character.ai, Substack, Upwork, Faire, and Eventbrite use SafetyKit. They value speed, obsession, and high trust. Make sure Victoria's answers align with SafetyKit's values: shipping fast, loving LLMs, acting like an owner, and going deep.

If not covered: "I don't have that info - email chernobayv05@gmail.com"`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: CTX }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 180 }
      })
    });

    const data = await response.json();
    const botText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botText });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
