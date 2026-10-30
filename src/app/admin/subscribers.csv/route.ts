// The podcast list as a CSV, for whoever sends the episodes. Same login as /admin: the cookie's path is /admin, so
// it reaches this route, and without it the answer is 404 rather than a hint that the file exists.

import { isAdmin } from "@/lib/admin";
import { subscribers } from "@/lib/subscribers";

// A leading = + - @ makes a spreadsheet run the cell as a formula; a quote in front stops it.
const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? "'" + v : v).replace(/"/g, '""')}"`;

export async function GET() {
  if (!(await isAdmin())) return new Response("Not found", { status: 404 });
  const rows = (await subscribers()).map(s => [s.at, s.name ?? "", s.email, s.source].map(cell).join(","));
  return new Response(["signed_up_utc,name,email,form", ...rows].join("\r\n") + "\r\n", {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="runitlocal-subscribers.csv"', "cache-control": "no-store" },
  });
}
