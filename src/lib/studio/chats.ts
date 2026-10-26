// Conversations from the Studio, kept in IndexedDB on this device only. Images are stored once, in the
// gallery, and chats point at them by id.

import { tx } from "@/lib/studio/db";

export type SavedMsg =
  | { role: "user"; text: string; model: string; files?: string[] }
  | { role: "bot"; kind: "text"; model: string; text: string; tps?: number }
  | { role: "bot"; kind: "image"; model: string; prompt: string; pic?: string; seed?: number; ms?: number }
  | { role: "bot"; kind: "run"; model: string; code: string; ok: boolean; out: string; error?: string; images?: string[] };

/** A file the user attached, kept with the chat so its sandbox can be rebuilt later. */
export type ChatFile = { name: string; bytes: ArrayBuffer };

export type Chat = {
  id: string; title: string; model: string; at: number; msgs: SavedMsg[];
  preset?: string; agent?: boolean; files?: ChatFile[];
};

export async function listChats(): Promise<Chat[]> {
  try { return (await tx<Chat[]>("chats", "readonly", s => s.getAll())).sort((a, b) => b.at - a.at); } catch { return []; }
}

export async function saveChat(c: Chat) {
  try { await tx("chats", "readwrite", s => s.put(c)); } catch { /* not persisted */ }
}

export async function deleteChat(id: string) {
  try { await tx("chats", "readwrite", s => s.delete(id)); } catch { /* ignore */ }
}
