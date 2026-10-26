import Link from "next/link";
import AddRig from "@/components/AddRig";
import BuildFinder from "@/components/BuildFinder";
import ChatDemo from "@/components/ChatDemo";
import CopyCommand from "@/components/CopyCommand";
import Signup from "@/components/Signup";
import { NEMOTRON_BOLT_GGUF } from "@/lib/builds";
import "./home.css";

const LEADERBOARD = "https://claude.ai/artifact/Ci55mmJWhp3J16mq6xgVa4";

export default function Home() {
  return (
    <div className="wrap">
      <nav aria-label="Main">
        <a className="brand" href="#top" id="top"><span className="led" aria-hidden="true" />run it local</a>
        <ul>
          <li><a href="#builds">Builds</a></li>
          <li><a href="#rigs">Add your rig</a></li>
          <li><a href="#learn">Learn</a></li>
          <li><a href="#notes">Lab notes</a></li>
          <li><Link href="/people">People</Link></li>
        </ul>
      </nav>

      <section className="hero" id="builds">
        <div className="head" style={{ maxWidth: 820 }}>
          <span className="kicker">Local AI, from people who run it</span>
          <h1>Run AI on your own hardware.</h1>
          <p className="lede">Tell us your budget or the model you want. We&apos;ll show you the build, the parts list with used prices, and what it can actually run.</p>
          <p><a className="more" href="#rigs">Already running it local? Add your rig</a></p>
        </div>
        <BuildFinder />
        <p className="small">Prices are rough used-market ranges as of October 2026, before tax and shipping. Live eBay prices are coming to the full build pages.</p>
      </section>

      <section id="rigs">
        <div className="head">
          <span className="kicker">Already running it local?</span>
          <h2>Add your rig to the board</h2>
          <p>Help us build a leaderboard of real hardware, not spec sheets. Paste one prompt into the AI agent on your machine, then paste its result back here. It reads your specs, runs a short test, and leaves out hostnames, paths and serials.</p>
        </div>
        <AddRig />
      </section>

      <section id="try">
        <div className="head">
          <span className="kicker">Live on our rack</span>
          <h2>Try it before you buy anything</h2>
          <p>This runs on our own used GPUs, not a cloud API. The receipt under each answer shows what it took.</p>
        </div>
        <ChatDemo />
      </section>

      <section id="learn">
        <div className="head">
          <span className="kicker">Start here</span>
          <h2>Learn it in six steps</h2>
          <p>From your first model on the computer you already own to a server that runs your whole team. Each step is a short guide.</p>
        </div>
        <ol className="path">
          <li><span className="n">01</span><b>Run your first model</b><div><p>Install Ollama, then run one command. Works on most laptops.</p><CopyCommand cmd="ollama run qwen3:8b" /></div></li>
          <li><span className="n">02</span><b>Know what matters</b><p>Memory, quantization, and why one card is fast and another isn&apos;t.</p></li>
          <li><span className="n">03</span><b>Pick your build</b><p>Match a budget to the models you want. Use the finder above.</p></li>
          <li><span className="n">04</span><b>Build it</b><p>Parts, drivers, cooling, and the cables nobody tells you about.</p></li>
          <li><span className="n">05</span><b>Serve it</b><p>Ollama, then llama.cpp, then Open WebUI for a ChatGPT-style app.</p></li>
          <li><span className="n">06</span><b>Make it useful</b><p>Chat with your documents, run agents, add voice.</p></li>
        </ol>
      </section>

      <section id="notes">
        <div className="head">
          <span className="kicker">Lab notes</span>
          <h2>What we tested this week</h2>
          <p>Short write-ups from the rack: what came out, whether it runs on used hardware, and what broke.</p>
        </div>
        <div className="posts">
          <article className="post">
            <time dateTime="2026-10-15">Oct 15, 2026</time>
            <div className="body">
              <span className="tag queued">Testing now</span>
              <h3>NVIDIA&apos;s Nemotron 3.5 Bolt squeezes a 74B model into 24 GB</h3>
              <p>A 74B mixture-of-experts model with 9B active, trained to run at 2-bit, with vision built in. Open weights, commercial use allowed.</p>
              <div className="runson">
                <div><span>Memory</span>About 24 GB</div>
                <div><span>Cheapest build</span>2× P100 or one 3090</div>
                <div><span>Our test</span>Queued on P100, A4500, CMP</div>
                <div><span>Catch</span>NVIDIA&apos;s own file needs Ada or Blackwell. Use the Unsloth GGUF on older cards.</div>
              </div>
              <a className="more" href={NEMOTRON_BOLT_GGUF} rel="noopener">Model files on Hugging Face</a>
            </div>
          </article>
          <article className="post">
            <time dateTime="2026-10-19">Oct 19, 2026</time>
            <div className="body">
              <span className="tag">Lab note</span>
              <h3>A billion tokens on 90 used GPUs: 2.9 days</h3>
              <p>Qwen3.6-35B-A3B on Tesla P100s, RTX A4500s and ex-mining CMP cards. The 2016 P100s never throttled, and the A4500s won every speed test while sitting on their power cap.</p>
              <div className="runson">
                <div><span>2× P100</span>53 tok/s</div>
                <div><span>2× A4500</span>110 tok/s</div>
                <div><span>Power per 1M tokens</span>6 to 8 cents</div>
              </div>
              <a className="more" href="https://claude.ai/artifact/YHV3B1kMy3h6nRzbKDidFY" rel="noopener">Read the full bench</a>
            </div>
          </article>
        </div>
      </section>

      <section id="about">
        <div className="about">
          <div className="photo" role="img" aria-label="Photo placeholder">Your photo<br />here</div>
          <div className="text">
            <span className="kicker">Who runs this</span>
            <h2>James Buniak</h2>
            <p>Controls and automation engineer with 15 years in PLCs, DCS and pharma validation. I built and ran a UL 508A panel shop. Now I run a rack of 90 used data-center GPUs and test what they can really do, so you don&apos;t have to guess.</p>
            <p>Every number on this site comes from hardware we own and measure, or from rigs people like you submit. When something hasn&apos;t been tested, it says so.</p>
            <Link className="more" href="/people">Meet the people behind the rack</Link>
            <div className="btns">
              <a className="btn alt" href="#about">Local AI group on Facebook</a>
              <a className="btn alt" href="#about">Podcast: coming soon</a>
            </div>
            <Signup />
          </div>
        </div>
      </section>

      <footer>
        <span className="tagline"><span className="led" aria-hidden="true" />Run It Local · run it yourself, own your data</span>
        <ul>
          <li><a href="#builds">Builds</a></li>
          <li><a href="#rigs">Add your rig</a></li>
          <li><a href="#notes">Lab notes</a></li>
          <li><Link href="/people">People</Link></li>
          <li><a href={LEADERBOARD}>Leaderboard</a></li>
        </ul>
      </footer>
    </div>
  );
}
