import Link from "next/link";
import { ViewTransition, type ReactNode } from "react";

// Every page renders inside <Page> so route changes animate (see the view-transition rules in globals.css).
// Links tag navigations as nav-forward or nav-back; untagged ones (the browser back button) crossfade.

const MOTION = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "page-fade" };

export default function Page({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <ViewTransition enter={MOTION} exit={MOTION} default="none">
      <div className={"wrap" + (className ? " " + className : "")}>{children}</div>
    </ViewTransition>
  );
}

/** Heading block for a subpage, with a way home (or up, given back). */
export function PageHead({ kicker, title, back = { href: "/", label: "Home" }, children }: { kicker: string; title: string; back?: { href: string; label: string }; children?: ReactNode }) {
  return (
    <header className="head page-head">
      <Link className="crumb" href={back.href} transitionTypes={["nav-back"]}>← {back.label}</Link>
      <span className="kicker">{kicker}</span>
      <h1>{title}</h1>
      {children && <p className="lede">{children}</p>}
    </header>
  );
}
