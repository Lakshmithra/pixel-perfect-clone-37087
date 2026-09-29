/**
 * Single AI entry point for every Planora feature.
 * Returns realistic mock responses today.
 *
 * ===== PLUG IN A REAL API HERE =====
 * Replace the body of `requestRealAI` with a call to your model endpoint
 * and set USE_REAL_AI = true. Nothing else in the app needs to change.
 */

const USE_REAL_AI = false;

async function requestRealAI(prompt: string): Promise<string> {
  // ===== REAL API CALL GOES HERE =====
  // const res = await fetch("/api/public/ai", { method: "POST", body: JSON.stringify({ prompt }) });
  // return (await res.json()).text;
  throw new Error(`Real AI not configured for prompt: ${prompt.slice(0, 24)}`);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(Math.floor(seed)) % arr.length];
}

const tutorOpeners = [
  "Ah, a fine question, young scholar. Let me light a lantern on it.",
  "Gather close — the map to this idea has three turns.",
  "A worthy riddle! Here is how the royal scholars untangle it.",
];

const tutorSteps = [
  "First, name the pieces. Every concept is a small court of parts — list them before you judge them.",
  "Second, follow the cause. Ask: if I nudge this piece, what moves next? That chain is the real lesson.",
  "Third, shrink it to one sentence a squire could repeat. If you cannot, a gap still hides in the fog.",
];

const tutorQuestions = [
  "Now tell me: which of those three parts would break the whole thing if it vanished?",
  "Quick quest — can you give me one example from your own course notes?",
  "Before we ride on: what part still feels foggy to you?",
];

const gapNotes = [
  "Your telling was strong on the *what*, but the *why* slipped past — say more about the cause.",
  "Good! You named the steps, yet skipped the condition where it fails. That is where exams hide.",
  "Clear and confident. One gap: you used the term without defining it. Define it once and it is yours.",
];

const quotes = [
  "Small bricks, tall towers. Keep laying them.",
  "A knight is not fearless — only well rehearsed.",
  "The kingdom grows in the hours nobody claps for.",
  "Rest is part of the siege plan, not a retreat.",
];

export async function callAI(prompt: string): Promise<string> {
  if (USE_REAL_AI) return requestRealAI(prompt);

  await delay(500 + Math.random() * 700);
  const seed = prompt.length + prompt.charCodeAt(0);
  const p = prompt.toLowerCase();

  if (p.includes("teach me back") || p.includes("student explained")) {
    return `${pick(gapNotes, seed)}\n\nTry again in one breath, and I will listen for the missing link.`;
  }
  if (p.includes("weekly summary")) {
    return `This week your kingdom gained steady ground. Your strongest hours landed in your peak window, which is exactly how hard subjects should be fought. Confidence is climbing where you studied twice or more; the towers that barely rose are the ones to visit next. Keep one rest day so the walls do not crack, and aim for one extra focused block on your weakest subject.`;
  }
  if (p.includes("quote") || p.includes("reward")) {
    return pick(quotes, seed);
  }
  if (p.includes("why this plan")) {
    return "Hard subjects sit in your peak hours, near exams come first, and low confidence earns repeat visits.";
  }
  return `${pick(tutorOpeners, seed)}\n\n1. ${tutorSteps[0]}\n2. ${tutorSteps[1]}\n3. ${tutorSteps[2]}\n\n${pick(tutorQuestions, seed + 3)}`;
}
