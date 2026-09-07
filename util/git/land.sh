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
# THE PROXY MOVES WHEN THE CONTAINER RESTARTS, and HTTPS_PROXY goes on naming
# the port it had before. Every push then fails to connect, and a box that keeps
# working loses everything it has not pushed. Six archived notes went that way.
#
# MEASURED, 2026-09-07. HTTPS_PROXY named port 43603 and nothing listened there.
# The live proxy was at 32897, and the same fetch answered at once against it.
#
# IT WAS A HELPER UNDER .se/scratchpad, which git carries nowhere, so the
# mechanism was absent on every fresh box and on this one after the restart.
# The proxy is asked where it is instead: it answers on its own port and
# nowhere else, so a candidate is tested rather than believed.
proxyAnswers() {
  [ -n "$1" ] || return 1
  curl -s -o /dev/null --max-time 2 --noproxy '*' \
    "http://127.0.0.1:$1/__agentproxy/status" 2>/dev/null
}
thePortIn() { echo "$1" | sed -n 's|.*:\([0-9][0-9]*\)/*$|\1|p'; }

# A DESK NAMES NO PROXY, and asks nothing. A variable that already names the
# live one is left alone and says nothing, because a line on every land is noise
# and noise is what teaches an agent to stop reading.
was=$(thePortIn "$HTTPS_PROXY")
if [ -n "$was" ] && ! proxyAnswers "$was"; then
  # THE CA BUNDLE SAYS WHERE THE PROXY KEEPS ITS OWN NOTES, so that folder is
  # followed rather than written down here. Its README names the live port.
  ccr=/root/.ccr
  [ -n "$CURL_CA_BUNDLE" ] && ccr=$(dirname "$CURL_CA_BUNDLE")
  now=$(sed -n 's|.*127\.0\.0\.1:\([0-9][0-9]*\).*|\1|p' "$ccr/README.md" 2>/dev/null | head -1)
  # NOTHING ANSWERING ANYWHERE STILL PUSHES, with what it was given. A land that
  # stopped here would break every box to fix one.
  if [ "$now" != "$was" ] && proxyAnswers "$now"; then
    echo "PROXY MOVED TO $now, AND HTTPS_PROXY STILL NAMED $was"
    export HTTPS_PROXY="http://127.0.0.1:$now" https_proxy="http://127.0.0.1:$now"
  fi
fi
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
