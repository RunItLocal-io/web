import type { Metadata } from "next";
import Link from "next/link";
import Page from "@/components/Page";
import ShareForm from "@/components/ShareForm";
import { fmtDate, posts } from "@/lib/learn";

export const metadata: Metadata = {
  title: "Posts: runs, fixes and finds from the rack and from you",
  description: "Dated notes on running AI locally: measured runs, things that broke and how they got fixed, and builds, from our rack and from people who send theirs in.",
  alternates: { canonical: "/learn/posts" },
};

// Guides are evergreen; posts are dated and written once. Anyone can send one in below, and we write up the good
// ones by hand. Nothing a visitor sends is published automatically.

export default function Posts() {
  const list = posts();
  return (
    <Page className="docs-page learn-home">
      <header className="docs-head">
        <ol className="docs-crumbs" aria-label="Breadcrumb"><li><Link href="/learn">Learn</Link></li><li>Posts</li></ol>
        <h1>Posts</h1>
        <p className="docs-lede">Measured runs, things that broke, builds and odd findings, from our rack and from people running AI on their own hardware. Got one? <a href="#share">Send it in</a>.</p>
      </header>

      <section aria-labelledby="posts-h">
        <div className="head"><span className="kicker">Newest first</span><h2 id="posts-h">{list.length ? "Latest" : "The first posts are on the way"}</h2></div>
        {list.length ? (
          <ul className="article-list">
            {list.map(p => (
              <li key={p.slug}>
                <Link href={`/learn/${p.slug}`} transitionTypes={["nav-forward"]}>
                  <b>{p.title}</b>
                  <span>{fmtDate(p.date)}{p.by ? ` · from ${p.by}` : ""} · {p.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="small">Nothing here yet. Be the first to send something in below, or start with the <Link href="/learn">guides</Link>.</p>
        )}
      </section>

      <section id="share" aria-labelledby="share-h">
        <div className="head">
          <span className="kicker">Send us something</span>
          <h2 id="share-h">Ran something? Broke something? Tell us.</h2>
          <p>A real tok/s number on your card, a fix that took you a weekend, a build that came in under budget. We read every one, and the good ones become posts here, credited to you.</p>
        </div>
        <ShareForm />
      </section>
    </Page>
  );
}
