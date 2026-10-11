#!/bin/bash
# The client the harness itself calls (the check's types and plugin parts, the commit door's cold
# probe), pinned to the version CI pins. Every call's output is copied into the run's meter, so a
# model call the harness makes outside the agent's own session still lands in the run's cost.
real=/tmp/qbtools/node_modules/.bin/claude
if [ -n "${BENCH_METER:-}" ]; then
  mkdir -p "$(dirname "$BENCH_METER")" 2>/dev/null
  "$real" "$@" | tee -a "$BENCH_METER.$$.jsonl"
  exit "${PIPESTATUS[0]}"
fi
exec "$real" "$@"
