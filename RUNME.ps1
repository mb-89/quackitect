<#
.SYNOPSIS
quackitect v3 — install-check, selftest, and launch.

.DESCRIPTION
Preflight (node/git/ripgrep hard deps), cage install, engine selftests, then
the caged agent, inside the Mirror's terminal pane. RUNME consumes the launch
flags and forwards every other argument to the se server. ALL of them, launch
and engine alike, are defined ONCE in engine/bin/se-mcp.ts and printed as ONE
list. Run .\RUNME.ps1 --help.

.EXAMPLE
.\RUNME.ps1
.EXAMPLE
.\RUNME.ps1 --autonomy 0
.EXAMPLE
.\RUNME.ps1 --manual
.EXAMPLE
.\RUNME.ps1 --own-terminal
#>
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# The server (engine/bin/se-mcp.ts) is the registry for everything that
# changes how the ENGINE runs. RUNME declares only the flags that change how
# IT LAUNCHES - the server never sees those.
$forwarded = @($args | ForEach-Object { "$_" })
# ONE HELP, NOT TWO (owner ruling 2026-07-28). RUNME used to print its own
# list and then the server's, and a reader had to stitch them together. The
# launcher's flags are now declared alongside the engine's in se-mcp.ts, so
# there is a single text and this file just renders it.
#
# It goes to the OUTPUT stream. Write-Host writes to the host stream, which a
# pipe or a redirect drops - help you cannot capture is the same defect as a
# flag nobody documented.
if ($forwarded | Where-Object { $_ -in @("--help", "-h", "-?", "-Help") }) {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) { node (Join-Path $root "product\deliverable\engine\bin\se-mcp.ts") --help }
  else { Write-Output "  (node not installed yet - the whole help lives in product\deliverable\engine\bin\se-mcp.ts)" }
  exit 0
}

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

# The FAST gate only (sub-second): canvases compile, hard deps answer, the
# log location is writable. The FULL test suite is not run here - it runs
# INSIDE boot (prepare_idle's selftest exit script), engine-observed, so
# launching stays instant and the walk still proves the engine green.
Write-Host "quackitect v3 - preflight (full selftests run in boot)" -ForegroundColor Cyan
Push-Location (Join-Path $root "product\deliverable")
try {
  node engine\bin\preflight.ts --root $root
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Preflight FAILED - do not launch on a red engine." -ForegroundColor Red
    exit 1
  }
} finally {
  Pop-Location
}

# Launch Claude Code inside the cage. workspace/.claude/settings.json
# denies the native tools by name (explicit blacklist); workspace/.mcp.json
# serves the se lane. The agent's whole world is the MCP server - which also
# embeds the Mirror (http://localhost:7333): YOUR hand on the same walk.
# .mcp.json args are fixed template text, so the forwarded command line
# rides the env (newline-separated - argument values may carry spaces).
# THE FLAGS RUNME OWNS. They change how RUNME launches, not how the engine
# runs, so they are taken out of the forwarded command line here.
$ownTerminal = [bool]($forwarded | Where-Object { $_ -eq "--own-terminal" })
$manual = [bool]($forwarded | Where-Object { $_ -eq "--manual" })
$staleOneScreen = [bool]($forwarded | Where-Object { $_ -eq "--one-screen" })
$forwarded = @($forwarded | Where-Object { $_ -notin @("--own-terminal", "--manual", "--one-screen") })
if ($staleOneScreen) {
  Write-Host "quackitect v3 - --one-screen is the default now; the flag did nothing" -ForegroundColor Yellow
}

# MANUAL MODE MEANS NO LLM. Either you asked for it, or no claude CLI was
# found - a missing agent must not stop you walking the machines yourself.
$claude = Get-Command claude -ErrorAction SilentlyContinue
if (($null -eq $claude) -and (-not $manual)) {
  Write-Host "claude CLI not found - starting in manual mode. Install Claude Code for an agent: https://code.claude.com/docs" -ForegroundColor Yellow
  $manual = $true
}
if ($manual) {
  Write-Host "quackitect v3 - manual mode: no agent, the Mirror is yours" -ForegroundColor Cyan
  node (Join-Path $root "product\deliverable\engine\bin\se-manual.ts") --root $root @forwarded
  exit $LASTEXITCODE
}
$env:SE_ARGS = ($forwarded -join "`n")
$argNote = if ($forwarded.Count -gt 0) { " (args: $($forwarded -join ' '))" } else { "" }
Write-Host "quackitect v3 - launching caged agent in workspace/$argNote" -ForegroundColor Cyan
Write-Host "quackitect v3 - the Mirror (your hand on the walk): the server opens http://localhost:7333 as soon as it is up" -ForegroundColor Cyan

# The server opens the Mirror itself as soon as it listens (se_panel
# reopens it any time) - no polling job here.

# The agent only acts inside a turn, and no turn starts until a first
# message - so RUNME sends it. The agent boots as far as the threshold
# lets it, ANNOUNCES where it stands, and stops; a stopped agent cannot
# hear the slider - the user messages it (e.g. "continue") to resume.
$kickoff = 'Session start. Tick the machine and walk as far as the threshold allows. Then report to me in one short message: where you stand, and why you stopped (threshold, condition, or idle). If you are held below the threshold or idle with nothing to do, stop - and make it clear to me that the slider alone cannot wake you: after I change it or move the machine in the mirror, I have to send you a message (continue is enough), and you pick up from wherever the machine stands.'
# THE TERMINAL PANE IS THE DEFAULT. The agent runs inside a pseudo-terminal
# hosted beside it, so the Mirror shows it in the left column. That host is
# started DETACHED: with the terminal in the browser this window has nothing
# left to show, and leaving the session tied to it means closing the window
# kills the agent - which happened for real on 2026-07-28. When no terminal
# binding is installed the host runs the agent on this terminal instead, so a
# terminal that will not start still never costs you your agent.
Push-Location (Join-Path $root "workspace")
try {
  if ($ownTerminal) {
    Write-Host "quackitect v3 - own terminal: the agent runs in THIS window; the Mirror's terminal pane stays empty" -ForegroundColor Cyan
    claude $kickoff
  } else {
    Write-Host "quackitect v3 - the agent runs in the Mirror's terminal pane, in the background" -ForegroundColor Cyan
    node (Join-Path $root "product\deliverable\engine\bin\se-pty.ts") --pty-port 7334 --detach -- claude $kickoff
  }
} finally {
  Pop-Location
}
