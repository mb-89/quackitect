#!/bin/sh
# Publish this folder to its branch: a fresh orphan repository here, pushed without force.
#
#   sh publish.sh "<commit message line>"
#
# Copies the mining and validation outputs into data/, redacts e-mail-shaped strings, refuses
# to go on if scrub.py still finds a secret, then commits and pushes to bench/2026-10-10. A
# later publish adds a commit on top; nothing is ever force-pushed, and main is never touched.
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$here"
work=${BENCH_WORK:-$here/../bw}
branch=bench/2026-10-10
remote=https://github.com/mb-89/quackitect.git
msg=${1:-"bench: results"}

mkdir -p data
for f in candidates2.jsonl:candidates.jsonl val2.jsonl:validation-1rep.jsonl val-probe.jsonl:validation-probe.jsonl \
         val3.jsonl:validation-3rep.jsonl dryseed.jsonl:v5-setup-dryrun.jsonl dryseed2.jsonl:v5-setup-dryrun-2.jsonl; do
  src=${f%%:*}; dst=${f##*:}
  [ -f "$work/$src" ] && cp "$work/$src" "data/$dst"
done
rm -rf __pycache__ sigs/benchsigs

python3 scrub.py --fix "$here"

if [ ! -d .git ]; then
  git init -q -b "$branch"
  git remote add origin "$remote"
fi
cat > .gitignore <<'EOF'
__pycache__/
*.pyc
EOF
git add -A
# The commit identity is the no-reply address the attribution names; it is put together here so
# that no file of this folder carries an address.
at=@
noreply="noreply${at}anthropic.com"
git -c user.name=Claude -c user.email="$noreply" commit -q -m "$msg" \
  -m "Co-Authored-By: Claude Opus 5.5 <$noreply>
Claude-Session: https://claude.ai/code/session_018ewcHNs7cmUKJkYdUCoXqn" || echo "nothing new to commit"
git push origin "HEAD:refs/heads/$branch"
git log --oneline -3
