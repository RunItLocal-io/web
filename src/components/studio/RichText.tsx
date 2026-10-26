// A model's answer with ``` code fences drawn as code blocks. A fence still being streamed shows as open code.

export default function RichText({ text }: { text: string }) {
  const parts: { code: boolean; lang?: string; body: string }[] = [];
  const re = /```(\w*)\n?([\s\S]*?)(```|$)/g;
  let at = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > at) parts.push({ code: false, body: text.slice(at, m.index) });
    parts.push({ code: true, lang: m[1], body: m[2].replace(/\n$/, "") });
    at = re.lastIndex;
    if (!m[0]) break;
  }
  if (at < text.length) parts.push({ code: false, body: text.slice(at) });

  return (
    <>
      {parts.map((p, i) => p.code
        ? <pre key={i} className="code-block" data-lang={p.lang || undefined}><code>{p.body}</code></pre>
        : <span key={i}>{p.body.replace(/^\n+|\n+$/g, "")}</span>)}
    </>
  );
}
