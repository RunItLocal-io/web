// The one-person login for /admin. The password is ADMIN_TOKEN; with it unset, /admin stays locked. The cookie holds
// an HMAC of the password, never the password itself, so changing ADMIN_TOKEN signs every browser out.

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "runitlocal_admin";

const token = () => process.env.ADMIN_TOKEN ?? "";
export const adminEnabled = () => token().length >= 12;

/** The cookie value for a password, or null when admin is off. */
export const sessionFor = (password: string) => adminEnabled() ? createHmac("sha256", password).update("runitlocal-admin").digest("hex") : null;

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const passwordOk = (password: string) => adminEnabled() && same(password, token());

/** Reads the request cookie, so call it behind a Suspense boundary or in a Server Action. */
export async function isAdmin() {
  const want = sessionFor(token());
  const have = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!want && !!have && same(have, want);
}
