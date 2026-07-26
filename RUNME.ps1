<#
.SYNOPSIS
quackitect v3 — install-check, selftest, and launch.

.DESCRIPTION
Preflight (node/git/ripgrep hard deps), cage install, engine selftests, then
either the caged agent (default) or the Mirror in manual mode.

.PARAMETER Manual
Alias for -Threshold 0. The agent STILL launches in this console - it just
may not enter any state by itself, announces that it is holding, and you
walk the machine from the Mirror (http://localhost:7333). Slide up whenever
you want it to take over; it wakes and continues on its own.

.PARAMETER Threshold
0..1 - which states the AGENT enters by itself (a state's priority must be
<= the threshold). 0: every step is yours, click through in the Mirror.
0.5 (default): the agent does the everyday steps, killers wait for you.
1: fully autonomous. Live-adjustable via the Mirror's slider - a holding
agent is woken by the change.

.PARAMETER Help
Show this help (-h and -? work too).

.EXAMPLE
.\RUNME.ps1
.EXAMPLE
.\RUNME.ps1 -Threshold 0
.EXAMPLE
.\RUNME.ps1 -Manual
#>
[CmdletBinding()]
param(
  [switch]$Manual,
  [ValidateRange(0.0, 1.0)][double]$Threshold = 0.5,
  [switch]$Help
)
if ($Help) {
  Get-Help $PSCommandPath -Detailed
  exit 0
}
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "quackitect v3 - preflight" -ForegroundColor Cyan

# Node >= 22.6 (native TypeScript type stripping - no build step anywhere).
$node = Get-Command node -ErrorAction SilentlyContinue
if ($null -eq $node) {
  Write-Host "node not found. Install Node 22+ (winget install OpenJS.NodeJS.LTS) and re-run." -ForegroundColor Red
  exit 1
}
$nodeVersion = (node --version).TrimStart("v")
if ([version]$nodeVersion -lt [version]"22.6.0") {
  Write-Host "node $nodeVersion is too old - need >= 22.6 for native TS. Update and re-run." -ForegroundColor Red
  exit 1
}
Write-Host "  node $nodeVersion  OK"

# git is a HARD dependency (ref search runs through git grep; v3 is a branch of quack).
$git = Get-Command git -ErrorAction SilentlyContinue
if ($null -eq $git) {
  Write-Host "git not found - it is a hard dependency. winget install Git.Git and re-run." -ForegroundColor Red
  exit 1
}
Write-Host "  $((git --version))  OK"

# Engine dependencies. @vscode/ripgrep ships the rg binary via npm.
Write-Host "quackitect v3 - installing engine dependencies" -ForegroundColor Cyan
Push-Location (Join-Path $root "product\deliverable")
try {
  npm install --no-audit --no-fund --loglevel=error
  if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install FAILED - the engine cannot run without it." -ForegroundColor Red
    exit 1
  }
  # ripgrep is a HARD dependency (owner ruling 2026-07-26): no fallback engine.
  $rgPath = node -p "try { require('@vscode/ripgrep').rgPath } catch { '' }"
  if ([string]::IsNullOrWhiteSpace($rgPath) -or -not (Test-Path $rgPath)) {
    $rgOnPath = Get-Command rg -ErrorAction SilentlyContinue
    if ($null -eq $rgOnPath) {
      Write-Host "ripgrep not found - it is a hard dependency. npm install should have provided it (or: winget install BurntSushi.ripgrep.MSVC). Re-run." -ForegroundColor Red
      exit 1
    }
    Write-Host "  ripgrep (PATH) $((rg --version) -split "`n" | Select-Object -First 1)  OK"
  } else {
    Write-Host "  ripgrep (npm) $rgPath  OK"
  }
} finally {
  Pop-Location
}

# Install the cage. .mcp.json and .claude\settings.json cannot be written by
# remote tools (desktop security rule), so they ship as templates in
# workspace\_cage and are placed locally here - declaratively, every run.
Write-Host "quackitect v3 - installing cage config" -ForegroundColor Cyan
$ws = Join-Path $root "workspace"
New-Item -ItemType Directory -Force -Path (Join-Path $ws ".claude") | Out-Null
Copy-Item (Join-Path $ws "_cage\mcp.json") (Join-Path $ws ".mcp.json") -Force
Copy-Item (Join-Path $ws "_cage\claude-settings.json") (Join-Path $ws ".claude\settings.json") -Force
Write-Host "  workspace\.mcp.json + workspace\.claude\settings.json in place"

# Engine selftests - the lane's laws, each pinned to the incident that ruled it.
Write-Host "quackitect v3 - selftest" -ForegroundColor Cyan
Push-Location (Join-Path $root "product\deliverable")
try {
  node --test "tests/*.test.ts"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Selftests FAILED - do not launch on a red engine." -ForegroundColor Red
    exit 1
  }
} finally {
  Pop-Location
}

# MANUAL is an alias for threshold 0: the agent still launches, but every
# step is yours - you drive from the Mirror, the agent holds and narrates.
# (Walking with NO agent at all: node engine\bin\se-manual.ts directly.)
if ($Manual) { $Threshold = 0 }

# Launch Claude Code inside the cage. workspace/.claude/settings.json
# denies the native tools by name (explicit blacklist); workspace/.mcp.json
# serves the se lane. The agent's whole world is the MCP server - which also
# embeds the Mirror (http://localhost:7333): YOUR hand on the same walk.
# .mcp.json args are fixed template text, so the threshold rides the env.
$claude = Get-Command claude -ErrorAction SilentlyContinue
if ($null -eq $claude) {
  Write-Host "claude CLI not found. Install Claude Code first: https://code.claude.com/docs" -ForegroundColor Red
  exit 1
}
$env:SE_THRESHOLD = $Threshold.ToString([System.Globalization.CultureInfo]::InvariantCulture)
Write-Host "quackitect v3 - launching caged agent in workspace/ (threshold $env:SE_THRESHOLD)" -ForegroundColor Cyan
Write-Host "quackitect v3 - the Mirror (your hand on the walk): http://localhost:7333" -ForegroundColor Cyan
Push-Location (Join-Path $root "workspace")
try {
  claude
} finally {
  Pop-Location
}
