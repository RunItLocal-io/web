"use client";

import Image from "next/image";
import { useState } from "react";

// The people directory: a search box over a grid of cards. Every word of the query has to appear somewhere
// in the person's name, role, tags, bio or what they work on.

export type Person = {
  name: string;
  role: string;
  photo?: string;
  meta: string[];
  bio: string;
  works: string[];
  links: { label: string; href: string }[];
};

const text = (p: Person) => [p.name, p.role, ...p.meta, p.bio, ...p.works].join(" ").toLowerCase();

export default function Directory({ people, groupHref }: { people: Person[]; groupHref: string }) {
  const [q, setQ] = useState("");
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = words.length ? people.filter(p => { const t = text(p); return words.every(w => t.includes(w)); }) : people;

  return (
    <section className="directory" aria-label="People">
      <div className="dir-bar">
        <input type="search" value={q} onChange={e => setQ(e.target.value)} autoComplete="off"
          placeholder="Search by name, hardware or skill: DGX Spark, agents, PLC…" aria-label="Search people" />
        <span className="dir-count" aria-live="polite">{shown.length} of {people.length}</span>
      </div>

      {shown.length ? (
        <div className="people">
          {shown.map(p => (
            <article className="person" key={p.name}>
              <div className="head">
                {p.photo
                  ? <Image className="photo" src={p.photo} alt={p.name} width={88} height={88} />
                  : <div className="photo empty" role="img" aria-label={`Photo of ${p.name}, coming soon`}>Photo<br />coming</div>}
                <div>
                  <span className="role">{p.role}</span>
                  <h2>{p.name}</h2>
                  <div className="meta">{p.meta.map(m => <span key={m}>{m}</span>)}</div>
                </div>
              </div>
              <p>{p.bio}</p>
              <div className="works">{p.works.map(w => <span key={w}>{w}</span>)}</div>
              {p.links.length > 0 && <div className="links">{p.links.map(l => <a key={l.label} href={l.href}>{l.label}</a>)}</div>}
            </article>
          ))}
        </div>
      ) : (
        <p className="dir-empty">No one here matches &ldquo;{q.trim()}&rdquo;. Ask in <a href={groupHref}>the group</a> and someone will point you the right way.</p>
      )}
    </section>
  );
}
