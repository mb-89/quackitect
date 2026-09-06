#!/bin/sh
# Put one commit of mine on the branch tip and push it, a few times over.
#
# THE LOCAL BRANCH IS NOT MINE ALONE. Other agents commit to the same tree, so
# rebasing the branch replays their unpushed work too and conflicts on it. One
# cherry-pick carries only the commit named.
#
# IT LIVES IN THE METHOD, WHICH GIT CARRIES. Rule 12 of behaviour tells every
# agent to push through this door, and the door sat in .se/scratchpad, which
# the root gitignore holds and no commit reaches.
#
# AND IT DOES NOT LIVE IN util/checks. The engine's test guard reads a path
# under that folder in an interpreter's arguments as a check about to run, so
# the door landed there and was refused the moment anyone opened it.
#
#   sh util/git/cherrypush.sh <commit>
commit="$1"
cd "$(git rev-parse --show-toplevel)" || exit 1
# THE PROXY MOVES WHEN THE CONTAINER RESTARTS, so a box that keeps a helper for
# it is asked which port is live. A box with none goes on with what is set.
P=""
[ -f .se/scratchpad/proxy.sh ] && P=$(sh .se/scratchpad/proxy.sh)
[ -n "$P" ] && export HTTPS_PROXY="$P" https_proxy="$P"
wt=/tmp/cp-$(echo "$commit" | cut -c1-8)
rm -rf "$wt"
git worktree prune
for i in 1 2 3 4 5 6; do
  git fetch origin v4 >/dev/null 2>&1 || { sleep 5; continue; }
  rm -rf "$wt"
  git worktree add --detach "$wt" FETCH_HEAD >/dev/null 2>&1 || { sleep 5; continue; }
  if ! git -C "$wt" cherry-pick "$commit"; then
    git -C "$wt" cherry-pick --abort 2>/dev/null
    echo "CHERRY-PICK CONFLICT on try $i"
    exit 2
  fi
  if git -C "$wt" push origin HEAD:v4; then
    echo PUSHED
    git -C "$wt" log --oneline -1
    exit 0
  fi
  sleep 3
done
echo "GAVE UP"
exit 1
