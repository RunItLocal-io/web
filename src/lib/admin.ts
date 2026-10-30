// The login for /admin is authentik: /admin/login sends a person there, /admin/callback takes the answer back, and
// only a member of ADMIN_GROUP gets a session. Authentik's application "runitlocal-admin" is bound to that group as
// well, so a non-member is refused there first and here second.
//
// The session cookie is the person's name and an expiry, signed with SESSION_SECRET. Changing that secret signs
// every browser out. Nothing here holds a password.

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "runitlocal_admin";
export const STATE_COOKIE = "runitlocal_oidc";
const SESSION_DAYS = 7;

const env = (k: string, d = "") => process.env[k] || d;
const issuer = () => env("OIDC_ISSUER", "https://auth.darkcompute.io/application/o/runitlocal-admin/");
export const clientId = () => env("OIDC_CLIENT_ID");
export const clientSecret = () => env("OIDC_CLIENT_SECRET");
const secret = () => env("SESSION_SECRET");
export const adminGroup = () => env("ADMIN_GROUP", "Admins");
export const callbackUrl = () => env("PUBLIC_URL", "https://runitlocal.io") + "/admin/callback";

export const adminEnabled = () => !!clientId() && !!clientSecret() && secret().length >= 32;

type Discovery = { issuer: string; authorization_endpoint: string; token_endpoint: string };
let found: Discovery | null = null;
export async function discovery(): Promise<Discovery> {
  if (found) return found;
  const r = await fetch(issuer() + ".well-known/openid-configuration", { cache: "no-store" });
  if (!r.ok) throw new Error(`authentik discovery answered ${r.status}`);
  return (found = await r.json());
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");
function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** A signed value, payload.signature, that stops being valid after `seconds`. */
export function seal(data: object, seconds: number) {
  const v = b64(JSON.stringify({ ...data, exp: Math.floor(Date.now() / 1000) + seconds }));
  return `${v}.${sign(v)}`;
}
/** The payload of a sealed value, or null when the signature or the expiry is wrong. */
export function unseal<T>(raw: string | undefined): (T & { exp: number }) | null {
  if (!raw || !adminEnabled()) return null;
  const [v, s] = raw.split(".");
  if (!v || !s || !same(s, sign(v))) return null;
  try {
    const d = JSON.parse(Buffer.from(v, "base64url").toString()) as T & { exp: number };
    return d.exp > Date.now() / 1000 ? d : null;
  } catch { return null; }
}

export const sessionSeconds = SESSION_DAYS * 86400;
export const newState = () => ({ state: b64(randomBytes(24)), verifier: b64(randomBytes(32)) });
export const challenge = (verifier: string) => createHash("sha256").update(verifier).digest("base64url");

/** Who is signed in, or null. Reads the request cookie, so call it behind a Suspense boundary or in a Server Action. */
export async function adminName(): Promise<string | null> {
  return unseal<{ name: string }>((await cookies()).get(ADMIN_COOKIE)?.value)?.name ?? null;
}
export const isAdmin = async () => (await adminName()) !== null;
