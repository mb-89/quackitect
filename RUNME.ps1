# RUNME — quackitect v2, Windows. The distribution bar (TS ruling 2026-07-22):
# RUNME + winget Node. A fresh machine runs this and gets a green check.
$ErrorActionPreference = "Stop"

function Fail($msg) { Write-Host "RUNME: FAIL - $msg" -ForegroundColor Red; exit 1 }

# 1. Node >= 22 (type stripping + node:sqlite required)
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

# 2. Sibling benjamin checkout (live kb import)
if (-not (Test-Path "$PSScriptRoot\..\benjamin\package.json")) {
    Fail "sibling checkout missing: clone mb-89/benjamin next to this repo (..\benjamin)"
}

# 3. Install (npm ci against the committed lockfile) + verify
Push-Location $PSScriptRoot
try {
    npm ci
    if (-not $?) { Fail "npm ci failed" }
    npm run verify
    if (-not $?) { Fail "verify failed" }
} finally { Pop-Location }

Write-Host ""
Write-Host "RUNME: GREEN - quackitect v2 verified on this machine" -ForegroundColor Green
