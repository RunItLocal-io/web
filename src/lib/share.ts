// Share links for the big networks. None of them accept an attached image through a link, so a picture goes out
// through the device's share sheet (navigator.share) when there is one.

export const SITE = "https://runitlocal.io";

export type Target = { id: string; label: string; href: string };

export function shareTargets(url: string, text: string): Target[] {
  const u = encodeURIComponent(url), t = encodeURIComponent(text);
  return [
    { id: "x", label: "X", href: `https://x.com/intent/post?text=${t}&url=${u}` },
    { id: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { id: "reddit", label: "Reddit", href: `https://www.reddit.com/submit?url=${u}&title=${t}` },
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
    { id: "email", label: "Email", href: `mailto:?subject=${t}&body=${encodeURIComponent(`${text}\n\n${url}`)}` },
  ];
}

/** A copy of a generated image with a RunItLocal.io strip along the bottom, as a PNG file ready to share. */
export async function brandedImage(src: string, name: string): Promise<File> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const w = img.naturalWidth, bar = Math.round(w * .09), c = document.createElement("canvas");
  c.width = w; c.height = img.naturalHeight + bar;
  const g = c.getContext("2d")!;
  g.drawImage(img, 0, 0);
  g.fillStyle = "#050608"; g.fillRect(0, img.naturalHeight, w, bar);
  const mid = img.naturalHeight + bar / 2, pad = bar * .45, fs = Math.round(bar * .34);
  g.fillStyle = "#ffb020"; g.shadowColor = "#ffb020"; g.shadowBlur = bar * .25;
  g.beginPath(); g.arc(pad + fs * .3, mid, fs * .28, 0, Math.PI * 2); g.fill();
  g.shadowBlur = 0; g.textBaseline = "middle";
  g.font = `700 ${fs}px system-ui, sans-serif`; g.fillStyle = "#eef3f8";
  const x = pad + fs * .9;
  g.fillText("RunItLocal", x, mid);
  const wName = g.measureText("RunItLocal").width;
  g.fillStyle = "#6b7785"; g.fillText(".io", x + wName, mid);
  g.font = `400 ${Math.round(fs * .8)}px system-ui, sans-serif`; g.fillStyle = "#a3afbd"; g.textAlign = "right";
  g.fillText("Made on my own GPU", w - pad, mid);
  const blob = await new Promise<Blob>(r => c.toBlob(b => r(b!), "image/png"));
  return new File([blob], name, { type: "image/png" });
}
