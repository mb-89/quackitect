#!/bin/sh
# THE BENCHMARK. Everything about time runs here, at the retro, and nothing
# about time runs in the battery. A number from a benchmark decides only as
# a comparison: two runs on one machine in one sitting, so the machine is
# printed beside the numbers and the run is repeated enough times for the
# noise to show. Save the output beside the retro and compare it with the
# last one there; benchstat reads two of these files if it is installed.
#
#   sh util/checks/benchmark.sh            the engine's benchmarks, six runs each
#   sh util/checks/benchmark.sh -count 3   fewer runs, when a first look is enough
set -e
root=$(cd "$(dirname "$0")/../.." && pwd)
cd "$root"
env=${LOCALAPPDATA:-$HOME/.local/share}/quackitect/cgo.env
if [ -f "$env" ]; then
  . "$env"
  export CC CGO_ENABLED GOFLAGS
fi
count=6
if [ "$1" = "-count" ] && [ -n "$2" ]; then count=$2; fi

echo "machine: $(hostname), $(go env GOOS)/$(go env GOARCH), $(go version | sed 's/^go version //')"
echo "tree:    $(git rev-parse --short HEAD 2>/dev/null || echo 'no git') at $(date -u +%Y-%m-%dT%H:%MZ)"
echo "runs:    $count each"
echo
go test -C src/engine -run '^$' -bench . -benchmem -count "$count" ./...
