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
battery_began=$(date +%s)
# The node checks take a root and join paths onto it, so they need the one
# this machine's node understands rather than the shell's.
root=$(pwd -W 2>/dev/null || pwd)
bad=0

# THE CHECKS RUN AT ONCE AND ARE REPORTED IN ORDER.
#
# Every check here is its own process over its own inputs, so the only thing
# that made them wait for each other was this file. Run one after another they
# took about seventy seconds on eight cores with seven of them idle, and the
# two slowest, the engine suite and engine-args-lifecycle, overlap for free.
#
# ORDER IS THE REPORT'S, NOT THE FINISHING ORDER. Each check writes its answer
# to a file named after it, and the report is printed by walking the list, so
# the output reads the same whichever finishes first and a diff between two
# runs is about the checks rather than about the scheduling.
results=$(mktemp -d) || exit 1
trap 'rm -rf "$results"' EXIT
# ONE NAME PER LINE, BECAUSE HALF THE NAMES HOLD A SPACE. Kept in one
# space-separated string, "go test mcp" reported as three checks that never
# ran, and the battery answered ten failures on a green tree.
order=""

# slug answers the file name a check's answer is written to.
slug() {
  printf '%s' "$1" | tr ' /' '__'
}

say() {
  printf '%-16s %s\n' "$1" "$2"
}

# start runs a check in the background, into its own answer file.
start() {
  name=$1
  shift
  order="$order$name
"
  (
    began=$(date +%s)
    out=$("$@" 2>&1)
    code=$?
    took=$(( $(date +%s) - began ))
    # The answer file holds the verdict on its first line and the tail this
    # report prints underneath, so nothing has to be re-run to say what broke.
    # EACH CHECK SAYS HOW LONG IT TOOK, so the battery's length is asked of
    # the report rather than guessed at, and the slow lane names itself.
    if [ $code -eq 0 ]; then
      printf 'ok   %3ss  %s\n' "$took" "$(printf '%s' "$out" | tail -1)"
    else
      printf 'FAIL %3ss  %s\n' "$took" "$(printf '%s' "$out" | tail -3)"
    fi
  ) >"$results/$(slug "$name")" 2>&1 &
}

# report waits for every started check and prints them in the order started.
report() {
  wait
  printf '%s' "$order" | while IFS= read -r name; do
    [ -n "$name" ] || continue
    file="$results/$(slug "$name")"
    if [ ! -f "$file" ]; then
      say "$name" "FAIL it wrote no answer, so it did not run"
      echo x >>"$results/.bad"
      continue
    fi
    answer=$(cat "$file")
    case $answer in
      FAIL*) echo x >>"$results/.bad" ;;
    esac
    say "$name" "$answer"
  done
  # THE COUNT COMES BACK OUT OF A FILE. The loop above runs in a pipeline, so
  # it is its own shell and anything it adds to bad is lost when it ends.
  if [ -f "$results/.bad" ]; then
    bad=$((bad + $(wc -l <"$results/.bad")))
  fi
}

