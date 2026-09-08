#!/bin/sh
# THE BENCHMARK. Everything about time runs here, at the retro, and nothing
# about time runs in the battery. A number from a benchmark decides only as
# a comparison: two runs on one machine in one sitting, so the machine is
# printed beside the numbers and the run is repeated enough times for the
# noise to show. Save the output beside the retro and compare it with the
# last one there; benchstat reads two of these files if it is installed.
#
# THE BATTERY'S LANES ARE THE OTHER HALF OF WHAT A TURN COSTS. The retro asks
# for them ranked and no command answered that, so it was done by reading a
# report by hand. The numbers moved by five seconds between runs, which is
# enough to read a wrong conclusion off.
#
# SO THE ANSWER IS A DIFFERENCE. Each run keeps its lanes under .se/benchmark
# and prints them beside the last run kept there.
#
# THE RANKING IS A MODE OF ITS OWN, so a page already written can be read
# without running anything. The run and the reading are then apart, and the
# reading is the half a check can hold.
#
#   sh src/scripts/checks/benchmark.sh            the engine's benchmarks, then the battery's lanes
#   sh src/scripts/checks/benchmark.sh -count 3   fewer runs of the Go benchmarks
#   sh src/scripts/checks/benchmark.sh --rank <page>   rank a battery page already written
set -e
root=$(cd "$(dirname "$0")/../.." && pwd)
cd "$root"
env=${LOCALAPPDATA:-$HOME/.local/share}/quackitect/cgo.env
if [ -f "$env" ]; then
  . "$env"
  export CC CGO_ENABLED GOFLAGS
fi
kept=.se/benchmark

# theLanes reads a battery page and answers each lane's seconds, longest first,
# with the wall clock among them. A lane starts its own line, and the lines
# under it are what it said.
#
# A LANE NAME HOLDS SPACES. go build, race detector and go test engine are the
# four longest lanes there are, and a rule reading the name as one word dropped
# every one of them and ranked the checks alone.
theLanes() {
  awk '
    /^[^ \t]/ {
      for (i = 2; i <= NF; i++) {
        if (($i == "ok" || $i == "FAIL") && $(i + 1) ~ /^[0-9]+s$/) {
          name = $1
          for (j = 2; j < i; j++) name = name " " $j
          secs = $(i + 1); sub(/s$/, "", secs)
          printf "%s\t%s\n", secs, name
          break
        }
      }
    }
    /wall clock/ {
      for (i = 1; i <= NF; i++) if ($i ~ /^[0-9]+s$/) {
        secs = $i; sub(/s$/, "", secs); printf "%s\twall clock\n", secs
      }
    }
  ' "$1" | sort -rn
}

# against prints this run beside the last one kept here. A lane the last run did
# not carry is said to be new, rather than counted against nothing.
against() {
  if [ -z "$2" ]; then
    echo "no earlier run is kept under $kept, so these numbers stand alone"
    awk -F'\t' 'BEGIN { printf "%8s  %s\n", "seconds", "lane" }
      { printf "%8s  %s\n", $1, $2 }' "$1"
    return
  fi
  echo "against $2"
  awk -F'\t' 'BEGIN { printf "%8s  %8s  %s\n", "seconds", "change", "lane" }
    NR == FNR { was[$2] = $1; next }
    { printf "%8s  %8s  %s\n", $1, ($2 in was) ? sprintf("%+d", $1 - was[$2]) : "new", $2 }
  ' "$2" "$1"
}

count=6
if [ "$1" = "-count" ] && [ -n "$2" ]; then count=$2; fi
if [ "$1" = "--rank" ]; then
  [ -n "$2" ] || { echo "--rank names the battery page to read"; exit 2; }
  page=$2
fi

echo "machine: $(hostname), $(go env GOOS)/$(go env GOARCH), $(go version | sed 's/^go version //')"
echo "tree:    $(git rev-parse --short HEAD 2>/dev/null || echo 'no git') at $(date -u +%Y-%m-%dT%H:%MZ)"
echo "runs:    $count each"
echo
if [ -z "$page" ]; then
  go test -C src/engine -run '^$' -bench . -benchmem -count "$count" ./...
  echo
  mkdir -p "$kept"
  page=$kept/battery-$(date -u +%Y%m%d-%H%M%S).out
  echo "running the battery, whose lanes are ranked below. Its page is $page"
  sh src/scripts/checks/battery.sh > "$page" 2>&1 || true
fi

# THE LAST RUN IS FOUND BEFORE THIS ONE IS WRITTEN, or this one is the last run
# and every number is compared with itself.
mkdir -p "$kept"
was=$(ls -1t "$kept"/lanes-*.tsv 2>/dev/null | head -1 || true)
now=$kept/lanes-$(date -u +%Y%m%d-%H%M%S)-$$.tsv
theLanes "$page" > "$now"
echo
echo "battery lanes, longest first, from $page"
against "$now" "$was"
