"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Signup from "@/components/Signup";
import { copyText } from "@/lib/copy";
import { SITE } from "@/lib/share";

// What the Studio shows on phones and tablets. Their browsers give a tab far too little memory to load a model
// (iOS kills the tab and reloads it), so instead of failing we say so, and make it one tap to send the link to a
// computer: the share sheet covers AirDrop, Messages, Mail and Notes.

const URL_TO_SEND = `${SITE}/studio`;

export default function PhoneGate() {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  async function send() {
    try {
      await navigator.share({ title: "RunItLocal.io Studio", text: "Open the Studio on my computer:", url: URL_TO_SEND });
    } catch { /* closed the sheet */ }
  }
  const copy = () => copyText(URL_TO_SEND, ref.current, () => setCopied("Copied"), () => setCopied("Selected"));

  return (
    <main className="phone-gate">
      <span className="led" aria-hidden="true" />
      <span className="kicker">Studio</span>
      <h1>The Studio runs on a computer.</h1>
      <p className="phone-joke">Your phone is a supercomputer. Just not a &ldquo;load a language model into a browser tab&rdquo; supercomputer. Maybe next year.</p>
      <p>It loads AI models onto your graphics card, right in the browser. Phones don&apos;t give a browser tab enough memory for that, so open it on a laptop or desktop: a Mac with Apple silicon, or a PC with a graphics card.</p>
      <div className="phone-actions">
        {canShare && <button className="btn" type="button" onClick={send}>Send to my computer</button>}
        <button className={canShare ? "btn alt" : "btn"} type="button" onClick={copy}>{copied ?? "Copy link"}</button>
      </div>
      <code ref={ref} className="phone-url">{URL_TO_SEND}</code>
      <div className="phone-join">
        <b>Join the podcast list</b>
        <p>New episodes, guides, and what we&apos;re running on the rack. One email when there&apos;s something new, no spam.</p>
        <Signup source="studio-phone" cta="Join" />
      </div>
      <div className="phone-meanwhile">
        <b>On your phone meanwhile</b>
        <Link href="/gpu">What can my computer run?</Link>
        <Link href="/learn">Learn to run AI locally</Link>
        <Link href="/">Back to RunItLocal.io</Link>
      </div>
    </main>
  );
}
