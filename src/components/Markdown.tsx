import Link from "next/link";
import type { ReactNode } from "react";
import CopyCommand from "@/components/CopyCommand";
import Lineup from "@/components/Lineup";
import { rateAll, usableGb } from "@/lib/estimate";
import { gpuFromSlug } from "@/lib/gpus";

// The Markdown our Learn articles use, and nothing more: ## and ### headings, paragraphs, - and 1. lists,
// > notes, | tables |, fenced code (a one-line sh block becomes a copy button), **bold**, *italic*, `code`
// and [links](/gpu/rtx-3090). One extra: a line {{lineup rtx-3090 24}} embeds that GPU's live model lineup,
// so numbers in articles always match the estimator.

export const headingId = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\*[^*\s][^*]*\*)/g;

function inline(text: string): ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((t, i) => {
    if (t.startsWith("**") && t.endsWith("**") && t.length > 4) return <b key={i}>{inline(t.slice(2, -2))}</b>;
    if (t.startsWith("`") && t.endsWith("`") && t.length > 2) return <code key={i}>{t.slice(1, -1)}</code>;
    const link = t.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const [, label, href] = link;
      return href.startsWith("/") || href.startsWith("#")
        ? <Link key={i} href={href}>{inline(label)}</Link>
        : <a key={i} href={href} rel="noopener">{inline(label)}</a>;
    }
    if (t.startsWith("*") && t.endsWith("*") && t.length > 2) return <em key={i}>{inline(t.slice(1, -1))}</em>;
    return t;
  });
}

const cells = (row: string) => row.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());

function lineup(args: string[]) {
  const g = gpuFromSlug(args[0]);
  if (!g) throw new Error(`{{lineup}}: unknown GPU "${args[0]}"`);
  const mem = Number(args[1]) || g.vram[0];
  return <div className="md-embed"><p className="small">{g.name}, {mem} GB · estimated with our calculator · <Link href={`/gpu/${args[0]}`}>full page</Link></p><Lineup rated={rateAll(g.bw, usableGb(g, mem))} /></div>;
}

export default function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  const key = () => out.length;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) code.push(lines[i]);
      i++;
      if ((lang === "sh" || lang === "bash") && code.length === 1) out.push(<CopyCommand key={key()} cmd={code[0].replace(/^\$\s*/, "")} />);
      else out.push(<pre key={key()}><code>{code.join("\n")}</code></pre>);
      continue;
    }

    const embed = line.match(/^\{\{\s*(\w+)\s+([^}]*)\}\}\s*$/);
    if (embed) {
      if (embed[1] !== "lineup") throw new Error(`Unknown embed {{${embed[1]}}}`);
      out.push(<div key={key()}>{lineup(embed[2].trim().split(/\s+/))}</div>);
      i++;
      continue;
    }

    const h = line.match(/^(#{2,3})\s+(.*)$/);
    if (h) {
      const Tag = h[1] === "##" ? "h2" : "h3";
      out.push(<Tag key={key()} id={headingId(h[2])}>{inline(h[2])}</Tag>);
      i++;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      for (; i < lines.length && lines[i].startsWith(">"); i++) quote.push(lines[i].replace(/^>\s?/, ""));
      out.push(<p key={key()} className="note">{inline(quote.join(" "))}</p>);
      continue;
    }

    if (line.trim().startsWith("|")) {
      const rows: string[] = [];
      for (; i < lines.length && lines[i].trim().startsWith("|"); i++) rows.push(lines[i]);
      const [head, , ...body] = rows;
      out.push(
        <div key={key()} className="md-table"><table>
          <thead><tr>{cells(head).map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
          <tbody>{body.map((r, k) => <tr key={k}>{cells(r).map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}</tbody>
        </table></div>,
      );
      continue;
    }

    const bullet = /^\s*[-*]\s+/, numbered = /^\s*\d+\.\s+/;
    if (bullet.test(line) || numbered.test(line)) {
      const re = bullet.test(line) ? bullet : numbered;
      const items: string[] = [];
      for (; i < lines.length && (re.test(lines[i]) || (lines[i].startsWith("  ") && lines[i].trim() && items.length)); i++) {
        if (re.test(lines[i])) items.push(lines[i].replace(re, ""));
        else items[items.length - 1] += " " + lines[i].trim();
      }
      const List = re === bullet ? "ul" : "ol";
      out.push(<List key={key()}>{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</List>);
      continue;
    }

    const para = [line.trim()];
    for (i++; i < lines.length && lines[i].trim() && !/^(#{2,3}\s|```|>|\s*\||\s*[-*]\s|\s*\d+\.\s|\{\{)/.test(lines[i]); i++) para.push(lines[i].trim());
    out.push(<p key={key()}>{inline(para.join(" "))}</p>);
  }

  return <div className="prose">{out}</div>;
}
