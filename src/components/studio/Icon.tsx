// Small stroke icons for the Studio, drawn on a 24px grid and sized by font-size.

const PATHS = {
  plus: "M12 5v14M5 12h14",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15.5 9.5h.01",
  chat: "M4 5h16v11H9l-5 4z",
  code: "M9 8l-4 4 4 4M15 8l4 4-4 4",
  up: "M12 19V5M6 11l6-6 6 6",
  down: "M12 5v14M6 13l6 6 6-6M5 21h14",
  again: "M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5",
  reuse: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4",
  copy: "M8 8h11v11H8zM5 16V5h11",
  trash: "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13",
  x: "M6 6l12 12M18 6L6 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  chip: "M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
  home: "M4 11l8-7 8 7M6 10v10h12V10",
  check: "M5 12l5 5L19 7",
  terminal: "M4 5h16v14H4zM8 10l3 2-3 2M13 15h3",
  clip: "M20 11l-8 8a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7",
  share: "M18 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM18 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 11l6-4.5M8 13l6 4.5",
  sliders: "M5 7h9M18 7h1M5 17h3M12 17h7M14 5v4M8 15v4",
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={"ico" + (className ? " " + className : "")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** The icon for a kind of model. */
export const kindIcon = (group: string): IconName => group === "Images" ? "image" : group === "Chat" ? "chat" : "code";
