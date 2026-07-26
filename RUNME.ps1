# quackitect v3 — install-check, selftest, and caged-agent launch.
#   .\RUNME.ps1            check prerequisites, run the engine selftests, start agent in the cage.

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

# ripgrep is optional: se_file_search uses it when present, falls back to JS.
$rg = Get-Command rg -ErrorAction SilentlyContinue
if ($null -eq $rg) {
  Write-Host "  ripgrep not found (optional). Faster search: winget install BurntSushi.ripgrep.MSVC" -ForegroundColor Yellow
} else {
  Write-Host "  ripgrep $((rg --version) -split "`n" | Select-Object -First 1)  OK"
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
    Write-Host "Selftests FAILED - do not launch the agent on a red engine." -ForegroundColor Red
    exit 1
  }
} finally {
  Pop-Location
}

# Launch Claude Code inside the cage. workspace/.claude/settings.json denies
# the native tools by name (explicit blacklist); workspace/.mcp.json serves
# the se lane. The agent's whole world is the MCP server.
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
