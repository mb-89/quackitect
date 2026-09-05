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

say() { echo "quackitect: $*"; }

# THE ONE PLACE THIS BELONGS. SessionStart fires on every host, and where the
# box is comes off one table, util/cage/hosts.json, through the one door that
# reads it.
#
# EVERY SESSION IS TOLD WHICH KIND IT IS, and a desk is told here and returns.
# The two kinds are handed different cards, so a session that does not know
# which it is can read the wrong one and follow it. A desk that is told it is a
# desk cannot mistake util/cage/cloud-runner.md for something addressed to it.
if ! node util/cage/host.mjs --cloud; then
  say "this is $(node util/cage/host.mjs --say). The extension starts the engine here, and util/cage/cloud-runner.md is a card for a cloud box and is not addressed to you."
  exit 0
fi

# THE COMMIT, SAID OUT LOUD, AGAINST WHAT THIS CLONE CAME FROM.
#
# The cloud clones the tip as it stood when the session was made, and a person
# who pushed a minute later has a box that is behind and says it is current.
#
# WHICH BRANCH TO ASK ABOUT IS NOT THIS ONE'S NAME. A cloud session works on a
# branch of its own, so origin holds nothing under that name, and asking for it
# answered "unknown" on every cloud box however current the tree was. What the
# clone was made from is the upstream, and origin's own default is the fallback
# for a branch that has none.
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)
head=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)
say "this is $(node util/cage/host.mjs --say), on commit $head of $branch"

upstream=$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)
[ -n "$upstream" ] || upstream=$(git symbolic-ref -q --short refs/remotes/origin/HEAD 2>/dev/null || true)
[ -n "$upstream" ] || { git show-ref -q --verify "refs/remotes/origin/$branch" && upstream="origin/$branch"; }

if [ -z "$upstream" ]; then
  say "nothing on origin is tracked by $branch, so whether this clone is current cannot be decided here. Say so in your first message."
elif ! git fetch -q "${upstream%%/*}" "${upstream#*/}" 2>/dev/null; then
  say "$upstream could not be fetched, so whether this clone is current is unknown. Say so in your first message."
else
  remote=$(git rev-parse --short FETCH_HEAD)
  if [ "$remote" = "$head" ]; then
    say "$upstream is $remote too: this clone is current"
  elif ! git merge-base --is-ancestor HEAD FETCH_HEAD 2>/dev/null; then
    say "$upstream is $remote and this clone is on $head, which is not behind it, so nothing was moved. Say both commits in your first message."
  elif [ -n "$(git status --porcelain)" ]; then
    # BEHIND, AND CARRYING WORK. Moving the tree under an agent that has
    # written to it is how a session loses what it did, so this says it and
    # stops. The agent decides what to do with its own changes.
    say "$upstream is $remote and this clone is on $head, so it is behind. It was NOT moved, because this tree has uncommitted changes. Say so in your first message."
  elif git merge -q --ff-only FETCH_HEAD 2>/dev/null; then
    # THE PULL COMES BEFORE THE ENGINE, and this is the whole reason the wake
    # does it. Below this line the engine is started and the guards come to
    # life, so a tree that moves has already moved by then.
    say "$upstream was $remote and this clone was behind: fast-forwarded from $head to $(git rev-parse --short HEAD). Anything built before now is older than its source, and the next ./RUNME.sh call rebuilds it."
  else
    say "$upstream is $remote and this clone is on $head, and the fast-forward failed, so nothing was moved. Say so in your first message."
  fi
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
