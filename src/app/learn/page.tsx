import type { Metadata } from "next";
import Link from "next/link";
import CopyCommand from "@/components/CopyCommand";
import { PageHead, SiteFooter, SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Learn",
  description: "From your first model on the computer you already own to a server that runs your whole team.",
};

export default function Learn() {
  return (
    <div className="wrap">
      <SiteNav />
      <section>
        <PageHead kicker="Start here" title="Learn it in six steps">
          From your first model on the computer you already own to a server that runs your whole team. Each step is a short guide.
        </PageHead>
        <ol className="path">
          <li><span className="n">01</span><b>Run your first model</b><div><p>Install Ollama, then run one command. Works on most laptops.</p><CopyCommand cmd="ollama run qwen3:8b" /></div></li>
          <li><span className="n">02</span><b>Know what matters</b><p>Memory, quantization, and why one card is fast and another isn&apos;t.</p></li>
          <li><span className="n">03</span><b>Pick your build</b><p>Match a budget to the models you want. Use the <Link href="/builds">build finder</Link>.</p></li>
          <li><span className="n">04</span><b>Build it</b><p>Parts, drivers, cooling, and the cables nobody tells you about.</p></li>
          <li><span className="n">05</span><b>Serve it</b><p>Ollama, then llama.cpp, then Open WebUI for a ChatGPT-style app.</p></li>
          <li><span className="n">06</span><b>Make it useful</b><p>Chat with your documents, run agents, add voice.</p></li>
        </ol>
      </section>
      <SiteFooter />
    </div>
  );
}
