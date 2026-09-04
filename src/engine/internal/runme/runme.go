package main

import "runtime"

// THE RUNME SCRIPT.
//
// It is short on purpose: a person has to be able to read the whole of it and
// see that it does nothing clever. Everything it needs is in .se/runme.json,
// which is data.
//
// Two shapes. A vehicle names its own command and how to build it. A project
// names the copy that drives it, and the register turns that into a place.

func runmeScript() string {
	if runtime.GOOS == "windows" {
		return runmePowerShell
	}
	return runmeShell
}

const runmePowerShell = `# RUNME. The one command that always works.
#
# It installs what has to be installed, then hands every argument through to
# the command line interface. What that interface is written in is not this
# script's business: .se\runme.json says what to run.
#
#   .\RUNME.ps1 --version
$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$spec = Join-Path $here ".se\runme.json"

if (-not (Test-Path $spec)) {
  Write-Error "This folder has no .se\runme.json, so it is not a project yet."
  exit 1
}
$r = Get-Content $spec -Raw | ConvertFrom-Json

# A project carries the paths for the platform it was made on. The method
# carries both, because it has to install on a machine it was not made on.
$command = if ($r.command_windows) { $r.command_windows } else { $r.command }
$install = if ($r.install_windows) { $r.install_windows } else { $r.install }

function All-Copies {
  $dirs = if ($env:SE_REGISTRY) { $env:SE_REGISTRY -split ";" } else { @(Join-Path $env:USERPROFILE ".se") }
  $out = @()
  foreach ($d in $dirs) {
    $reg = Join-Path $d "registry.json"
    if (-not (Test-Path $reg)) { continue }
    foreach ($e in (Get-Content $reg -Raw | ConvertFrom-Json)) {
      if (Test-Path $e.method_root) { $out += $e.method_root }
    }
  }
  return $out
}

function Resolve-Driver($id) {
  # A project names the copy that drives it. The register turns that identity
  # into a place, so either tree can be moved or renamed.
  $dirs = if ($env:SE_REGISTRY) { $env:SE_REGISTRY -split ";" } else { @(Join-Path $env:USERPROFILE ".se") }
  foreach ($d in $dirs) {
    $reg = Join-Path $d "registry.json"
    if (-not (Test-Path $reg)) { continue }
    foreach ($e in (Get-Content $reg -Raw | ConvertFrom-Json)) {
      if ($e.id -eq $id -and (Test-Path $e.method_root)) { return $e.method_root }
    }
  }
  return $null
}

function Build-It($install, $cmd, $why) {
  # A FAILED BUILD REFUSES OUT LOUD. Falling back to the binary already in
  # .bin runs code the source no longer says, and it exits 0, so nobody finds
  # out. Stopping here and naming the build is the whole point.
  $global:LASTEXITCODE = 0
  & (Join-Path $here $install)
  if ($LASTEXITCODE -ne 0) {
    Write-Error "the build failed, so $cmd was not run ($why). Fix the build and run this again."
    exit 1
  }
}

# Newest-Source answers the newest file written under any of the source
# folders, or nothing when none of them is here.
function Newest-Source($sources) {
  $newest = $null
  foreach ($s in ($sources -split " ")) {
    $dir = Join-Path $here $s
    if (-not (Test-Path $dir)) { continue }
    $n = Get-ChildItem -LiteralPath $dir -Recurse -File |
         Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
    if ($n -and (-not $newest -or $n.LastWriteTimeUtc -gt $newest.LastWriteTimeUtc)) { $newest = $n }
  }
  return $newest
}

if ($command) {
  $cmd = Join-Path $here $command
  if (-not (Test-Path $cmd) -and $install) {
    Write-Host "not built yet - installing" -ForegroundColor Cyan
    Build-It $install $cmd "it was never built"
  }
  if (-not (Test-Path $cmd)) { Write-Error "still no $cmd after installing"; exit 1 }
  # A BINARY OLDER THAN ITS SOURCE IS THE WRONG PROGRAM. It runs, and it
  # answers for code that is no longer there. sources says where the source
  # lives; the installer builds everything this tree builds, so one rebuild
  # covers every binary in .bin and not only the one about to run.
  if ($install -and $r.sources) {
    $newest = Newest-Source $r.sources
    if ($newest -and $newest.LastWriteTimeUtc -gt (Get-Item -LiteralPath $cmd).LastWriteTimeUtc) {
      Write-Host "$command is older than its source - rebuilding" -ForegroundColor Cyan
      Build-It $install $cmd "$($newest.FullName) is newer than it"
    }
  }
  & $cmd @args
  exit $LASTEXITCODE
}

$driver = $r.driver
if (-not $driver) {
  # No copy is recorded yet. One copy is not a choice: use it. Several is a
  # choice, and it is made once, from the editor or with --attach.
  $all = @(All-Copies)
  if ($all.Count -eq 1) { $root = $all[0] }
  elseif ($all.Count -eq 0) { Write-Error "no copy of the method is registered on this machine."; exit 1 }
  else {
    Write-Error "more than one copy is on this machine. Start this folder from the editor once, or run: <copy>\.bin\se.exe --attach --work ."
    exit 1
  }
} else {
  $root = Resolve-Driver $driver
  if (-not $root) { Write-Error "the copy that drives this folder ($driver) is not on this machine."; exit 1 }
}
$engine = Join-Path $root ".bin\se.exe"
if (-not (Test-Path $engine)) {
  Write-Host "the driver is not built yet - installing" -ForegroundColor Cyan
  & (Join-Path $root "util\setup\install.ps1") --no-open
}
# The work root rides out of band: an argument added here would sit where
# the verb belongs, and the engine reads the verb as its first argument.
$env:SE_WORK = $here
& $engine @args
exit $LASTEXITCODE
`

