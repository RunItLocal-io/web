// Which "can the X run Y?" and "X vs Y" pages exist, and the plain-English answers they give.
// Kept to questions worth a page of their own: for each card, the most capable models it runs and the first
// one it can't, and each card against its nearest rivals. Every combination would be hundreds of near-copies.

import { BUILDS } from "./builds";
import { LOCAL_MODELS, VERDICT_PHRASE, estimate, fmtTps, modelSlug, needGb, pickHero, rateAll, usableGb, type LocalModel } from "./estimate";
import { GPUS, gpuFromSlug, gpuSlug, type Gpu } from "./gpus";

const listOf = (xs: number[]) => xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : String(xs[0]);

export const isShared = (g: Gpu) => g.kind !== "discrete";
export const memWord = (g: Gpu) => g.kind === "discrete" ? "VRAM" : g.kind === "integrated" ? "system memory" : "unified memory";
export const biggestMem = (g: Gpu) => Math.max(...g.vram);

/** The model at each memory size the card was sold in, smallest first. */
export function fitAt(g: Gpu, m: LocalModel) {
  return g.vram.slice().sort((a, b) => a - b).map(mem => {
    const usable = usableGb(g, mem);
    return { mem, usable, ...estimate(m, g.bw, usable) };
  });
}

/** Everything rated at the card's largest memory size. */
export function atMost(g: Gpu) {
  const mem = biggestMem(g), usable = usableGb(g, mem), rated = rateAll(g.bw, usable);
  return { mem, usable, rated, hero: pickHero(rated), top: rated.filter(r => r.fits).pop() ?? null };
}

// ---- "Can the X run Y?" ----

/** Models with a page for this card: the two most capable that fit its largest size, and the next one up. */
export function pairModels(g: Gpu): LocalModel[] {
  // Download sizes grow down the list, so what fits is always a prefix of it.
  const top = atMost(g).rated.map(r => r.fits).lastIndexOf(true);
  return LOCAL_MODELS.slice(Math.max(0, top - 1), top + 2);
}

export const hasPair = (g: Gpu, m: Pick<LocalModel, "tag">) => pairModels(g).some(x => x.tag === m.tag);
export const pairHref = (g: Gpu, m: Pick<LocalModel, "name">) => `/gpu/${gpuSlug(g)}/${modelSlug(m)}`;
export const pairQuestion = (g: Gpu, m: LocalModel) => `Can the ${g.name} run ${m.name}?`;

/** The answer as one paragraph, shown on the page and repeated in its FAQ markup. */
export function pairAnswer(g: Gpu, m: LocalModel) {
  const at = fitAt(g, m), ok = at.filter(x => x.fits), need = needGb(m);
  if (!ok.length) {
    const { mem, usable, hero } = atMost(g);
    const room = isShared(g) ? `at most ${mem} GB of ${memWord(g)}, of which about ${Math.round(usable)} GB is usable for models` : `at most ${mem} GB of VRAM`;
    const instead = hero ? ` The most capable model it ${hero.tps >= 10 ? "runs well" : "fits"} is ${hero.name}, at about ${fmtTps(hero.tps)} tok/s.` : "";
    // A card can spill layers into system RAM; shared memory has nowhere else to go.
    const spill = isShared(g) ? "" : " Ollama can still start it by putting part of the model in system RAM, but it runs several times slower.";
    return `No. ${m.name} needs about ${need} GB and the ${g.name} has ${room}.${spill}${instead}`;
  }
  const first = ok[0];
  const yes = ok.length === at.length ? "Yes." : `Yes, with ${first.mem} GB or more.`;
  const room = isShared(g) ? `the ${g.name} with ${first.mem} GB of ${memWord(g)} leaves about ${Math.round(first.usable)} GB for models` : `the ${g.name} has ${first.mem} GB of VRAM`;
  const smaller = at.filter(x => !x.fits).map(x => x.mem);
  const tight = smaller.length ? ` The ${listOf(smaller)} GB ${smaller.length > 1 ? "versions don't" : "version doesn't"} have room.` : "";
  return `${yes} ${m.name} needs about ${need} GB and ${room}. Expect about ${fmtTps(first.tps)} tok/s, ${VERDICT_PHRASE[first.verdict as keyof typeof VERDICT_PHRASE]}.${tight}`;
}

/** Each GPU at the smallest memory size that fits the model, fastest first. */
export function runners(m: LocalModel) {
  return GPUS.flatMap(g => {
    const mem = g.vram.slice().sort((a, b) => a - b).find(v => estimate(m, g.bw, usableGb(g, v)).fits);
    if (mem === undefined) return [];
    const e = estimate(m, g.bw, usableGb(g, mem));
    return [{ g, mem, tps: e.tps, verdict: e.verdict }];
  }).sort((a, b) => b.tps - a.tps);
}

/** The cheapest build from our list that runs the model at 10 tok/s or more. */
export function cheapestBuild(m: LocalModel) {
  return BUILDS.slice().sort((a, b) => a.lo - b.lo)
    .map(b => ({ b, e: estimate(m, b.bw, b.vram) }))
    .find(x => x.e.fits && x.e.tps >= 10) ?? null;
}

