// Sends a person to authentik with a fresh state and PKCE verifier, kept in a signed cookie for ten minutes.

import { cookies } from "next/headers";
import { connection } from "next/server";
import { adminEnabled, callbackUrl, challenge, clientId, discovery, newState, seal, STATE_COOKIE } from "@/lib/admin";

export async function GET() {
  await connection();
  if (!adminEnabled()) return Response.redirect(new URL("/admin", callbackUrl()), 303);
  const { state, verifier } = newState();
  (await cookies()).set(STATE_COOKIE, seal({ state, verifier }, 600), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/admin", maxAge: 600,
  });
  const u = new URL((await discovery()).authorization_endpoint);
  u.search = new URLSearchParams({
    response_type: "code", client_id: clientId(), redirect_uri: callbackUrl(), scope: "openid profile email",
    state, code_challenge: challenge(verifier), code_challenge_method: "S256",
  }).toString();
  return Response.redirect(u, 303);
}
