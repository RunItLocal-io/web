#!/bin/bash
# Run by runitlocal-follow.timer on the guest: when origin/main moves, build it
# and swap it in. A build that fails leaves the running container serving.
set -euo pipefail
cd /opt/runitlocal-web
git fetch -q origin main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] && [ "${1:-}" != "--force" ] && exit 0
git reset -q --hard origin/main
docker compose build web
docker compose --profile tunnel up -d
echo "live: $(git log -1 --format='%h %s')"
