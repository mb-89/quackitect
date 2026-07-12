# RUNME.ps1 - one-click install-and-verify, Windows.
# adr-install-not-zero-dep / uc-run-dep-free: a fresh machine, nothing installed but Winget,
# ends with a verified toolchain in one script run. Every dependency is checked before it
# is installed, and every install line says why - each one is a corporate-firewall risk (the
# Go-toolchain download blocked behind a proxy is the lesson dependencies.md records).
# This script installs and verifies only - it creates no workspace and no project
# (req-runme-orientation.3). Starting a project is the orientation epilogue's job to point at,
# never this script's job to do.
#
# Usage: open PowerShell anywhere in the cloned/unzipped repo, then run:  .\tools\RUNME.ps1
# If Windows blocks the script as downloaded-from-the-internet, unblock it first:
#   Unblock-File .\tools\RUNME.ps1
# Pass -OpenBook to open the book (spec\book.html) at the end; without it, the script only
# prints the path (explicit consent required to launch a browser).

param(
    [switch]$OpenBook
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Write-Info($msg) { Write-Host "    $msg" }
function Fail($msg) {
    Write-Host "runme: $msg" -ForegroundColor Red
    exit 1
}

function Update-SessionPath {
    # An installer (winget) writes PATH to the registry; THIS process does not see it until
    # we re-read Machine + User PATH and rebuild $env:Path. Without this, "go version" keeps
    # failing right after a successful install, in the same window.
    $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $user = [Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machine;$user"
}

function Test-CommandExists($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

# This script lives in tools/; the repo root is its parent directory.
$RepoRoot = Split-Path -Parent $PSScriptRoot
$QuackCmd = Join-Path $RepoRoot "quack.cmd"

if (-not (Test-Path $QuackCmd)) {
    Fail "quack.cmd not found at the repo root ($QuackCmd). Run this script from inside the cloned/unzipped quackitect folder (tools\RUNME.ps1)."
}

# --- dependency 1: Winget itself (the ONE dependency manager this script assumes) ---
Write-Step "checking for Winget"
if (-not (Test-CommandExists "winget")) {
    Fail "Winget was not found. Winget ships with Windows 11 and current Windows 10 (App Installer). Install ""App Installer"" from the Microsoft Store, then re-run this script."
}
Write-Info "found: $((Get-Command winget).Source)"

# --- dependency 2: the Go toolchain (the engine's only build-time dependency; see
#     product/quackitect/method/prompts/dependencies.md) ---
Write-Step "checking for the Go toolchain"
if (Test-CommandExists "go") {
    Write-Info "found: $(go version)"
} else {
    Write-Info "not found - installing via Winget (id GoLang.Go, the id dependencies.md already documents)"
    Write-Info "why: quack.cmd builds the engine locally from vendored source (adr-ship-source); Go is the only thing it needs to do that. Nothing else is required at runtime."
    winget install --id GoLang.Go -e --source winget --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) {
        Fail "winget install --id GoLang.Go failed (exit $LASTEXITCODE). If a corporate firewall blocks the Go SDK download, see the uv/go-bin fallback in product/quackitect/method/prompts/dependencies.md."
    }
    Update-SessionPath
    if (-not (Test-CommandExists "go")) {
        Fail "Go still not on PATH after install. Close and reopen the terminal (PATH sometimes needs a fresh session) and re-run this script. If it still fails, see the uv/go-bin fallback in product/quackitect/method/prompts/dependencies.md."
    }
    Write-Info "installed: $(go version)"
}

# --- bootstrap the global quack binary from this repo's vendored source ---
Write-Step "bootstrapping quack (builds the global binary from vendored source on first run)"
& $QuackCmd version
if ($LASTEXITCODE -ne 0) {
    Fail "quack.cmd version failed (exit $LASTEXITCODE). See product/quackitect/method/prompts/dependencies.md."
}

# --- orientation: the toolchain is ready; hand off to starting a real project ---
Write-Host ""
Write-Host "runme: done. Go and quack are installed and verified." -ForegroundColor Green
Write-Info "no workspace and no project were created - this script only installs and verifies."
Write-Host ""
Write-Host "Start your own project:" -ForegroundColor Cyan
Write-Info "option A - open this folder with your AI agent, and use the starter prompt in README.md."
Write-Info "option B - run: .\quack start stubs <your-project-folder>, then work in that folder."

$BookPath = Join-Path $RepoRoot "spec\book.html"
if (Test-Path $BookPath) {
    Write-Info "the book's onboarding chapter is the five-minute walkthrough: $BookPath"
    if ($OpenBook) {
        Start-Process $BookPath
    }
} else {
    Write-Info "no spec\book.html in this checkout - run 'quack report book' to render one."
}
