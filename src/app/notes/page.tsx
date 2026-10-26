import type { Metadata } from "next";
import Signup from "@/components/Signup";
import { PageHead, SiteFooter, SiteNav } from "@/components/SiteNav";
import { NEMOTRON_BOLT_GGUF } from "@/lib/builds";

export const metadata: Metadata = {
  title: "Lab notes",
  description: "Short write-ups from the rack: what came out, whether it runs on used hardware, and what broke.",
};

export default function Notes() {
  return (
    <div className="wrap">
      <SiteNav />
      <section>
        <PageHead kicker="Lab notes" title="What we tested this week">
          Short write-ups from the rack: what came out, whether it runs on used hardware, and what broke.
        </PageHead>
        <Signup />
        <div className="posts">
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
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
