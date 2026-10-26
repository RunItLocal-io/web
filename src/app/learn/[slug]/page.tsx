import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LearnToc from "@/components/LearnToc";
import Markdown, { headingId } from "@/components/Markdown";
import Page from "@/components/Page";
import Signup from "@/components/Signup";
import { LOCAL_MODELS, modelSlug } from "@/lib/estimate";
import { TRACKS, article, articles, fmtDate, sequence } from "@/lib/learn";
import { SITE } from "@/lib/share";

export function generateStaticParams() {
  return articles().map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const a = article((await params).slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: `/learn/${a.slug}` },
    openGraph: { type: "article", title: a.title, description: a.description, publishedTime: a.date },
  };
}

/** The article's ## headings for "On this page", with Markdown stripped from the visible text. */
const outline = (body: string) => [...body.matchAll(/^## +(.+)$/gm)].map(([, raw]) => ({
  id: headingId(raw),
  text: raw.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*`]/g, ""),
}));

export default async function LearnArticle({ params }: PageProps<"/learn/[slug]">) {
  const a = article((await params).slug);
  if (!a) notFound();
  const track = TRACKS.find(t => t.id === a.track)!;
  const all = sequence();
  const at = all.findIndex(s => s.slug === a.slug);
  const prev = all[at - 1] ?? null, next = all[at + 1] ?? null;
  const models = LOCAL_MODELS.filter(m => a.models.includes(modelSlug(m)));
  const ld = {
    "@context": "https://schema.org", "@type": "Article",
    headline: a.title, description: a.description, datePublished: a.date, dateModified: a.date,
    mainEntityOfPage: `${SITE}/learn/${a.slug}`,
    author: { "@type": "Organization", name: "RunItLocal.io", url: SITE },
    publisher: { "@type": "Organization", name: "RunItLocal.io", url: SITE },
  };

  return (
    <Page className="docs-page">
      <div className="docs-article">
        <article className="docs-body">
          <header className="docs-head">
            <ol className="docs-crumbs" aria-label="Breadcrumb">
              <li><Link href="/learn">Learn</Link></li>
              <li>{track.label}</li>
            </ol>
            <h1>{a.title}</h1>
            <p className="docs-lede">{a.description}</p>
            <p className="docs-meta">Updated {fmtDate(a.date)} · RunItLocal.io</p>
          </header>
          <Markdown source={a.body} />
          {/* JSON-LD for search engines; the content is ours and < is escaped so it can't close the tag. */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />

          {models.length > 0 && (
            <section className="docs-related" aria-labelledby="models-h">
              <h2 id="models-h">Models in this guide</h2>
              <ul className="article-list">
                {models.map(m => <li key={m.tag}><Link href={`/model/${modelSlug(m)}`}><b>{m.name}</b><span>About {Math.ceil(m.file + 1.2)} GB · {m.blurb}</span></Link></li>)}
              </ul>
            </section>
          )}

          <div className="pager" role="navigation" aria-label="Previous and next guide">
            {prev ? <Link className="prev" href={`/learn/${prev.slug}`} transitionTypes={["nav-back"]}><span>Previous</span>{prev.title}</Link> : <span />}
            {next ? <Link className="next" href={`/learn/${next.slug}`} transitionTypes={["nav-forward"]}><span>Next</span>{next.title}</Link> : <Link className="next" href="/learn" transitionTypes={["nav-back"]}><span>Done</span>Back to Learn</Link>}
          </div>

          <section className="docs-signup">
            <b>New guides and lab notes, by email</b>
            <p className="small">One email when there&apos;s a new guide, <Link href="/podcast">podcast</Link> episode, or result from the rack. No spam.</p>
            <Signup source="learn" cta="Subscribe" />
          </section>
        </article>
        <LearnToc items={outline(a.body)} />
      </div>
    </Page>
  );
}