// ---- "X vs Y" ----

// Head-to-heads people search for that the nearest-rival rule below might not pick.
const PICKS: [string, string][] = [
  ["rtx-3090", "rtx-4090"], ["rtx-4090", "rtx-5090"], ["rtx-3090", "rtx-5090"], ["rtx-3090", "rx-7900-xtx"],
  ["rtx-4090", "rx-7900-xtx"], ["rtx-3060", "rtx-4060-ti"], ["rtx-3060", "rtx-5060-ti"], ["rtx-3090", "tesla-p40"],
  ["rtx-3090", "rtx-4070-ti-super"], ["arc-b580", "rtx-3060"], ["rtx-5090", "rtx-pro-6000"], ["rtx-4090", "apple-m4-max"],
  ["rtx-5090", "apple-m3-ultra"], ["gb10", "apple-m4-max"], ["gb10", "8060s"], ["8060s", "apple-m4-max"],
];

const ordered = (a: Gpu, b: Gpu): [Gpu, Gpu] => GPUS.indexOf(a) < GPUS.indexOf(b) ? [a, b] : [b, a];

/** How alike two cards are for running models: bandwidth sets speed, memory sets what fits. */
const distance = (a: Gpu, b: Gpu) => Math.abs(Math.log(a.bw / b.bw)) + Math.abs(Math.log(biggestMem(a) / biggestMem(b)));

function nearest(g: Gpu, pool: Gpu[], n: number) {
  return pool.filter(x => x !== g).sort((a, b) => distance(g, a) - distance(g, b)).slice(0, n);
}

/** Every matchup with a page, each pair once, the earlier card in the table first. */
export const MATCHUPS: [Gpu, Gpu][] = (() => {
  // Built-in graphics run only small models, so a head-to-head between them says little.
  const pool = GPUS.filter(g => g.kind !== "integrated");
  const seen = new Map<string, [Gpu, Gpu]>();
  const add = (a: Gpu, b: Gpu) => { seen.set(matchupSlug(a, b), ordered(a, b)); };
  for (const [a, b] of PICKS) add(gpuFromSlug(a)!, gpuFromSlug(b)!);
  for (const g of pool) {
    for (const p of nearest(g, pool.filter(x => x.vendor === g.vendor && x.kind === g.kind), 2)) add(g, p);
    for (const p of nearest(g, pool.filter(x => x.vendor !== g.vendor), 1)) add(g, p);
  }
  return [...seen.values()];
})();

export const POPULAR_MATCHUPS = PICKS.map(([a, b]) => ordered(gpuFromSlug(a)!, gpuFromSlug(b)!));

/** Either order gives the same page. */
export function matchupSlug(a: Gpu, b: Gpu) {
  const [x, y] = ordered(a, b);
  return `${gpuSlug(x)}-vs-${gpuSlug(y)}`;
}

export const matchupHref = (a: Gpu, b: Gpu) => `/compare/${matchupSlug(a, b)}`;

export function matchupFromSlug(s: string) {
  return MATCHUPS.find(([a, b]) => matchupSlug(a, b) === s.toLowerCase()) ?? null;
}

export const matchupsFor = (g: Gpu) => MATCHUPS.filter(([a, b]) => a === g || b === g).map(([a, b]) => a === g ? b : a);

/** Which runs bigger models and which runs faster, in a sentence each, plus the short verdict. */
export function compareSummary(a: Gpu, b: Gpu) {
  const A = atMost(a), B = atMost(b);
  const [fast, slow] = a.bw >= b.bw ? [a, b] : [b, a];
  const ratio = fast.bw / slow.bw;
  const speed = ratio < 1.05
    ? `They generate at about the same speed, since their memory bandwidth is close (${a.bw} and ${b.bw} GB/s).`
    : `The ${fast.name} generates ${ratio >= 1.9 ? `about ${ratio.toFixed(1)}× as fast` : `about ${Math.round((ratio - 1) * 100)}% faster`} on any model both can run, because it has ${fast.bw} GB/s of memory bandwidth to the ${slow.name}'s ${slow.bw} GB/s.`;

  const ia = A.top ? LOCAL_MODELS.findIndex(m => m.tag === A.top!.tag) : -1;
  const ib = B.top ? LOCAL_MODELS.findIndex(m => m.tag === B.top!.tag) : -1;
  const [big, bigTop, small, smallTop] = ia >= ib ? [a, A.top, b, B.top] : [b, B.top, a, A.top];
  const fits = ia === ib
    ? `Both fit the same models we track${A.top ? `, up to ${A.top.name}` : ""}.`
    : `The ${big.name} fits more: up to ${bigTop!.name}, against ${smallTop ? smallTop.name : "none of the models we track"} on the ${small.name}.`;

  const verdict = ia === ib
    ? ratio < 1.05 ? "They're close for local AI, so pick on price." : `The ${fast.name}, for speed. They fit the same models.`
    : big === fast ? `The ${big.name}: it fits bigger models and runs faster.` : `It depends. The ${big.name} fits bigger models; the ${fast.name} runs the models both fit faster.`;
  return { speed, fits, verdict, A, B };
}