const runmeShell = `#!/usr/bin/env sh
# RUNME. The one command that always works.
#
# It installs what has to be installed, then hands every argument through to
# the command line interface. What that interface is written in is not this
# script's business: .se/runme.json says what to run.
#
#   ./RUNME.sh --version
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
spec="$here/.se/runme.json"
[ -f "$spec" ] || { echo "This folder has no .se/runme.json, so it is not a project yet." >&2; exit 1; }

field() { sed -n 's/.*"'"$1"'"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$2" | head -1; }

command_rel=$(field command "$spec")
install_rel=$(field install "$spec")
driver=$(field driver "$spec")
sources_rel=$(field sources "$spec")

# A FAILED BUILD REFUSES OUT LOUD. Falling back to the binary already in .bin
# runs code the source no longer says, and it exits 0, so nobody finds out.
build_it() {
  if ! "$here/$install_rel"; then
    echo "the build failed, so $cmd was not run ($1). Fix the build and run this again." >&2
    exit 1
  fi
}

if [ -n "$command_rel" ]; then
  cmd="$here/$command_rel"
  if [ ! -x "$cmd" ] && [ -n "$install_rel" ]; then
    echo "not built yet - installing"
    build_it "it was never built"
  fi
  [ -x "$cmd" ] || { echo "still no $cmd after installing" >&2; exit 1; }
  # A BINARY OLDER THAN ITS SOURCE IS THE WRONG PROGRAM. It runs, and it
  # answers for code that is no longer there. sources says where the source
  # lives; the installer builds everything this tree builds, so one rebuild
  # covers every binary in .bin and not only the one about to run.
  if [ -n "$install_rel" ] && [ -n "$sources_rel" ]; then
    newer=""
    for s in $sources_rel; do
      if [ -d "$here/$s" ]; then
        newer=$(find "$here/$s" -type f -newer "$cmd" | head -1)
      fi
      if [ -n "$newer" ]; then break; fi
    done
    if [ -n "$newer" ]; then
      echo "$command_rel is older than its source - rebuilding"
      build_it "$newer is newer than it"
    fi
  fi
  exec "$cmd" "$@"
fi

# A project names the copy that drives it. The register turns that identity
# into a place, so either tree can be moved or renamed.
dirs=${SE_REGISTRY:-$HOME/.se}
root=""
IFS=:
for d in $dirs; do
  reg="$d/registry.json"
  [ -f "$reg" ] || continue
  root=$(awk -v id="$driver" '
    /"id"/        { cur_id = $0; sub(/.*"id"[[:space:]]*:[[:space:]]*"/, "", cur_id); sub(/".*/, "", cur_id) }
    /"method_root"/ { mr = $0; sub(/.*"method_root"[[:space:]]*:[[:space:]]*"/, "", mr); sub(/".*/, "", mr);
                      if (cur_id == id) { print mr; exit } }' "$reg")
  [ -n "$root" ] && break
done
unset IFS
if [ -z "$root" ] && [ -z "$driver" ]; then
  # No copy is recorded yet. One copy is not a choice: use it.
  IFS=:
  for d in $dirs; do
    reg="$d/registry.json"
    [ -f "$reg" ] || continue
    all=$(sed -n 's/.*"method_root"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$reg")
    n=$(printf '%s\n' "$all" | grep -c . || true)
    if [ "$n" = "1" ]; then root=$all; fi
  done
  unset IFS
fi
if [ -z "$root" ]; then
  if [ -z "$driver" ]; then
    echo "more than one copy is on this machine, or none. Start this folder from the editor once, or run: <copy>/.bin/se --attach --work ." >&2
  else
    echo "the copy that drives this folder ($driver) is not on this machine." >&2
  fi
  exit 1
fi

engine="$root/.bin/se"
if [ ! -x "$engine" ]; then
  echo "the driver is not built yet - installing"
  "$root/util/setup/install.sh" --profile headless
fi
# The work root rides out of band: an argument added here would sit where
# the verb belongs, and the engine reads the verb as its first argument.
SE_WORK="$here"
export SE_WORK
exec "$engine" "$@"
`
