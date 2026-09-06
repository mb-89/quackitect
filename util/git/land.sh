#!/bin/sh
# Land named files on the branch tip, exactly as this tree holds them.
#
# THE CLONE IS BEHIND, SO ITS DIFF IS NOT MY CHANGE. A commit made here is a
# diff against a base a hundred commits old, and cherry-picking that onto the
# tip re-adds what the tip already carries: one such push left a guidance
# chapter in the file twice. Copying the file and committing at the tip carries
# what I wrote and nothing else.
#
# IT LIVES BESIDE cherrypush.sh, out of .se and out of util/checks, for the two
# reasons written in that file.
#
#   sh util/git/land.sh "<commit message>" <path> [<path> ...]
# A path this tree no longer holds is removed there.
msg="$1"; shift
cd "$(git rev-parse --show-toplevel)" || exit 1
# THE PROXY MOVES WHEN THE CONTAINER RESTARTS, so a box that keeps a helper for
# it is asked which port is live. A box with none goes on with what is set.
P=""
[ -f .se/scratchpad/proxy.sh ] && P=$(sh .se/scratchpad/proxy.sh)
[ -n "$P" ] && export HTTPS_PROXY="$P" https_proxy="$P"
# THE CLONE FOLLOWS WHAT IT PUSHED. Left where the box woke, its HEAD is the
# wrong baseline for every count taken against it, and git status reads dirty
# whatever has landed, so the stop hook's uncommitted-changes line is red on
# every stop and an agent learns to wave it through.
#
# The paths just landed are staged first. They already hold the pushed content,
# and git refuses to fast-forward over a file it sees as dirty, so without this
# the fast-forward is refused by the very change that was landed. Nothing else
# is staged, and a refused fast-forward puts them back where they were: a file
# this land was not given is left exactly as it was found, dirty or not.
catchup() {
  new="$1"; shift
  for p in "$@"; do
    if [ -f "$p" ]; then
      git add -- "$p"
    else
      git rm --quiet --cached --ignore-unmatch -- "$p" >/dev/null 2>&1
    fi
  done
  if git merge --ff-only "$new" >/dev/null 2>&1; then
    echo "CLONE AT $(git rev-parse --short HEAD)"
    return 0
  fi
  for p in "$@"; do
    git restore --staged -- "$p" >/dev/null 2>&1
  done
  echo "CLONE LEFT AT $(git rev-parse --short HEAD), holding changes this fast-forward would overwrite"
}

wt=/tmp/land-$$
for i in 1 2 3 4 5; do
  git fetch origin v4 >/dev/null 2>&1 || { sleep 5; continue; }
  rm -rf "$wt"; git worktree prune
  git worktree add --detach "$wt" FETCH_HEAD >/dev/null 2>&1 || { sleep 5; continue; }
  for p in "$@"; do
    if [ -f "$p" ]; then
      mkdir -p "$wt/$(dirname "$p")"
      cp "$p" "$wt/$p"
      git -C "$wt" add -- "$p"
    else
      git -C "$wt" rm --quiet --ignore-unmatch -- "$p" >/dev/null 2>&1
    fi
  done
  if git -C "$wt" diff --cached --quiet; then
    echo "NOTHING TO LAND"; rm -rf "$wt"; git worktree prune; exit 0
  fi
  git -C "$wt" commit -q -m "$msg" || { echo "COMMIT REFUSED"; exit 2; }
  if git -C "$wt" push origin HEAD:v4 >/dev/null 2>&1; then
    landed=$(git -C "$wt" rev-parse HEAD)
    echo PUSHED
    git -C "$wt" log --oneline -1
    rm -rf "$wt"; git worktree prune
    catchup "$landed" "$@"
    exit 0
  fi
  sleep 3
done
echo "GAVE UP"
exit 1
