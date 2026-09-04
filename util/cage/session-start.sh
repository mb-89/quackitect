#!/usr/bin/env sh
# THE WAKE. A box with no button starts its own engine.
#
# On a desktop the person presses start, and the extension builds what is
# missing, starts the engine, opens the log window and hands the agent its
# first instruction. A cloud session has no extension and no button, and the
# agent is already running by the time anything here can act.
#
# So this does the one part of that walk which nothing else can do: the
# engine. Without it the guard appends to a log that is not there, and the
# session leaves no record.
#
# IT NEVER STARTS THE AGENT, and it never speaks to one. Idle is still where
# a desktop session rests, because on a desktop this returns before it has
# done anything at all.

set -eu

# THE ONE PLACE THIS BELONGS. SessionStart fires on every host, so the guard
# is the first line and not an afterthought.
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

here=${CLAUDE_PROJECT_DIR:-$PWD}
cd "$here"

# A FRESH CLONE CARRIES NO BUILT PROGRAMS, AND THE TOOL LANE IS ALREADY
# BUILDING THEM. This ran the installer itself, and the harness starts the tool
# lane before any hook, so on the one box that needs either there were two
# installers over one .bin, each writing the files the other was building. This
# waits on the one that started first instead.
#
# AND IT WAITS FOR A SHORT WHILE ONLY. A hook has a minute at most and a first
# cgo build takes several, so a session that begins mid-build begins without an
# engine, and says so. The wake on the next prompt starts it the moment it is
# there, and the guard answers permitted while it is not.
if [ ! -x "$here/.bin/se" ]; then
  echo "quackitect: nothing is built here yet. The tool lane is building it." >&2
  i=0
  while [ $i -lt 100 ]; do
    [ -x "$here/.bin/se" ] && break
    i=$((i + 1))
    sleep 0.2
  done
fi
[ -x "$here/.bin/se" ] || { echo "quackitect: no engine yet, so this session starts with no record" >&2; exit 0; }

# Detached, because the hook has to return and the engine has to stay. The
# engine refuses to be a second one, so this is safe on every session.
mkdir -p "$here/.se"
nohup "$here/.bin/se" --work "$here" >> "$here/.se/engine.out" 2>&1 < /dev/null &

# WAIT FOR IT, because the cage this session reads is written by the engine
# on start. Returning before that leaves the first tool call guarded by
# whatever the last machine committed.
i=0
while [ $i -lt 50 ]; do
  [ -f "$here/.se/engine.json" ] && exit 0
  i=$((i + 1))
  sleep 0.2
done
echo "quackitect: the engine did not report ready" >&2
