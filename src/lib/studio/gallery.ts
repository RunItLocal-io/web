// Images made in the Studio, kept in IndexedDB on this device only.

import { tx } from "@/lib/studio/db";

export type SavedImage = { id: string; blob: Blob; prompt: string; seed: number; ms: number; at: number };

const KEEP = 120;

export async function listImages(): Promise<SavedImage[]> {
  try { return (await tx<SavedImage[]>("images", "readonly", s => s.getAll())).sort((a, b) => b.at - a.at); } catch { return []; }
}

export async function saveImage(img: SavedImage) {
  try {
    await tx("images", "readwrite", s => s.put(img));
    const all = await listImages();
    for (const old of all.slice(KEEP)) await tx("images", "readwrite", s => s.delete(old.id));
  } catch { /* not persisted */ }
}

export async function deleteImage(id: string) {
  try { await tx("images", "readwrite", s => s.delete(id)); } catch { /* ignore */ }
}
