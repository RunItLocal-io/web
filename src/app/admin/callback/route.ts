// Authentik sends the person back here with a code. The code is exchanged server to server over TLS with the client
// secret, so the id_token comes straight from authentik and its claims are read as they arrive (OIDC Core 3.1.3.7).
// A session is issued only when the token names this client and ADMIN_GROUP is among the person's groups.

import { cookies } from "next/headers";
import { connection } from "next/server";
import {
  ADMIN_COOKIE, adminEnabled, adminGroup, callbackUrl, clientId, clientSecret, discovery, seal, sessionSeconds, STATE_COOKIE, unseal,
} from "@/lib/admin";

type Claims = { iss?: string; aud?: string | string[]; exp?: number; groups?: string[]; name?: string; preferred_username?: string; email?: string };

export async function GET(req: Request) {
  await connection();
  const back = (error?: string) => Response.redirect(new URL("/admin" + (error ? `?error=${error}` : ""), callbackUrl()), 303);
  if (!adminEnabled()) return back();
  const jar = await cookies();
  const saved = unseal<{ state: string; verifier: string }>(jar.get(STATE_COOKIE)?.value);
  jar.delete({ name: STATE_COOKIE, path: "/admin" });
  const q = new URL(req.url).searchParams;
  if (q.get("error")) return back("denied");
  if (!saved || q.get("state") !== saved.state || !q.get("code")) return back("expired");

  const d = await discovery();
  const r = await fetch(d.token_endpoint, {
    method: "POST", cache: "no-store",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code", code: q.get("code")!, redirect_uri: callbackUrl(),
      client_id: clientId(), client_secret: clientSecret(), code_verifier: saved.verifier,
    }),
  });
  if (!r.ok) return back("failed");
  const idToken = ((await r.json()) as { id_token?: string }).id_token ?? "";
  let c: Claims;
  try { c = JSON.parse(Buffer.from(idToken.split(".")[1] ?? "", "base64url").toString()); } catch { return back("failed"); }
  const aud = Array.isArray(c.aud) ? c.aud : [c.aud];
  if (c.iss !== d.issuer || !aud.includes(clientId()) || !c.exp || c.exp < Date.now() / 1000) return back("failed");
  if (!c.groups?.includes(adminGroup())) return back("forbidden");

  jar.set(ADMIN_COOKIE, seal({ name: c.name || c.preferred_username || c.email || "admin" }, sessionSeconds), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/admin", maxAge: sessionSeconds,
  });
  return back();
}
