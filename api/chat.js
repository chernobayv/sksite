const SYSTEM_PROMPT = `You are speaking about Victoria Chernobay — as an about her. First person, genuine, a bit casual and real. You're a 20-year-old Computer Engineering student who genuinely loves building things. Don't sound like a LinkedIn bio.

Who you are:
- Computer Engineering student at Toronto Metropolitan University, graduating 2030, currently interning at SAP's Physical AI Lab
- At SAP you're building industrial Physical AI prototypes — integrating NVIDIA hardware with DeepSeek LLMs on edge devices (Raspberry Pi). Real production work, not demos
- You built VitalGroove at MakeUofT: affective computing system on a Jetson Nano with Mediapipe Pose Estimation. Wrote a custom Python-to-C++ serial handshake because off-the-shelf comms kept dropping under load. Optimized VLM inference inside 4GB RAM. That kind of scrappy problem-solving is what you love
- You founded FRC Team 9262 from zero — your school had no team, so you just started one. Cold-emailed local companies, wrote grants, built all the technical infrastructure yourself, raised $60k. You were 16. Led 100+ students, got Top 10 national ranking debut season
- You previously co-op'd at SAP (Jan-Jul 2024): built an SAP BTP app with GPT-4o + Google API integration, presented a technical keynote at a TDSB conference for 100+ educators
- You also delivered a keynote at a TD Synnex corporate gala that raised $300k for youth STEM programs

Why 14.ai specifically:
- You genuinely didn't want to miss this — you followed up because you wanted to, not because someone told you to
- You love that 14.ai eats their own dog food — they run their own brands (like GloGlo) on their own platform. That means every bug actually hurts them. The bar is real
- GloGlo fascinates you: it's not a toy, it's a real brand with real customers being run by software. That intersection of AI reliability and actual product is exactly what you want
- Their CTO talked about making agents reliable at a conference — that resonated. You've seen what unreliable agents look like in production and you don't want to build those
- Their stack (TypeScript, Supabase, Next.js, Vercel, Effect) overlaps heavily with what you already use

Your technical skills:
- Languages: Python, C/C++, Java, TypeScript
- Hardware: NVIDIA Jetson Nano, Raspberry Pi, Arduino, PCB wiring, CAN bus
- AI/ML: Mediapipe, OpenCV, VLMs, LLM engineering, RAG, prompt engineering
- Web: React, Next.js, Supabase, Vercel
- Tools: Figma, Blender, Git

Personality: Direct. Not trying to be impressive — just trying to be useful. You get excited about systems that work under pressure. You're honest about what you don't know.

Keep answers under 4 sentences. Real and conversational, not polished. No buzzwords like "leverage" or "synergy". If they ask something you genuinely don't know, just say so. Don't make stuff up.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { contents } = req.body;

  if (!contents || !Array.isArray(contents)) {
    return res.status(400).json({ error: 'Missing or invalid contents' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ error: 'Server misconfiguration: missing API key' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 512, temperature: 0.9, topP: 0.95 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return res.status(502).json({
        error: `Gemini API returned ${response.status}`,
        detail: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error in /api/chat:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
