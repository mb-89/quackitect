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
#
# NOTHING IN IT WAITS ON A CLOCK. A check answers whether the program
# behaves, and a number that depends on the machine and its load is not an
# answer to that: a test that waited for the operating system to notice a
# file failed here once for no defect of the program's. Everything about
# time is a benchmark, util/checks/benchmark.sh, run at the retro. The one
# wait left is for the engine this battery starts to finish its start.
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

# why answers the lines of a failed check's output that name the failure.
#
# THE VERDICT WITHOUT THE CAUSE IS ANOTHER RUN, and this battery exists to end
# the re-running. It printed the last three lines of whatever failed, and the
# last three lines of a go test run are the word FAIL three times: the test
# that broke and the message it broke with sit above them. Two failures planted
# in the viewer and setup lanes came back as two lanes failing and nothing
# about why, and the cause had to be fetched by running each lane again by
# hand, one per run, which is the shape this file was rewritten to remove.
# A check that fails says so in a line, so those lines are picked out wherever
# they sit rather than hoped for at the end, and output that names none falls
# back to a longer tail than the three it used to print.
why() {
  said=$(printf '%s' "$1" | grep -E -- '--- FAIL|[^[:space:]]\.(go|mjs|ts|sh|py):[0-9]+|^[[:space:]]*FAIL[[:space:]]|panic:|[Ee]rror:' | head -6)
  [ -n "$said" ] || said=$(printf '%s' "$1" | tail -6)
  printf '%s' "$said"
}

# AS MANY LANES AT ONCE AS THIS MACHINE HAS CORES, AND NEVER MORE.
#
# Every check started at once, which was thirty-nine processes on eight cores,
# and each go test is already parallel inside itself. Nothing was faster for it
# and two things were worse. A go vet over the viewer takes half a second alone
# and thirty-six seconds in the run, all of it waiting for a core. And a test
# carrying a budget went red at sixteen seconds where it takes two, so the suite
# was reporting on the scheduling rather than on the program.
#
# A POOL RATHER THAN A WARM-UP. Compiling everything first, in order, was tried
# and made it slower: the warming joined the critical path and the lanes went on
# competing afterwards. What is scarce is cores, and the answer to that is to
# hand out no more work than there are cores.
#
# THE HEAVIEST ARE STARTED FIRST, because the run is as long as its longest lane
# and a long one started last is time nobody gets back.
# HEADROOM, BECAUSE THIS MACHINE IS NOT IDLE. The resident engine, the editor
# and its language server are all running while the battery does, and claiming
# every core means the lanes fight them as well as each other. One is left.
cores=$(nproc 2>/dev/null || echo 4)
[ "$cores" -gt 2 ] && cores=$((cores - 1))
inflight=0

# A SHELL THAT CANNOT WAIT FOR ONE LANE WAITS FOR ALL OF THEM. wait -n frees a
# slot the moment any lane ends; dash has no such thing, and there it falls back
# to draining the batch, which is slower and just as correct. It is asked once,
# here, rather than guessed from the name of the shell.
if (sleep 0 & wait -n) >/dev/null 2>&1; then waitsForOne=yes; else waitsForOne=no; fi

# gate blocks until a slot is free. The exit status of whatever finished is not
# read: the answer file carries the verdict.
gate() {
  inflight=$((inflight + 1))
  [ "$inflight" -lt "$cores" ] && return 0
  if [ "$waitsForOne" = yes ]; then
    wait -n >/dev/null 2>&1
    inflight=$((inflight - 1))
  else
    wait
    inflight=0
  fi
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
    # The answer file holds the verdict on its first line and the lines that
    # name the failure underneath, so nothing has to be re-run to say what
    # broke.
    # EACH CHECK SAYS HOW LONG IT TOOK, so the battery's length is asked of
    # the report rather than guessed at, and the slow lane names itself.
    if [ $code -eq 0 ]; then
      printf 'ok   %3ss  %s\n' "$took" "$(printf '%s' "$out" | tail -1)"
    else
      printf 'FAIL %3ss  %s\n' "$took" "$(why "$out")"
    fi
  ) >"$results/$(slug "$name")" 2>&1 &
  gate
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
    say "$name" "FAIL $(printf '%3ss' "$took")  $(why "$out")"
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
  # -gcflags=-e LIFTS THE ERROR CAP. The type checker stops after a batch by
  # default, so a sweep of undefined symbols came back one round at a time.
  go build -C src/engine -gcflags=-e -ldflags "-X quackitect/engine/internal/version.Build=$stamp" -o ../../.bin/se.next.exe . || return 1
  # A REPLACED PROGRAM GOES WHERE EVERY REPLACED PROGRAM GOES. .bin holds what
  # this tree ships and .bin/was holds what it used to, and the engine sweeps
  # that folder at every start: one that will not delete is one a process is
  # still running from. It was left beside the shipped programs, so .bin grew a
  # se~, a se~1 and a se.exe.was that nothing ever removed.
  if [ -f .bin/se.exe ]; then
    mkdir -p .bin/was
    rm -f .bin/was/se.exe
    mv .bin/se.exe .bin/was/se.exe || return 1
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
  go build -C src/mcp -gcflags=-e -o ../../.bin/se-mcp.exe . || return 1
  # AND THE ENGINE'S TEST BINARY, ONCE. Linking a cgo binary is the slow part
  # of the suite, so it is a fixture made here and run below in two halves
  # at once, each half over trees of its own.
  go test -C src/engine -gcflags=-e -c -o ../../.bin/se.test.exe . || return 1
}

