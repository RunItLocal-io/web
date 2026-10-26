"use client";

import { useRef, useState } from "react";
import { copyText } from "@/lib/copy";

export default function CopyCommand({ cmd }: { cmd: string }) {
  const ref = useRef<HTMLElement>(null);
  const [label, setLabel] = useState("Copy");
  return (
    <div className="cmd">
      <code ref={ref}>{cmd}</code>
      <button type="button" onClick={() => copyText(cmd, ref.current, () => setLabel("Copied"), () => setLabel("Selected"))}>{label}</button>
    </div>
  );
}
