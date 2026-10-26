"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { pageName } from "@/lib/analytics";
import { brandedImage, shareTargets } from "@/lib/share";
import "./share.css";

// A Share button that opens a small dialog: a preview of what's being shared (a generated image, or the site's
// link card), the big networks, copy link, the device's own share sheet, and for images a branded download.

type Props = {
  url: string; text: string;
  /** An image made in the Studio. It's shared with a RunItLocal.io strip added along the bottom. */
  image?: { src: string; name: string };
  className?: string; children?: ReactNode; label?: string;
};

export default function ShareButton({ url, text, image, className, children, label = "Share" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [native, setNative] = useState(false);
  const page = pageName(usePathname());

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  // Brand the image once the dialog opens, and check what the device's share sheet can take.
  useEffect(() => {
    if (!open) return;
    let url = "";
    if (image) brandedImage(image.src, image.name).then(f => {
      setFile(f); url = URL.createObjectURL(f); setPreview(url);
      setNative(!!navigator.canShare?.({ files: [f] }));
    });
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [open, image]);

  async function nativeShare() {
    try {
      await navigator.share(file ? { files: [file], text: `${text} ${url}` } : { title: "RunItLocal.io", text, url });
      setOpen(false);
    } catch { /* cancelled */ }
  }

  function copy() {
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }, () => {});
  }

  return (
    <>
      <button type="button" className={className} onClick={() => { setOpen(true); setNative(!image && typeof navigator.share === "function"); }} aria-label={label} title={label}
        data-umami-event="share_click" data-umami-event-page={page}>
        {children ?? label}
      </button>
      {open && createPortal(
        <div className="share-scrim" role="dialog" aria-modal="true" aria-labelledby="share-h" onClick={() => setOpen(false)}>
          <div className="share-box" onClick={e => e.stopPropagation()}>
            <button className="share-x" type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>
            <h2 id="share-h">{image ? "Share your image" : "Share RunItLocal.io"}</h2>
            {/* eslint-disable-next-line @next/next/no-img-element -- a local blob: preview, or the site's generated card */}
            <img className="share-preview" src={image ? preview ?? image.src : "/opengraph-image"} alt="" />
            {image && <p className="share-note">Most sites only take links, so use your device&apos;s share sheet or download the picture and add it to your post.</p>}
            <div className="share-row">
              {native && <button type="button" className="share-main" onClick={nativeShare}>Share{image ? " image" : ""}…</button>}
              {image && file && <a className="share-main alt" href={preview ?? undefined} download={file.name}>Download image</a>}
            </div>
            <div className="share-grid">
              {shareTargets(url, text).map(t => (
                <a key={t.id} className={"share-t " + t.id} href={t.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                  <span className="share-mark" aria-hidden="true">{t.label[0]}</span>{t.label}
                </a>
              ))}
            </div>
            <div className="share-link">
              <input readOnly value={url} aria-label="Link" onFocus={e => e.currentTarget.select()} />
              <button type="button" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
