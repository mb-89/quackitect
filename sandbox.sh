#!/bin/sh
# Run a command where the agent sees its own run and nothing of the future.
#
#   sandbox.sh <run_dir> <command...>
#
# Private mount and PID namespaces (unshare): the run folder stays, the toolchains and the
# Go caches stay, and every place that holds the repository's future or another run is
# covered by an empty tmpfs:
#   /tmp/claude-0            every session scratchpad, the benchmark's mirror with full history
#   /home/user/quackitect    the owner's checkout, full history
#   /root/.claude*           the parent session's transcripts and config
#   /root/.ccr/sessions      the parent session's GitHub client
#   the batch folder         every other run of the batch
# The agent's own processes are the only ones it sees, so a pgrep or pkill in one run never
# reaches another. PID 1 of the namespace is reaper.py, which reaps orphans as an init does.
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
run=$1
shift
keep=/mnt/qb-keep-$$
mkdir -p "$keep"
export REAPER="$here/reaper.py"
exec unshare --mount --propagation private --pid --fork --mount-proc sh -c '
  set -eu
  run=$1; keep=$2; shift 2
  cp "$REAPER" "$keep.reaper.py" 2>/dev/null || true
  mount --bind "$run" "$keep"
  batch=$(dirname "$run")
  for d in /tmp/claude-0 /home/user/quackitect /root/.claude "$batch"; do
    if [ -d "$d" ]; then mount -t tmpfs -o size=4g none "$d"; fi
  done
  for f in /root/.claude.json; do
    if [ -f "$f" ]; then mount --bind /dev/null "$f"; fi
  done
  if [ -d /root/.ccr/sessions ]; then mount -t tmpfs none /root/.ccr/sessions; fi
  mkdir -p "$run"
  mount --bind "$keep" "$run"
  cd "$run/quackitect"
  exec python3 -I "$keep.reaper.py" "$@"
' sh "$run" "$keep" "$@"
