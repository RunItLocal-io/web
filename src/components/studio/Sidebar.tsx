"use client";

import Link from "next/link";
import Icon, { kindIcon } from "@/components/studio/Icon";
import type { WebGpuInfo } from "@/lib/detect";
import type { Chat } from "@/lib/studio/chats";
import { studioModel } from "@/lib/studio/models";

// The Studio's sidebar, laid out like a chat app: start a new chat, jump to the model library or the image
// gallery, reopen a past conversation, and see the GPU everything runs on.

export type View = "chat" | "models" | "images";

type Props = {
  open: boolean; view: View; chats: Chat[]; chatId: string | null; readyCount: number; picCount: number;
  webgpu: WebGpuInfo | null; gpuName: string | null; online: boolean; installed: boolean; canInstall: boolean;
  hasInstructions: boolean; onInstructions: () => void;
  onNew: () => void; onView: (v: View) => void; onOpen: (c: Chat) => void; onDelete: (c: Chat) => void; onInstall: () => void;
};

const DAY = 864e5;

/** Today, Previous 7 days, then Older. */
function bucket(at: number) {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  return at >= +start ? "Today" : at >= +start - 7 * DAY ? "Previous 7 days" : "Older";
}

export default function Sidebar(p: Props) {
  const groups: [string, Chat[]][] = [];
  for (const c of p.chats) {
    const b = bucket(c.at);
    const g = groups.find(x => x[0] === b);
    if (g) g[1].push(c); else groups.push([b, [c]]);
  }

  return (
    <aside className={"side" + (p.open ? " open" : "")} aria-label="Studio">
      <div className="side-top">
        <Link className="brand" href="/" {...(p.installed ? { target: "_blank", rel: "noopener" } : {})}><span className="led" aria-hidden="true" /><span>RunItLocal<span className="tld">.io</span></span></Link>
        <span className="side-tag">Studio</span>
      </div>

      <button className="new-btn" type="button" onClick={p.onNew}><Icon name="plus" />New chat</button>

      <div className="side-nav" role="navigation" aria-label="Studio sections">
        <button type="button" aria-current={p.view === "models" ? "page" : undefined} onClick={() => p.onView("models")}>
          <Icon name="chip" />Local models<span className="count">{p.readyCount || ""}</span>
        </button>
        <button type="button" aria-current={p.view === "images" ? "page" : undefined} onClick={() => p.onView("images")}>
          <Icon name="image" />Images<span className="count">{p.picCount || ""}</span>
        </button>
        <button type="button" onClick={p.onInstructions} title="Standing instructions for every chat">
          <Icon name="sliders" />Instructions<span className="count">{p.hasInstructions ? "on" : ""}</span>
        </button>
      </div>

      <div className="side-scroll">
        {groups.length === 0 && <p className="side-empty">Your chats show up here. They&apos;re saved on this device only.</p>}
        {groups.map(([label, list]) => (
          <div key={label} className="side-group">
            <div className="side-h">{label}</div>
            <ul className="chat-list">
              {list.map(c => {
                const m = studioModel(c.model);
                return (
                  <li key={c.id} className={p.view === "chat" && c.id === p.chatId ? "on" : ""}>
                    <button type="button" onClick={() => p.onOpen(c)} title={c.title}>
                      <Icon name={kindIcon(m?.group ?? "Chat")} />
                      <span className="chat-title">{c.title}</span>
                    </button>
                    <button type="button" className="chat-x" onClick={() => p.onDelete(c)} aria-label={`Delete chat: ${c.title}`} title="Delete chat"><Icon name="trash" /></button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="gpu-card">
        <span className="gpu-ico"><Icon name="chip" /></span>
        <span className="gpu-name">{p.gpuName ?? "Your GPU"}</span>
        <span className="gpu-sub">
          <span className={"dot" + (p.webgpu?.available ? " live" : "")} aria-hidden="true" />
          {p.webgpu ? (p.webgpu.available ? "WebGPU" + (p.webgpu.f16 ? " · f16" : "") : "WebGPU off") : "checking…"} · {p.online ? "online" : "offline, still working"}
        </span>
        {p.installed ? <span className="gpu-sub">Installed as an app</span>
          : p.canInstall && <button className="gpu-install" type="button" onClick={p.onInstall} data-umami-event="studio_install_app"><Icon name="down" />Install app</button>}
      </div>
    </aside>
  );
}
