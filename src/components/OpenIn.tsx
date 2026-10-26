"use client";

import { useState } from "react";
import { copyText } from "@/lib/copy";
import { LLMS } from "@/lib/prompts";

// "Open in your LLM": links that start a chat with the prompt filled in, plus copy for local models and agents.
// `where` names the spot on the site so Umami shows which prompts people use.
export default function OpenIn({ prompt, where, label = "Ask your LLM" }: { prompt: string; where: string; label?: string }) {
  const [copied, setCopied] = useState("Copy prompt");
  return (
    <div className="btns open-in">
      <span className="small">{label}</span>
      {LLMS.map(l => (
        <a key={l.key} className="btn alt" href={l.url(prompt)} target="_blank" rel="noopener noreferrer"
          data-umami-event="open-in" data-umami-event-llm={l.key} data-umami-event-where={where}>{l.label}</a>
      ))}
      <button type="button" className="btn alt" title={prompt}
        data-umami-event="open-in" data-umami-event-llm="copy" data-umami-event-where={where}
        onClick={() => copyText(prompt, null, () => setCopied("Copied"), () => setCopied("Copy failed"))}>{copied}</button>
    </div>
  );
}
