export default async function handler(req, res) {
  // Only allow POST requests
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

The job description is About the role
Find your maximum velocity.
SafetyKit is group of engineers, designers, and operators committed to deploying AI into the world's largest companies as quickly as possible.

It's going to happen, and we're not going to watch it from the sidelines.

We're obsessive builders. We couldn't stop coding if we tried. We chose SafetyKit over cushy big tech jobs because we're tired of moving at the speed of consensus. We want to know what our maximum velocity is.

We're not afraid of big customers, high scale, and high expectations. We know that impact is denominated in dollars — we care about creating real, visible economic change inside the world's largest companies.

We want to learn from the best. We're former and future founders. Some of us are pedigreed (Stripe, Netflix, MIT, Yale), some of us aren't. Some of us are 14-year staff engineers, some of us are on day one.

It's working — some of the biggest companies in the world depend on the work we do every day. But it's still early. 99.9% of the value we'll ever produce is ahead of us.

If this sounds like the life you want to live, let's talk.

What we care about
Speed up.
The future is waiting on us. Don’t do tomorrow what you can do today. Find the minimum effective dose and move on to the next problem.

Obsess.
Reality has a surprising amount of detail. Go deeper. Love your work — even the stuff that other people find unbearably boring

Decouple and trust.
We are a tightly-bound team of autonomous operators. We maintain a high bar so we can move fast with high trust. We support and teach each other every day.

Some of our past interns
Built AI agents to autonomously investigate signup flows
Built a classifier to determine if marketplace products are drop-shipped
Built a classifier to identify IP violations deployed on some of the world’s largest marketplaces
About you
You love language models.
You code and ship at very high velocity.
You aren’t scared to use codegen models to code and ship even faster.
You act like an owner in everything you do.
People tell you you pick things up unusually quickly.
You care about your work and you care about moving fast. A lot.
You know more than you need to know. You have an insatiable curiosity.
About SafetyKit
SafetyKit replaces human content moderators with language models. Companies like Character.ai, Substack, Upwork, Faire, and Eventbrite use SafetyKit to find and remove bad stuff on their platform without hurting good users.

We’re ex-Stripe and Airbnb, repeat founders, and have deep connections and experience in our space. We work together in-person every day in a sunny office in the Mission in San Francisco.

Make sure that it also makes her align with this message.

If not covered: "I don't have that info - email chernobayv05@gmail.com`; 

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: CTX }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 180 }
      })
    });

    const data = await response.json();
    const botText = data.candidates[0].content.parts[0].text;
    
    // Send the text back to your frontend
    res.status(200).json({ reply: botText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
