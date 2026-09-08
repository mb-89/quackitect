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
#   sh src/scripts/cherrypush.sh <commit>
commit="$1"
cd "$(git rev-parse --show-toplevel)" || exit 1
# THE PROXY MOVES WHEN THE CONTAINER RESTARTS, so a box that keeps a helper for
# it is asked which port is live. A box with none goes on with what is set.
P=""
[ -f .se/scratchpad/proxy.sh ] && P=$(sh .se/scratchpad/proxy.sh)
[ -n "$P" ] && export HTTPS_PROXY="$P" https_proxy="$P"
# THE BRANCH THIS TREE IS ON IS WHERE THE COMMIT GOES. This door named one
# branch in its fetch and in its push, and read the branch nowhere, so a push
# from a group branch put the work on trunk and answered PUSHED. Its sibling
# land.sh did the same, and four lands went to trunk before anyone looked.
#
# NO BRANCH NAME IS WRITTEN HERE. This script is copied into trees whose trunk
# is called something else, and a name written down is wrong in all of them.
#
# A DETACHED HEAD NAMES NO BRANCH, so there is nowhere to push and this says so.
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ -z "$branch" ] || [ "$branch" = "HEAD" ]; then
  echo "NO BRANCH: this tree is on a detached HEAD, so a push has nowhere to go"
  echo "Check out the branch this commit belongs on, then push again"
  exit 2
fi
wt=/tmp/cp-$(echo "$commit" | cut -c1-8)
rm -rf "$wt"
git worktree prune
for i in 1 2 3 4 5 6; do
  # ORIGIN MAY NOT HAVE SEEN THIS BRANCH YET, and this push is what creates it
  # there. Its base is then the local tip.
  if git fetch origin "$branch" >/dev/null 2>&1; then
    base=FETCH_HEAD
  elif git rev-parse --verify --quiet "refs/heads/$branch" >/dev/null 2>&1; then
    base=$branch
  else
    sleep 5; continue
  fi
  rm -rf "$wt"
  git worktree add --detach "$wt" "$base" >/dev/null 2>&1 || { sleep 5; continue; }
  if ! git -C "$wt" cherry-pick "$commit"; then
    git -C "$wt" cherry-pick --abort 2>/dev/null
    echo "CHERRY-PICK CONFLICT on try $i"
    exit 2
  fi
  # THE DESTINATION IS WRITTEN OUT IN FULL, because HEAD here is detached and
  # git refuses to guess a remote ref that does not exist yet from a bare name.
  if git -C "$wt" push origin "HEAD:refs/heads/$branch"; then
    echo "LANDED ON $branch"
    echo PUSHED
    git -C "$wt" log --oneline -1
    exit 0
  fi
  sleep 3
done
echo "GAVE UP"
exit 1
