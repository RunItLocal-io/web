// How the Studio's chat models are told to behave: the user's own standing instructions (the master prompt),
// a preset per chat, and the rules for the Python sandbox when it's switched on.

export type Preset = { id: string; label: string; prompt: string };

export const PRESETS: Preset[] = [
  { id: "default", label: "Default", prompt: "" },
  { id: "coder", label: "Coder", prompt: "You are a senior software engineer. Give working code first, then a short explanation. Prefer clear, idiomatic code and mention edge cases." },
  { id: "editor", label: "Editor", prompt: "You are a careful editor. Improve clarity, grammar and tone while keeping the author's voice. Show the revised text first, then list the main changes briefly." },
  { id: "tutor", label: "Tutor", prompt: "You are a patient tutor. Explain step by step with a small concrete example, avoid jargon, and end with one short question that checks understanding." },
  { id: "brief", label: "Brief", prompt: "Answer in as few words as possible. No preamble, no summary." },
];

export const preset = (id: string | undefined) => PRESETS.find(p => p.id === id) ?? PRESETS[0];

const AGENT = (files: string[]) => `You can run Python 3 in a sandbox in the user's browser. numpy, pandas and matplotlib are available.
${files.length ? `The user's files are in the current folder (/data): ${files.join(", ")}.` : "There are no user files yet."}
To run code, reply with one \`\`\`python code block and stop. You will get its printed output back, and any matplotlib plots are shown to the user automatically.
Always print() the values you need to see. Variables persist between runs.
When you have the answer, reply in plain words with no code block.`;

const KEY = "runitlocal:studio-instructions";

export function loadInstructions(): string {
  try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; }
}

export function saveInstructions(text: string) {
  try { localStorage.setItem(KEY, text); } catch {}
}

/** The system prompt for a chat: preset, then the user's own instructions, then the sandbox rules if on. */
export function systemPrompt(presetId: string | undefined, mine: string, agent: { on: boolean; files: string[] }) {
  const parts = [preset(presetId).prompt, mine.trim() && `About the user and how to respond:\n${mine.trim()}`, agent.on && AGENT(agent.files)];
  return parts.filter(Boolean).join("\n\n");
}
