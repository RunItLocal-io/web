// What people can send in from /articles. Shared by the form (client) and the queue (server).

export const KINDS = [
  { id: "run", label: "A measured run", hint: "Your GPU, a model, the tok/s you got" },
  { id: "tip", label: "A tip or a find", hint: "Something that surprised you" },
  { id: "fix", label: "Something that broke", hint: "And how you got it working" },
  { id: "build", label: "A build", hint: "The parts, the price, what it runs" },
] as const;

export type Kind = (typeof KINDS)[number]["id"];
