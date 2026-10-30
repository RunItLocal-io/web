"use client";

import { useSearchParams } from "next/navigation";

const WHY: Record<string, string> = {
  forbidden: "You signed in, but you're not in the Admins group in authentik.",
  denied: "Authentik didn't let that sign-in through.",
  expired: "That sign-in took too long or came back twice. Try again.",
  failed: "Couldn't finish signing in with authentik. Try again.",
};

export default function Login() {
  const error = useSearchParams().get("error");
  return (
    <div className="card panel admin-login">
      <p className="small">Admins sign in with their darkcompute account.</p>
      {/* A plain link, not next/link: /admin/login is a route handler that redirects to authentik. */}
      <div className="btns"><a className="btn" href="/admin/login">Sign in with authentik</a></div>
      <div role="status">{error && <p className="msg err">{WHY[error] ?? WHY.failed}</p>}</div>
    </div>
  );
}
