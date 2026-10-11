#!/bin/sh
# Keep the disk from filling while a batch runs: the shared Go build cache grows by every tree
# the agents and graders compile (60 bases, each a few hundred MB of packages), and a full disk
# turns a grade into "no space left on device". Every minute: below 8 GB free, empty the cache.
# A build that loses an entry mid-way recompiles it.
log=${1:-/dev/null}
while true; do
  avail=$(df -k / | awk 'NR==2 {print $4}')
  if [ "$avail" -lt 8000000 ]; then
    echo "$(date -u +%FT%TZ) $((avail / 1024)) MB free: emptying the Go build cache" >> "$log"
    go clean -cache >> "$log" 2>&1
    find /tmp -maxdepth 1 -name 'go-build*' -mmin +60 -exec rm -rf {} + 2>/dev/null
  fi
  sleep 60
done