# engine_tests runs one half of the engine suite off the test binary the
# build made. The halves are by name, and together they are every test.
engine_tests() {
  cd src/engine && SE_ENGINE="$root/.bin/se.exe" ../../.bin/se.test.exe -test.run "$1"
}

# THE RACE DETECTOR, ONCE, OVER THE ENGINE'S OWN SUITE.
#
# WHY IT IS HERE. The engine answers several agents at once, and the token that
# exists because concurrent calls were dropped changed exactly that code. Until
# now nothing in this tree passed -race, so the one class of defect that work
# was about had no instrument at all.
#
# IT JUDGES RACES AND NOT FAILURES. The suite's own verdict is the lane above.
# This lane answers one question, and a test red for its own reasons would hide
# every race report behind it.
#
# MEASURED ON THIS BOX: the race binary links in 11s and the whole suite runs
# under it in 81s, against about 30s uninstrumented. The lane end to end took
# 157s with eight agents on the machine, so it is the longest one here and it
# sets the battery's wall clock. That is the price of the only instrument for
# this class. It builds inside this lane rather than in the serial build, so
# both costs overlap the other lanes.
#
# WHAT WOULD CHANGE THE ANSWER: a battery somebody stops running because it is
# slow. Then this narrows to the tests that start goroutines rather than the
# whole suite, and the comment above says which.
engine_race() {
  go test -C src/engine -gcflags=-e -race -c -o ../../.bin/se.race.test.exe . || return 1
  out=$(cd src/engine && SE_ENGINE="$root/.bin/se.exe" ../../.bin/se.race.test.exe -test.run '.*' 2>&1)
  races=$(printf '%s' "$out" | grep -c 'WARNING: DATA RACE')
  if [ "$races" -gt 0 ]; then
    printf '%s' "$out" | awk '/WARNING: DATA RACE/{on=1} on' | head -40
    echo "the race detector reported $races race(s) in the engine"
    return 1
  fi
  echo "the race detector reported none over the engine's suite"
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
  #
  # THE LIST IS NOT CALLED bad, BECAUSE THE BATTERY'S COUNTER IS. A shell
  # function shares the script's variables, so while this held its findings in
  # a name the counter already had, the only thing keeping the count safe was
  # that gofmt runs through start, in a background subshell, where an
  # assignment cannot reach the parent. Move this to the run lane, where the
  # build and engine-up lanes already sit, and the battery's tally of failures
  # is quietly set to the empty string on every run.
  unformatted=""
  for f in $(gofmt -l "$@"); do
    # A file gofmt names may be one that only carries carriage returns, so
    # it is asked again with them taken off, and only that answer counts.
    if [ -n "$(tr -d '\r' <"$f" | gofmt -l)" ]; then
      unformatted="$unformatted$f
"
    fi
  done
  if [ -n "$unformatted" ]; then
    printf '%s' "$unformatted"
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
#
# A STALE ENGINE IS ASKED TO HAND OVER, NOT TO STOP. Stopping it is what made
# this battery unrunnable from inside the engine: se test with a whole ruling
# ran this script in the engine's own process, and this line then killed the
# process hosting the run. The swap door builds the next engine, waits for the
# calls in flight, and hands over keeping the log session, so a battery started
# by an engine can replace that engine without severing itself.
engine_up() {
  running=$(grep -o '"build": *"[^"]*"' .se/engine.json 2>/dev/null | sed 's/.*"\([^"]*\)"$/\1/')
  if [ -n "$running" ] && [ "$running" != "$stamp" ]; then
    echo "an engine on $running is running and the build is $stamp, so it is asked to hand over"
    # --built, BECAUSE THE BUILD ABOVE IS THE NEW ENGINE. Asking the engine to
    # build as well would put a second stamp on the same code and check nothing.
    .bin/se.exe --swap --built --work . >/dev/null 2>&1 || true
    # THE HANDOVER IS DONE WHEN AN ENGINE ANSWERS ON THE NEW BUILD. The
    # successor writes engine.json for itself, so this waits for the build to
    # change rather than for the file to go.
    i=0
    while [ $i -lt 300 ]; do
      now=$(grep -o '"build": *"[^"]*"' .se/engine.json 2>/dev/null | sed 's/.*"\([^"]*\)"$/\1/')
      [ -n "$now" ] && [ "$now" != "$running" ] && break
      i=$((i + 1)); sleep 0.1
    done
  fi
  printf '{"hook_event_name":"UserPromptSubmit","cwd":"%s"}' "$root" | .bin/se.exe hook --method . --wake
  grep -q '"socket"' .se/engine.json 2>/dev/null || return 1
  # THE START IS THE ONE WAIT: the first scan and the watcher's self-check
  # run once per start, and what they found is read below as a check.
  i=0
  until .bin/se.exe --ping --work . 2>/dev/null | grep -q '"ready":true'; do
    i=$((i + 1)); [ $i -lt 300 ] || return 1; sleep 0.1
  done
  echo "an engine on $stamp answers, scanned and self-checked"
}
run "engine up" engine_up
# THE WATCHER'S SELF-CHECK, READ OFF THE ENGINE. At every start the daemon
# writes a cookie and waits to hear it from the tree's watcher; a tree whose
# watcher is deaf leaves the index untrusted and every reader cold. The
# battery reads what the daemon found rather than waiting on the operating
# system a second time.
engine_watches() { .bin/se.exe --ping --work . | grep -q '"watching":true'; }
run "engine watches" engine_watches

# THE STORY IS IN THE BATTERY. The self-test produces a copy, drives a project
# with it and has the vehicle make a project of its own. It was run by hand
# and only by hand, and it stood red for a day while every submission cited a
# green battery. It runs against a redirected register in a temporary tree,
# so it can overlap with everything else here.
start "se selftest" .bin/se.exe --selftest
# THE SUITE DRIVES THE ENGINE THIS BATTERY JUST BUILT, rather than linking a
# second one of its own. The link of a cgo engine is the slow part of the
# suite under load, and the code is the same code.
# ONE LANE, BECAUSE THE SUITE IS ALREADY PARALLEL INSIDE ITSELF.
#
# It was two shards, and that was right when each lane linked its own cgo
# binary: the link was the slow part and two links beat one. The build makes the
# binary once now, so what a shard buys is nothing and what it costs is real.
#
# MEASURED. The whole suite off the built binary, with the machine to itself,
# takes about thirty seconds. Split five ways under this battery it took a
# hundred and sixty seconds of lane time between them: every shard pays the
# binary's start again, every shard competes with the other four, and every test
# in it already runs in parallel with its siblings. Sharding a suite that is
# parallel inside multiplies the fixed cost and buys back nothing.
# THE HEAVIEST LANE IS STARTED FIRST, and with a race binary to link this is
# now it. The run is as long as its longest lane, so one started late is time
# nobody gets back.
start "race detector" engine_race
start "go test engine" engine_tests '.*'
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
#
# THE BRANCH HEAD LEADS THE LIST, BECAUSE EVERY OTHER LANE JUDGES THIS DISK.
# go vet and go test compile the folder this runs in, where a file written and
# not yet committed is present, so a change half committed reads green here and
# breaks the branch for everyone who clones it. It happened twice in one day on
# v4, at 559fc4a6 and d84810eb, and neither could be seen from the working tree
# that made it. the-branch-head-builds reads the head into a folder of its own
# and builds there, so what is judged is what git carries. It was in this list
# at e3576f0f and went out of it at c193ad19, which is how it came back.
#
# It is first because it is a lane of its own length, and the run is as long as
# its longest lane.
for c in the-branch-head-builds render-check drive-editor drawn-classes-have-rules panel-draws-the-register adapter-decides-no-column engine-args engine-args-lifecycle engine-spawns liveness one-look panel-icons no-loose-glyphs no-loose-spawns no-lone-escape checks-live-in-the-method engine-spawns-catches panel-is-handed-the-state panel-says-holding drive-panel burndown burndown-derives-nothing tests-name-no-token tests-are-not-hotspots mcp-tools lane-answers-cold the-cards-reach-their-box the-travelling-cage-cannot-block scripts-are-lf build-reports-every-error binaries-live-in-bin private-files-have-writers no-private-links refusals-name-a-door a-refusal-names-a-legal-move engine-stops-by-pid windows-say-they-are-here projections-carry-chapters archive-rows-name-an-object notes-say-each-heading-once deleted-notes-have-a-row the-flat-engine-only-shrinks archive-rows-travel the-cage-cites-what-is-here; do
  if [ -f "util/checks/$c.mjs" ]; then
    start "$c" node "util/checks/$c.mjs" "$root"
  else
    bad=$((bad + 1))
    say "$c" "FAIL it is not there, so it did not run"
  fi
done

report

took=$(( $(date +%s) - battery_began ))
# ONE VERDICT LINE, WHATEVER THE OUTCOME. The green branch printed "all ok" and
# batteryPassed reads the last line for a count, so every passing battery went
# into the record as not ok and nothing on either side went red. Two spellings
# of one verdict is what came apart, so there is one, and the count is in it.
echo "$bad failed, ${took}s wall clock"
exit $bad
