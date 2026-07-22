# RUNME — run me: start an agent in the workspace.
# Setup happens only when missing. Verification lives in `npm run verify`.
$ErrorActionPreference = "Stop"

function Fail($msg) { Write-Host "RUNME: $msg" -ForegroundColor Red; exit 1 }

# Node >= 22 (type stripping + node:sqlite)
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "RUNME: Node not found - installing via winget..."
    winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    if (-not $?) { Fail "winget install failed; install Node >= 22 manually" }
    Write-Host "RUNME: Node installed - open a fresh terminal and re-run RUNME.ps1"
    exit 0
}
$major = [int]((node --version).TrimStart("v").Split(".")[0])
if ($major -lt 22) { Fail "Node >= 22 required, found $(node --version)" }

# Sibling benjamin checkout (live kb import)
if (-not (Test-Path "$PSScriptRoot\..\benjamin\package.json")) {
    Fail "sibling checkout missing: clone mb-89/benjamin next to this repo (..\benjamin)"
}

# Install once
if (-not (Test-Path "$PSScriptRoot\product\deliverable\node_modules")) {
    Push-Location "$PSScriptRoot\product\deliverable"
    try { npm ci; if (-not $?) { Fail "npm ci failed" } } finally { Pop-Location }
}

# Start the agent in the workspace. Most consumers have Copilot; the ones
# with Claude usually have no Copilot, so detection order settles it.
Set-Location "$PSScriptRoot\workspace"
if (Get-Command copilot -ErrorAction SilentlyContinue) {
    copilot
} elseif (Get-Command claude -ErrorAction SilentlyContinue) {
    claude
} else {
    Fail "no agent CLI found - install GitHub Copilot CLI or Claude Code, then re-run"
}
