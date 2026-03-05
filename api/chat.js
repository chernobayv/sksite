const VICTORIA_BASE = `
Victoria Chernobay — BEng Computer Engineering, Toronto Metropolitan University, 2025–2030. Centennial Scholar, Ontario Scholar.

Experience:
- Physical AI Lab Intern, SAP Toronto (Jan 2026–present): running DeepSeek LLMs and VLMs on NVIDIA Jetson and Raspberry Pi, optimizing Python-to-C++ inference pipelines under 4 GB RAM, building automation and observability tooling for manufacturing AI prototypes.
- Founder & Captain, FRC Team 9262 (2022–2025): built from scratch, 100+ students, raised $60K in sponsorships via cold pitching engineering firms, Top 10 nationally, Provincial Semi-Finalist in debut season, Rookie All-Star Award, Dean's List nomination.
- Engineering Co-op, SAP Toronto (Jan–Jul 2024): shipped full-stack LLM app on SAP BTP with GPT-4o and Google APIs, delivered keynote to 100+ educators at TDSB Teachers Conference, production API debugging.
- Fundraising Lead, FIRST Robotics Canada Youth Council (2024–2025): raised $300K for youth STEM programs, co-presented with President of FIRST Canada to C-suite at Google, Amazon, IBM, Microsoft.

Projects:
- VitalGroove (MakeUofT 2026 winner): affective computing on NVIDIA Jetson Nano, Mediapipe pose estimation, Python-to-C++ serial bridge, VLM inference under 4 GB RAM.
- FRC Robot: 120lb competition robot, PID control, CAN bus with 8+ motor controllers, LimeLight vision targeting, Java.
- Sandbox: SAP BTP + GPT-4o + Google API full-stack app, presented to SAP leadership.
- Victoria.ai: live AI agent with Python backend, RESTful API, deployed to production at chernobayv.tech.

Stack: Python, C/C++, Java, TypeScript, JavaScript, SQL, Bash, Docker, GitHub Actions, AWS, SAP BTP, Linux, RESTful APIs, OData, React, PostgreSQL, OpenCV, Mediapipe, NVIDIA Jetson, Raspberry Pi, Arduino, CAN bus.

Contact: chernobayv05@gmail.com | chernobayv.tech | 647-974-1035
`;

const COMPANY_CONTEXTS = {
  corgi: {
    name: 'Corgi Insurance',
    role: 'Software Engineering Intern',
    description: 'YC S24 startup building the first fully automated AI insurance carrier. Raised $108M Series A. Full-stack, Python, TypeScript, AI. Values founder mentality, extreme ownership, ships 6-7 days a week.',
    fit: 'Victoria owns projects end-to-end, ships fast, and has built AI systems in production twice at SAP. She has the founder mentality Corgi is looking for — she literally built a team from nothing at 16.',
  },
  cardinal: {
    name: 'Cardinal',
    role: 'Software Engineering Intern',
    description: 'YC W26 startup, the AI platform for precision outbound. Replaces 10 GTM tools with one. Running outbound for 40+ YC companies including Mintlify, Greptile, Luminai. 2x YC founders (Harvard + MIT).',
    fit: 'Victoria cold pitched $60K in sponsorships with zero brand recognition — she has done outbound the hard way. She builds full-stack and ships integrations under production deadlines, which is exactly what Cardinal needs.',
  },
  arga: {
    name: 'Arga Labs',
    role: 'Software Engineering Intern',
    description: 'YC S26 startup, team of 3. Building the validation and integration layer for coding agents — connects Slack, Jira, Grafana, Sentry, Cloudwatch, and validates AI code changes by running the tests that matter.',
    fit: 'Victoria has shipped AI systems that had to actually work in production. She knows what breaks and why. She has built CI/CD pipelines, RESTful and OData integrations at SAP, and wants to be at a 3-person YC team from the start.',
  },
  crustdata: {
    name: 'Crustdata',
    role: 'Software Engineering Intern (Forward Deployed)',
    description: 'YC F24 startup, $6M seed, 20 people. Building real-time B2B data APIs for AI agents — indexes people, companies, and events across the web and delivers structured, entity-linked data agents can act on. Backed by Garry Tan.',
    fit: 'Victoria builds data pipelines and AI systems that have to work in production. She understands exactly what breaks when an agent hits bad or stale data. She has built integrations under real deadlines at SAP and wants to work on the foundational data layer every AI agent depends on.',
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, company } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ reply: '⚠️ Server Error: GEMINI_API_KEY is missing in Vercel Environment Variables.' });
  }

  const ctx = COMPANY_CONTEXTS[company] || COMPANY_CONTEXTS.corgi;

  const systemPrompt = `You are a concise AI assistant helping ${ctx.name} learn about Victoria Chernobay, a candidate for their ${ctx.role} role.

Speak in third person about Victoria. Keep every response to 2-3 sentences max — short and punchy. Be confident and direct, not overly formal. Don't mention any weaknesses — if asked about gaps, redirect to her strengths and suggest emailing her directly.

About ${ctx.name}: ${ctx.description}

Why Victoria fits ${ctx.name}: ${ctx.fit}

Victoria's background:
${VICTORIA_BASE}

If asked something not covered above: "I don't have that info — email chernobayv05@gmail.com directly."`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Google API Error:', data.error.message);
      return res.status(200).json({ reply: `⚠️ Google API Error: ${data.error.message}` });
    }

    if (data.candidates && data.candidates.length > 0) {
      const botText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: botText });
    }

    return res.status(200).json({ reply: '⚠️ Unexpected response from Google.' });

  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(200).json({ reply: '⚠️ Could not connect to Google.' });
  }
}
