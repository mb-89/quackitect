<#
.SYNOPSIS
quackitect v3 — install-check, selftest, and launch.

.DESCRIPTION
Preflight (node/git/ripgrep hard deps), cage install, engine selftests, then
either the caged agent (default) or the Mirror in manual mode.

.PARAMETER Manual
Open the Mirror instead of the agent: walk the machines yourself in the
browser, tick by tick (http://localhost:7333).

.PARAMETER Help
Show this help (-h and -? work too).

.EXAMPLE
.\RUNME.ps1
.EXAMPLE
.\RUNME.ps1 -Manual
#>
[CmdletBinding()]
param(
  [switch]$Manual,
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

if ($Manual) {
  # MANUAL MODE: the Mirror. Walk the machines yourself - tick by tick.
  Write-Host "quackitect v3 - manual mode: the mirror at http://localhost:7333" -ForegroundColor Cyan
  Start-Process "http://localhost:7333"
  node (Join-Path $root "product\deliverable\bin\se-manual.ts") --root $root
  exit 0
}

# AGENT MODE: launch Claude Code inside the cage. workspace/.claude/settings.json
# denies the native tools by name (explicit blacklist); workspace/.mcp.json
# serves the se lane. The agent's whole world is the MCP server.
$claude = Get-Command claude -ErrorAction SilentlyContinue
if ($null -eq $claude) {
  Write-Host "claude CLI not found. Install Claude Code first: https://code.claude.com/docs" -ForegroundColor Red
  exit 1
}
Write-Host "quackitect v3 - launching caged agent in workspace/" -ForegroundColor Cyan
Push-Location (Join-Path $root "workspace")
try {
  claude
} finally {
  Pop-Location
}
