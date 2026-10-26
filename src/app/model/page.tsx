import type { Metadata } from "next";
import Link from "next/link";
import Page, { PageHead } from "@/components/Page";
import { LOCAL_MODELS, modelSlug } from "@/lib/estimate";
import { MODEL_INFO } from "@/lib/models";
import "../catalog.css";

export const metadata: Metadata = {
  title: "Open AI models you can run locally, and what each is good for",
  description: "Every open model we track, from Qwen3 4B to gpt-oss 120B: what it's good for, how much memory it needs, and which GPUs run it.",
  alternates: { canonical: "/model" },
};

export default function Models() {
  return (
    <Page>
      <section className="hero">
        <PageHead kicker="Every model" title="Which model should you run?">
          Ordered from smallest to most capable. Each page says what the model is good for, how much memory it needs, and every GPU and Mac that runs it.
        </PageHead>
      </section>
      <section>
        <ul className="model-list">
          {LOCAL_MODELS.map(m => {
            const info = MODEL_INFO[m.tag];
            return (
              <li key={m.tag}>
                <Link href={`/model/${modelSlug(m)}`} transitionTypes={["nav-forward"]}>
                  <b>{m.name}</b>
                  <span className="small">{info ? `${info.maker} · ${info.license} · ` : ""}about {Math.ceil(m.file + 1.2)} GB</span>
                  <span>{m.blurb}.</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </Page>
  );
}
