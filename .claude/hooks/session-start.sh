#!/usr/bin/env sh
# THE WAKE. A box with no button starts its own engine, and says where it is.
#
# On a desktop the person presses start, and the extension builds what is
# missing, starts the engine, opens the log window and hands the agent its
# first instruction. A cloud session has no extension and no button, and the
# agent is already running by the time anything here can act.
#
# So this does what nothing else on a cloud box can do. It says which commit
# the box is on, against origin, because a session was told it was current and
# was not, and nothing on the box could show either side. It hands the agent
# the card for a box nobody sits beside. And it starts the engine, without
# which the guard appends to a log that is not there.
#
# WHAT IT PRINTS, THE AGENT READS. The harness adds a SessionStart hook's
# standard output to the agent's context, so every line here is a line the
# agent begins its first turn holding.
#
# IT NEVER STARTS THE AGENT, and it never speaks to one. Idle is still where
# a desktop session rests, because on a desktop this returns before it has
# done anything at all.

set -eu

here=${CLAUDE_PROJECT_DIR:-$PWD}
cd "$here"

# THE ONE PLACE THIS BELONGS. SessionStart fires on every host, and where the
# box is comes off one table, util/cage/hosts.json, through the one door that
# reads it. A desk returns here.
node util/cage/host.mjs --cloud || exit 0

say() { echo "quackitect: $*"; }

# THE COMMIT, SAID OUT LOUD, AGAINST ORIGIN. The cloud clones the tip of the
# branch as it stood when the session was made, and a person who pushed a
# minute later has no way to tell. So the box asks origin and says both.
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)
head=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)
say "this is $(node util/cage/host.mjs --say), on commit $head of $branch"
if [ "$branch" != HEAD ] && git fetch -q origin "$branch" 2>/dev/null; then
  remote=$(git rev-parse --short "origin/$branch")
  if [ "$remote" = "$head" ]; then
    say "origin/$branch is $remote too: this clone is current"
  elif git merge-base --is-ancestor HEAD "origin/$branch" 2>/dev/null && [ -z "$(git status --porcelain)" ]; then
    # BEHIND, AND CLEAN, SO IT MOVES. A clone behind origin is a box working
    # on a tree the person has already left, and every finding it makes is
    # about the past.
    if git merge -q --ff-only "origin/$branch" 2>/dev/null; then
      say "origin/$branch was $remote and this clone was behind: fast-forwarded from $head. Programs built from the old tree are older than their source now, and the next ./RUNME.sh call rebuilds them."
    else
      say "origin/$branch is $remote and this clone is on $head, and the fast-forward failed, so nothing was moved. Say so in your first message."
    fi
  else
    say "origin/$branch is $remote and this clone is on $head: they differ and it is not a fast-forward, so nothing was moved. Say so in your first message."
  fi
else
  say "origin could not be asked about $branch, so whether this clone is current is unknown. Say so in your first message."
fi

# THE CARD FOR A BOX NOBODY SITS BESIDE.
cat util/cage/cloud-runner.md

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
  say "nothing is built here yet. The tool lane is building it, and .se/lane.out says how far it got."
  i=0
  while [ $i -lt 100 ]; do
    [ -x "$here/.bin/se" ] && break
    i=$((i + 1))
    sleep 0.2
  done
fi
[ -x "$here/.bin/se" ] || { say "no engine yet, so this session starts with no record and nothing guarding it"; exit 0; }

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
say "the engine did not report ready"
