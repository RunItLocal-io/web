"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function Login() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form className="card panel admin-login" action={action}>
      <label htmlFor="admin-pw">Password
        <input id="admin-pw" name="password" type="password" autoComplete="current-password" required />
      </label>
      <div className="btns"><button className="btn" type="submit" disabled={pending}>{pending ? "Checking…" : "Sign in"}</button></div>
      <div role="status">{error && <p className="msg err">{error}</p>}</div>
    </form>
  );
}
