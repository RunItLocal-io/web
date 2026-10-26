import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Page from "@/components/Page";
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
    photo: "/people/james-buniak.jpg",
    meta: ["Pennsylvania, USA", "Controls and automation"],
    bio: "Controls and automation engineer with 15 years in PLCs, DCS and pharmaceutical validation. Built and ran a UL 508A panel shop. Now runs a rack of 90 used data-center GPUs and measures what they can really do, so you don't have to guess.",
    works: ["GPU rack and benchmarks", "Builds and parts lists", "Podcast host", "Private AI installs"],
    links: [{ label: "Local AI group", href: "#" }, { label: "PLC group, 222K members", href: "#" }, { label: "LinkedIn", href: "https://www.linkedin.com/in/jamesbuniak/" }, { label: "GitHub", href: "https://github.com/jamesbuniak" }, { label: "PLCcode.ai", href: "https://plccode.ai" }],
  },
  {
    name: "Md Moazzem Hossain",
    role: "Contributor",
    photo: "/people/md-moazzem-hossain.jpg",
    meta: ["Fukuoka, Japan", "Cognitive AppDev"],
    bio: "AI engineer in Fukuoka who competes in Kaggle machine-learning competitions. Works with the rack on training runs and on getting the inference network up.",
    works: ["Kaggle and model training", "Inference network"],
    links: [{ label: "Kaggle", href: "#" }, { label: "LinkedIn", href: "#" }, { label: "GitHub", href: "https://github.com/munnam77" }, { label: "Website", href: "https://cognitiveappdev.com" }],
  },
  {
    name: "Henri Alfonso",
    role: "Builder",
    meta: ["United States", "3D simulation and security"],
    bio: "Builds 3D worlds that robots learn in: digital twins in NVIDIA Isaac Sim and Unreal Engine 5, rendered on an RTX 4090 lab at home, with an open pull request to Isaac Sim. Before that, fifteen years in cybersecurity, eleven of them in DoD work after the U.S. Air Force, and a Linux kernel fix that was assigned CVE-2026-64240.",
    works: ["3D models and digital twins", "Isaac Sim and Unreal Engine 5", "RTX 4090 AI lab", "Breaking AI systems"],
    links: [{ label: "Website", href: "https://henrialfonso.com" }, { label: "LinkedIn", href: "https://www.linkedin.com/in/henrilalfonso/" }],
  },
  {
    name: "Tony Ortiz",
    role: "Contributor",
    photo: "/people/tony-ortiz.jpg",
    meta: ["Bethlehem, USA", "Design and video"],
    bio: "Graphic designer and motion animator with more than 15 years in branding, video and paid advertising. Runs Tony Ortiz The Designer, LLC in the Lehigh Valley and hosts the I Will Not Lose podcast. Uses Codex, local scripts and agents to automate the tedious parts of his podcast production.",
    works: ["Podcast production agents", "Branding and motion design", "I Will Not Lose podcast"],
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/tothedesigner/" },
      { label: "Website", href: "https://www.tothedesigner.com/" },
      { label: "Podcast", href: "https://www.iwillnotlosepodcast.com/" },
      { label: "YouTube", href: "https://www.youtube.com/channel/UCUBDyv5gLhtvYkFy4CIaTsA" },
    ],
  },
  {
    name: "Brent Forschner",
    role: "Builder",
    photo: "/people/brent-forschner.jpg",
    meta: ["Bethlehem, USA", "Technologist and videographer"],
    bio: "Avid technologist and videographer with more than 15 years behind the camera. Brent racks and cables the GPU servers, gets models running on them, and builds AI-ready PCs for friends. On the podcast he runs the cameras, live switching and edits. By day he manages a unit at Clubhouse of Lehigh County, where AI now builds his spreadsheets and newsletters.",
    works: ["Videography and editing", "Podcast production", "GPU server installs", "AI PC builds"],
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/brent-forschner-96969b365/" }],
  },
];

export default function People() {
  return (
    <Page className="people-page">

      <header>
        <Link className="crumb" href="/" transitionTypes={["nav-back"]}>← Home</Link>
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
        <span className="kicker">Looking for contributors</span>
        <h2>Come build, test and talk with us</h2>
        <p>We&apos;re looking for people who run AI on their own hardware: homelab builders, people with odd GPUs, engineers putting local models to work. Help with tests, write up a build, join the podcast crew, or come on as a guest and tell your story.</p>
        <ul className="asks">
          <li><strong>Contribute</strong> benchmarks, builds and write-ups, published under your name</li>
          <li><strong>Join the podcast</strong> as a co-host, or on cameras, editing and production</li>
          <li><strong>Be a guest</strong> and tell us what you&apos;re running and what broke along the way</li>
        </ul>
        <div className="join-actions">
          <a className="btn" href="mailto:james@darkcompute.io?subject=Run%20It%20Local%20contributor">Email james@darkcompute.io</a>
          <Link className="btn outline" href="/leaderboard">Get the benchmark prompt</Link>
        </div>
      </section>
    </Page>
  );
}
