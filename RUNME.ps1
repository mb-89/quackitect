# RUNME. The one command that always works.
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

if ($command) {
  $cmd = Join-Path $here $command
  if (-not (Test-Path $cmd) -and $install) {
    Write-Host "not built yet - installing" -ForegroundColor Cyan
    & (Join-Path $here $install)
  }
  if (-not (Test-Path $cmd)) { Write-Error "still no $cmd after installing"; exit 1 }
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
& $engine --work $here @args
exit $LASTEXITCODE
