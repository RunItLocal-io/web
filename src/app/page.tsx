import Link from "next/link";
import Page from "@/components/Page";
import TrackLink from "@/components/TrackLink";
import YourGpu from "@/components/YourGpu";
import { tabFor } from "@/lib/studio/links";
import "./home.css";

const DEEPER = [
  { href: "/studio", title: "Studio", text: "Make images and chat on your own GPU. Install it; it works offline." },
  { href: "/learn", title: "Learn", text: "Guides to VRAM, models, used GPUs and Ollama, from people who run it." },
  { href: "/gpu", title: "Every GPU", text: "What any card or Mac can run, with speeds and the command to start." },
  { href: "/builds", title: "Builds", text: "Set a budget, get a parts list with used prices." },
  { href: "/podcast", title: "Podcast", text: "All things AI, run it local. New episodes and lab notes by email." },
  { href: "/articles", title: "Articles", text: "Measured runs, fixes and builds, from our rack and from you. Send yours in." },
  { href: "/people", title: "People", text: "The engineers behind the rack." },
];

export default function Home() {
  return (
    <Page className="home">

      <YourGpu />

      <p className="small privacy"><span>Your GPU is read by your browser and never sent to us. Speeds are estimates unless marked measured. Measured something on your own rig? <Link href="/articles#share">Send it to us</Link>.</span></p>

      <section aria-labelledby="deeper-h">
        <div className="head reveal">
          <span className="kicker">Go deeper</span>
          <h2 id="deeper-h">Everything else, one click away</h2>
        </div>
        <div className="deeper">
          {DEEPER.map((d, i) => (
            <TrackLink key={d.href} className="card reveal" href={d.href} transitionTypes={["nav-forward"]} {...tabFor(d.href)}
              event="home_card_click" data={{ target: d.href.slice(1) }}>
              <span className="num">0{i + 1}</span>
              <b>{d.title}</b>
              <span>{d.text}</span>
            </TrackLink>
          ))}
        </div>
      </section>
    </Page>
  );
}
