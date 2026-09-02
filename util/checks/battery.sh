#!/bin/sh
# EVERY CHECK IN THIS TREE, RUN AND REPORTED AS IT ANSWERS.
#
# A submission was rejected for naming a command in its evidence that had not
# been run against the tree being submitted. So the whole set runs from one
# place, immediately before submitting, and this prints what each one answered
# rather than what it was expected to answer.
#
#   sh util/checks/battery.sh
#
# It exits non-zero when anything did.
cd "$(dirname "$0")/../.." || exit 1
# The node checks take a root and join paths onto it, so they need the one
# this machine's node understands rather than the shell's.
root=$(pwd -W 2>/dev/null || pwd)
bad=0

say() {
  printf '%-16s %s\n' "$1" "$2"
}

run() {
  name=$1
  shift
  out=$("$@" 2>&1)
  if [ $? -eq 0 ]; then
    say "$name" "ok   $(printf '%s' "$out" | tail -1)"
  else
    bad=$((bad + 1))
    say "$name" "FAIL $(printf '%s' "$out" | tail -3)"
  fi
}

# THE ENGINE IS RUNNING WHILE THIS BUILDS IT. Windows refuses to overwrite a
# running executable and allows it to be renamed, so the old one is moved
# aside first. The processes holding it go on running from the moved file and
# the next one to start takes the new one.
# AND A FAILED BUILD MUST NOT LEAVE THE TREE WITH NO ENGINE. Moving the binary
# aside and then failing to build left .bin/se.exe missing, and every agent's
# next pull answered no such file. So the build goes to a name of its own and
# the swap happens only when it succeeded.
# ONE PROGRAM UNDER TWO NAMES, AND THE BUILD KEEPS THEM ONE FILE.
#
# The cage names ./.bin/se, with no extension, because it travels. On Windows
# the engine is se.exe, and installing makes the two names one file with a hard
# link. A build by hand replaced se.exe and left se pointing at whatever was
# there before, and after the merge that was a Linux binary from another
# checkout. sh takes ./.bin/se literally, gets Exec format error, and EVERY hook
# stops firing: the guard, the answer-first refusal, the stop refusal and the
# log. Nothing says so, because the thing that would say so is the hook.
build() {
  go build -C src/engine -o ../../.bin/se.next.exe . || return 1
  if [ -f .bin/se.exe ]; then
    rm -f .bin/se.exe~
    mv .bin/se.exe .bin/se.exe~ || return 1
  fi
  mv .bin/se.next.exe .bin/se.exe || return 1
  # The suffixed name is the build. The plain one is the same file.
  #
  # THE LINK IS MADE BY THE ENGINE AND NOT BY THE SHELL. This shell's ln moved
  # the file rather than linking it, which left se.exe gone and the tree with no
  # engine at all. The engine already knows how to give itself both names, and
  # asking it is one behaviour rather than two.
  .bin/se.exe --link --work . >/dev/null 2>&1 || return 1
}

run "go build" build
run "go test" go test -C src/engine -count=1 ./...
run "go test mcp" go test -C src/mcp -count=1 ./...
run "go test viewer" go test -C src/viewer -count=1 ./...
run "se lint" .bin/se.exe lint
# A CHECK THAT IS NOT THERE IS A FAILURE, NOT A SKIP.
#
# This used to skip a missing one and go on saying all ok. Point it at a folder
# holding five of the twelve and it answered all ok, exit 0, having said nothing
# about the seven it did not run. Any sweep, or any accidental deletion, shrinks
# the battery in silence while every submission goes on citing a green run.
for c in render-check drive-editor drawn-classes-have-rules engine-args engine-args-lifecycle engine-spawns liveness one-look panel-icons no-loose-glyphs no-loose-spawns no-lone-escape checks-live-in-the-method engine-spawns-catches panel-is-handed-the-state panel-says-holding drive-panel burndown burndown-derives-nothing; do
  if [ -f "util/checks/$c.mjs" ]; then
    run "$c" node "util/checks/$c.mjs" "$root"
  else
    bad=$((bad + 1))
    say "$c" "FAIL it is not there, so it did not run"
  fi
done

if [ "$bad" -eq 0 ]; then
  echo "all ok"
else
  echo "$bad failed"
fi
exit $bad
