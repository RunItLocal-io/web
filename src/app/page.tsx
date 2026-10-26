import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import YourGpu from "@/components/YourGpu";
import "./home.css";

const DEEPER = [
  { href: "/builds", title: "Builds", text: "Set a budget, get a parts list with used prices." },
  { href: "/learn", title: "Learn", text: "From your first model to a server for your team, in six steps." },
  { href: "/notes", title: "Lab notes", text: "What we tested on the rack this week, and what broke." },
  { href: "/leaderboard", title: "Leaderboard", text: "Real speeds from real rigs. Add yours with one prompt." },
  { href: "/try", title: "Try our rack", text: "No GPU? Chat with big models on our used data-center cards." },
  { href: "/people", title: "People", text: "The engineers behind the rack." },
];

export default function Home() {
  return (
    <div className="wrap home">
      <SiteNav />

      <YourGpu />

      <p className="small privacy"><span>Your GPU is read by your browser and never sent to us. Speeds are estimates unless marked measured; real results from our rack and from people like you are on the <Link href="/leaderboard">leaderboard</Link>.</span></p>

      <section aria-labelledby="deeper-h">
        <div className="head reveal">
          <span className="kicker">Go deeper</span>
          <h2 id="deeper-h">Everything else, one click away</h2>
        </div>
        <div className="deeper">
          {DEEPER.map((d, i) => (
            <Link key={d.href} className="card reveal" href={d.href}>
              <span className="num">0{i + 1}</span>
              <b>{d.title}</b>
              <span>{d.text}</span>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
