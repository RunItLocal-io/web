"use server";

// Server Actions for /admin. Each one checks the cookie itself: an action is a public endpoint, whoever calls it.

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin";
import { removeSubmission, setStatus, type Status } from "@/lib/submissions";

const STATUSES: Status[] = ["new", "used", "dismissed"];

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
