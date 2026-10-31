import type { Metadata } from "next";
import Link from "next/link";
import ArticleGrid from "@/components/ArticleGrid";
import Page, { PageHead } from "@/components/Page";
import ShareForm from "@/components/ShareForm";
import Signup from "@/components/Signup";
import { fmtDate, posts } from "@/lib/learn";
import "./articles.css";

export const metadata: Metadata = {
  title: "Articles: measured runs and odd finds from a rack of used GPUs",
  description: "Benchmarks, experiments and builds from our rack of used GPUs and from readers: big models on mining cards, fine-tuning on old hardware, and what broke.",
  alternates: { canonical: "/articles" },
};

// Articles are the dated write-ups ("kind: post" in content/learn). They keep their /learn/<slug> URLs, so links
// already shared keep working; this page is where they're browsed, with views and votes. Guides stay in Learn.

export default function Articles() {
  const items = posts().map(p => ({ slug: p.slug, title: p.title, description: p.description, date: fmtDate(p.date), by: p.by }));
  return (
    <Page className="articles">
      <PageHead kicker="From the rack" title="Articles">
        What we measured this week on a rack of used GPUs: big models on cheap cards, small models trained to do one job, and the things that broke. Vote up the ones worth reading. Looking for how-tos? Those are in <Link href="/learn">Learn</Link>.
      </PageHead>

      <section aria-label="All articles">
        {items.length ? <ArticleGrid items={items} /> : <p className="small">The first articles are on the way.</p>}
      </section>

      <section className="card articles-signup">
        <div>
          <b>New articles, by email</b>
          <p className="small">One email when there&apos;s a new result from the rack. No spam.</p>
        </div>
        <Signup source="articles" cta="Subscribe" />
      </section>

      <section id="share" aria-labelledby="share-h">
        <div className="head">
          <span className="kicker">Send us something</span>
          <h2 id="share-h">Ran something? Broke something? Tell us.</h2>
          <p>A real tok/s number on your card, a fix that took you a weekend, a build that came in under budget. We read every one, and the good ones become articles here, credited to you.</p>
        </div>
        <ShareForm />
      </section>
    </Page>
  );
}