# run keeps the one-at-a-time lane, for a check the rest depend on.
run() {
  name=$1
  shift
  began=$(date +%s)
  out=$("$@" 2>&1)
  code=$?
  took=$(( $(date +%s) - began ))
  if [ $code -eq 0 ]; then
    say "$name" "ok   $(printf '%3ss' "$took")  $(printf '%s' "$out" | tail -1)"
  else
    bad=$((bad + 1))
    say "$name" "FAIL $(printf '%3ss' "$took")  $(printf '%s' "$out" | tail -3)"
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
# THE BUILD IS STAMPED, the way the installer stamps it. An engine that says
# unstamped cannot tell a window which code it runs, and the check that a
# running engine is older than the program on disk compares two constants.
# THE STAMP MOVES WITH EVERY BUILD. It was the commit alone, and a tree with
# uncommitted work built the same stamp every time, so an engine on the old
# code read as current and ran the old verbs against the new tree.
stamp="$(git rev-parse --short HEAD 2>/dev/null || echo nogit).$(date +%H%M%S)"
build() {
  go build -C src/engine -ldflags "-X main.Build=$stamp" -o ../../.bin/se.next.exe . || return 1
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
  # AND THE TOOL LANE, because mcp-tools drives it and a check that reads a
  # stale binary reports on the tree as it was rather than as it is. It is the
  # door an agent uses, and it drifted from the engine for want of a build here
  # and a check after it.
  go build -C src/mcp -o ../../.bin/se-mcp.exe . || return 1
  # AND THE ENGINE'S TEST BINARY, ONCE. Linking a cgo binary is the slow part
  # of the suite, so it is a fixture made here and run below in two halves
  # at once, each half over trees of its own.
  go test -C src/engine -c -o ../../.bin/se.test.exe . || return 1
}

# engine_tests runs one half of the engine suite off the test binary the
# build made. The halves are by name, and together they are every test.
engine_tests() {
  cd src/engine && SE_ENGINE="$root/.bin/se.exe" ../../.bin/se.test.exe -test.run "$1"
}

# THE C COMPILER THE INSTALLER PUT HERE, FOR EVERY GO COMMAND BELOW. The
# engine's SQLite is C, and the installer writes the compiler it pinned into
# cgo.env under the per-user data folder. A battery that built with whatever
# compiler PATH happened to hold would test a different program from the one
# the installer builds. The file is two lines, KEY=value, and a quoted value is
# read as one.
cgo_env=""
if [ -n "$LOCALAPPDATA" ]; then
  cgo_env="$LOCALAPPDATA/quackitect/cgo.env"
else
  cgo_env="${XDG_DATA_HOME:-$HOME/.local/share}/quackitect/cgo.env"
fi
if [ -f "$cgo_env" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    case $line in
      CC=*) CC=${line#CC=}; CC=$(printf '%s' "$CC" | sed 's/^"\(.*\)" cc$/\1 cc/'); export CC ;;
      CGO_ENABLED=*) CGO_ENABLED=${line#CGO_ENABLED=}; export CGO_ENABLED ;;
      GOFLAGS=*) GOFLAGS=${line#GOFLAGS=}; export GOFLAGS ;;
    esac
  done <"$cgo_env"
else
  echo "no cgo.env at $cgo_env: run util/setup/install first, so the builds have the compiler the installer pins"
  exit 1
fi

# gofmt_clean fails when gofmt would change anything, and says what.
#
# THE LINE ENDING IS NOT A FORMATTING FINDING. This checkout converts line
# endings on the way out, so a file can carry a carriage return that the
# index does not, and gofmt reports every such file as one it would change.
# Each file is read with the carriage returns taken off, so what is judged is
# what git holds and what the formatter cares about.
gofmt_clean() {
  # ONE PROCESS OVER THE TREE FIRST. A pass per file cost forty seconds
  # under the battery's load, for a question gofmt answers in one.
  bad=""
  for f in $(gofmt -l "$@"); do
    # A file gofmt names may be one that only carries carriage returns, so
    # it is asked again with them taken off, and only that answer counts.
    if [ -n "$(tr -d '\r' <"$f" | gofmt -l)" ]; then
      bad="$bad$f
"
    fi
  done
  if [ -n "$bad" ]; then
    printf '%s' "$bad"
    echo "gofmt would change the files above"
    return 1
  fi
  echo "gofmt has nothing to change"
}

# THE BUILD GOES FIRST AND ALONE. Every check after it reads .bin/se.exe or the
# sources it just compiled, so this is the one that cannot overlap.
run "go build" build

# THE ENGINE THAT LIVES RUNS THE VERBS, so the checks below need one over
# this tree, and one on the build that was just made. An engine on an older
# build would run the old verbs against the new tree and report on neither.
# So a stale engine is asked to stop, and one is woken on the new build.
engine_up() {
  running=$(grep -o '"build": *"[^"]*"' .se/engine.json 2>/dev/null | sed 's/.*"\([^"]*\)"$/\1/')
  if [ -n "$running" ] && [ "$running" != "$stamp" ]; then
    echo "an engine on $running is running and the build is $stamp, so it is asked to stop"
    .bin/se.exe --stop --work . >/dev/null 2>&1 || true
    i=0
    while [ $i -lt 50 ] && [ -f .se/engine.json ]; do i=$((i + 1)); sleep 0.1; done
  fi
  printf '{"hook_event_name":"UserPromptSubmit","cwd":"%s"}' "$root" | .bin/se.exe hook --method . --wake
  grep -q '"socket"' .se/engine.json 2>/dev/null && echo "an engine on $stamp answers"
}
run "engine up" engine_up

# THE STORY IS IN THE BATTERY. The self-test produces a copy, drives a project
# with it and has the vehicle make a project of its own. It was run by hand
# and only by hand, and it stood red for a day while every submission cited a
# green battery. It runs against a redirected register in a temporary tree,
# so it can overlap with everything else here.
start "se selftest" .bin/se.exe --selftest
# THE SUITE DRIVES THE ENGINE THIS BATTERY JUST BUILT, rather than linking a
# second one of its own. The link of a cgo engine is the slow part of the
# suite under load, and the code is the same code.
# The halves are the tests whose names start with an A, which is most of
# them, and the rest. Both run off the one binary the build linked.
start "go test a" engine_tests '^TestA'
start "go test rest" engine_tests '^Test[^A]'
start "go test mcp" go test -C src/mcp -count=1 ./...
start "go test viewer" go test -C src/viewer -count=1 ./...
start "go test setup" go test -C util/setup -count=1 ./...
# THE TOOLS THE GO GUIDANCE NAMES, RUN HERE RATHER THAN REMEMBERED. gofmt
# prints the files it would change and exits zero either way, so the check is
# that it printed nothing.
start "gofmt" gofmt_clean src/engine src/mcp src/viewer util/setup util/checks/trycmd
start "go vet" go vet -C src/engine ./...
start "go vet mcp" go vet -C src/mcp ./...
start "go vet viewer" go vet -C src/viewer ./...
start "go vet setup" go vet -C util/setup ./...
start "se lint" .bin/se.exe lint
# A CHECK THAT IS NOT THERE IS A FAILURE, NOT A SKIP.
#
# This used to skip a missing one and go on saying all ok. Point it at a folder
# holding five of the twelve and it answered all ok, exit 0, having said nothing
# about the seven it did not run. Any sweep, or any accidental deletion, shrinks
# the battery in silence while every submission goes on citing a green run.
for c in render-check drive-editor drawn-classes-have-rules engine-args engine-args-lifecycle engine-spawns liveness one-look panel-icons no-loose-glyphs no-loose-spawns no-lone-escape checks-live-in-the-method engine-spawns-catches panel-is-handed-the-state panel-says-holding drive-panel burndown burndown-derives-nothing tests-name-no-token mcp-tools; do
  if [ -f "util/checks/$c.mjs" ]; then
    start "$c" node "util/checks/$c.mjs" "$root"
  else
    bad=$((bad + 1))
    say "$c" "FAIL it is not there, so it did not run"
  fi
done

report

took=$(( $(date +%s) - battery_began ))
if [ "$bad" -eq 0 ]; then
  echo "all ok, ${took}s wall clock"
else
  echo "$bad failed, ${took}s wall clock"
fi
exit $bad
