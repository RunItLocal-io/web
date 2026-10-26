import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./people.css";

export const metadata: Metadata = {
  title: "People",
  description: "Engineers who buy the hardware, run the tests and write up what happened.",
};

type Person = {
  name: string;
  role: string;
  photo?: string;
  meta: string[];
  bio: string;
  works: string[];
  links: { label: string; href: string }[];
};

const PEOPLE: Person[] = [
  {
    name: "James Buniak",
    role: "Founder",
    meta: ["Pennsylvania, USA", "Controls and automation"],
    bio: "Controls and automation engineer with 15 years in PLCs, DCS and pharmaceutical validation. Built and ran a UL 508A panel shop. Now runs a rack of 90 used data-center GPUs and measures what they can really do, so you don't have to guess.",
    works: ["GPU rack and benchmarks", "Builds and parts lists", "Podcast host", "Private AI installs"],
    links: [{ label: "Local AI group", href: "#" }, { label: "PLC group, 222K members", href: "#" }, { label: "LinkedIn", href: "#" }],
  },
  {
    name: "Md Moazzem Hossain",
    role: "Contributor",
    photo: "/people/md-moazzem-hossain.jpg",
    meta: ["Fukuoka, Japan", "Cognitive AppDev"],
    bio: "AI engineer in Fukuoka who competes in Kaggle machine-learning competitions. Works with the rack on training runs and on getting the inference network up.",
    works: ["Kaggle and model training", "Inference network"],
    links: [{ label: "Kaggle", href: "#" }, { label: "LinkedIn", href: "#" }],
  },
];

export default function People() {
  return (
    <div className="wrap people-page">
      <nav aria-label="Main">
        <Link className="brand" href="/"><span className="led" aria-hidden="true" />run it local</Link>
        <Link className="back" href="/">← Home</Link>
      </nav>

      <header>
        <span className="kicker">People</span>
        <h1>Who runs the rack</h1>
        <p className="lede">Engineers who buy the hardware, run the tests and write up what happened. No sponsors pick the results.</p>
      </header>

      <div className="people">
        {PEOPLE.map(p => (
          <article className="person" key={p.name}>
            {p.photo
              ? <Image className="photo" src={p.photo} alt={p.name} width={180} height={180} />
              : <div className="photo empty" role="img" aria-label={`Photo of ${p.name}, coming soon`}>Photo<br />coming</div>}
            <div className="info">
              <span className="role">{p.role}</span>
              <h2>{p.name}</h2>
              <div className="meta">{p.meta.map(m => <span key={m}>{m}</span>)}</div>
              <p>{p.bio}</p>
              <div className="works">{p.works.map(w => <span key={w}>{w}</span>)}</div>
              <div className="links">{p.links.map(l => <a key={l.label} href={l.href}>{l.label}</a>)}</div>
            </div>
          </article>
        ))}
      </div>

      <section className="join">
        <span className="kicker">Contribute</span>
        <h2>Run tests with us</h2>
        <p>Have hardware we haven&apos;t tested, or want to write up a build? Run the benchmark prompt on your machine and send us the result. Good write-ups get published here with your name on them.</p>
        <Link className="btn outline" href="/#rigs">Get the benchmark prompt</Link>
      </section>

      <footer><span className="tagline"><span className="led" aria-hidden="true" />Run It Local · run it yourself, own your data</span></footer>
    </div>
  );
}
