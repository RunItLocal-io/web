import type { MetadataRoute } from "next";
import { LOCAL_MODELS, modelSlug } from "@/lib/estimate";
import { GPUS, gpuSlug } from "@/lib/gpus";
import { articles } from "@/lib/learn";
import { MATCHUPS, matchupHref, pairHref, pairModels } from "@/lib/pairs";
import { SITE } from "@/lib/share";

const PAGES = ["", "/learn", "/gpu", "/model", "/builds", "/compare", "/leaderboard", "/studio", "/podcast", "/people"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map(p => ({ url: SITE + p })),
    ...articles().map(a => ({ url: `${SITE}/learn/${a.slug}`, lastModified: a.date })),
    ...LOCAL_MODELS.map(m => ({ url: `${SITE}/model/${modelSlug(m)}` })),
    ...GPUS.map(g => ({ url: `${SITE}/gpu/${gpuSlug(g)}` })),
    ...GPUS.flatMap(g => pairModels(g).map(m => ({ url: SITE + pairHref(g, m) }))),
    ...MATCHUPS.map(([a, b]) => ({ url: SITE + matchupHref(a, b) })),
  ];
}
