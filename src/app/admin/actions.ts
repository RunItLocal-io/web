"use server";

// Server Actions for /admin. Each one checks the cookie itself: an action is a public endpoint, whoever calls it.

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { ADMIN_COOKIE, isAdmin, passwordOk, sessionFor } from "@/lib/admin";
import { removeSubmission, setStatus, type Status } from "@/lib/submissions";

const STATUSES: Status[] = ["new", "used", "dismissed"];

export async function login(_: string | null, f: FormData): Promise<string | null> {
  const password = String(f.get("password") ?? "");
  // A slow wrong answer makes guessing expensive.
  if (!passwordOk(password)) { await new Promise(r => setTimeout(r, 1000)); return "That's not it."; }
  (await cookies()).set(ADMIN_COOKIE, sessionFor(password)!, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin", maxAge: 30 * 86400,
  });
  return null;
}

export async function logout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
}

export async function mark(f: FormData) {
  if (!(await isAdmin())) return;
  const status = STATUSES.find(s => s === f.get("status"));
  if (status) await setStatus(String(f.get("id")), status);
  refresh();
}

export async function remove(f: FormData) {
  if (!(await isAdmin())) return;
  await removeSubmission(String(f.get("id")));
  refresh();
}
