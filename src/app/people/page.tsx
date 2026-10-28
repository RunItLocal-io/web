import type { Metadata } from "next";
import Link from "next/link";
import Page from "@/components/Page";
import Directory, { type Person } from "./Directory";
import "./people.css";

export const metadata: Metadata = {
  title: "People",
  description: "Engineers who buy the hardware, run the tests and write up what happened.",
};

// Same links as the community icons in SiteNav (a client module, so its constants can't be imported here).
const GROUP = "https://www.facebook.com/groups/runitlocal";
const DISCORD = "https://discord.gg/T7gqVvYBvq";

const PEOPLE: Person[] = [
  {
    name: "James Buniak",
    role: "Founder",
    photo: "/people/james-buniak.jpg",
    meta: ["Pennsylvania, USA", "Controls and automation"],
    bio: "Controls and automation engineer with 15 years in PLCs, DCS and pharmaceutical validation. Built and ran a UL 508A panel shop. Now runs a rack of 90 used data-center GPUs and measures what they can really do, so you don't have to guess.",
    works: ["GPU rack and benchmarks", "Builds and parts lists", "Podcast host", "Private AI installs"],
    links: [{ label: "Dark Compute", href: "https://darkcompute.io/?utm_source=runitlocal&utm_content=people" }, { label: "Local AI group", href: GROUP }, { label: "PLC group, 222K members", href: "#" }, { label: "LinkedIn", href: "https://www.linkedin.com/in/jamesbuniak/" }, { label: "GitHub", href: "https://github.com/jamesbuniak" }, { label: "PLCcode.ai", href: "https://plccode.ai" }],
  },
  {
    name: "Md Moazzem Hossain",
    role: "Contributor",
    photo: "/people/moazzem-hossain.jpg",
    meta: ["Fukuoka, Japan", "Cognitive AppDev"],
    bio: "AI engineer in Fukuoka who competes in Kaggle machine-learning competitions. Works with the rack on training runs and on getting the inference network up.",
    works: ["Kaggle and model training", "Inference network"],
    links: [{ label: "Kaggle", href: "#" }, { label: "LinkedIn", href: "#" }, { label: "GitHub", href: "https://github.com/munnam77" }, { label: "Website", href: "https://cognitiveappdev.com" }],
  },
  {
    name: "Jonathan Conn",
    role: "Builder",
    photo: "/people/jonathan-conn.jpg",
    meta: ["Local agents", "NVIDIA DGX Spark"],
    bio: "Runs four NVIDIA DGX Sparks and keeps them busy. Jonathan built Swarmcore, a platform for swarms of AI agents, and Lursor, a Cursor-style editor powered entirely by local models. Stuck in an agent loop? He's probably debugged that exact one.",
    works: ["Four DGX Sparks", "Swarmcore agent swarms", "Lursor local-model editor", "Agent loop debugging"],
    links: [],
  },
  {
    name: "Henri Alfonso",
    role: "Builder",
    photo: "/people/henri-alfonso.jpg",
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
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/brent-forschner-96969b365/" }, { label: "GitHub", href: "https://github.com/brentanthonyproductions" }],
  },
  {
    name: "Kevin Josh E. Godoy",
    role: "Contributor",
    photo: "/people/kevin-godoy.jpg",
    meta: ["Philippines", "Full-stack web"],
    bio: "Full stack engineer who builds AI products end to end, from the interface people use to the self-hosted infrastructure underneath. He works across the whole stack: web apps, AI features, databases, Kubernetes and the servers they run on. At home he runs his own homelab, where he tests ideas on real hardware before they go anywhere near production. He's big on AI that's honest about what it actually did, and on systems that fail safe instead of failing quietly.",
    works: ["PLCcode.ai releases", "Full-stack web apps", "Messenger ordering bot"],
    links: [{ label: "Website", href: "https://fatedev.vercel.app/" }, { label: "LinkedIn", href: "https://www.linkedin.com/in/kevinjgodoy/" }, { label: "GitHub", href: "https://github.com/FateDVCG" }],
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

      <Directory people={PEOPLE} groupHref={GROUP} />

      <section className="join">
        <span className="kicker">Need a hand?</span>
        <h2>Join our group</h2>
        <p>Stuck on a build, a driver, a model that won&apos;t fit or an agent stuck in a loop? Post it in the group or reach out directly. Someone on this page has probably hit the same wall.</p>
        <p>Want to be listed here? Run tests, write up a build, join the podcast crew, or come on as a guest and tell us what you&apos;re running.</p>
        <div className="join-actions">
          <a className="btn" href={GROUP}>Join the Facebook group</a>
          <a className="btn outline" href={DISCORD}>Chat on Discord</a>
          <a className="btn outline" href="mailto:james@darkcompute.io?subject=Run%20It%20Local">Email james@darkcompute.io</a>
        </div>
      </section>
    </Page>
  );
}
