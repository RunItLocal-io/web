#!/bin/bash
# Run by runitlocal-follow.timer on the guest: when origin/main moves, build it
# and swap it in. A build that fails leaves the running container serving, and
# the next run tries again: .live holds the commit that last went live, not the
# checkout, which moves before the build.
# Braced so bash reads it all before the reset rewrites this file.
{
set -euo pipefail
cd /opt/runitlocal-web
up() { docker compose --profile tunnel up -d --remove-orphans; }
git fetch -q origin main
want=$(git rev-parse origin/main)
if [ "$(cat .live 2>/dev/null)" = "$want" ] && [ "${1:-}" != "--force" ]; then
  up  # nothing new, but bring back anything that stopped
  exit 0
fi
git reset -q --hard "$want"
if ! docker compose build web; then
  up
  echo "build failed at ${want:0:7}; still serving $(cat .live 2>/dev/null | cut -c1-7)" >&2
  exit 1
fi
up
echo "$want" > .live
echo "live: $(git log -1 --format='%h %s')"
exit 0
}
