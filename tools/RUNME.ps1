# RUNME.ps1 - one-click install-and-demo, Windows.
# adr-install-not-zero-dep / uc-run-dep-free: a fresh machine, nothing installed but Winget,
# ends at a working quackitect demo in one script run. Every dependency is checked before it
# is installed, and every install line says why - each one is a corporate-firewall risk (the
# Go-toolchain download blocked behind a proxy is the lesson dependencies.md records).
#
# Usage: open PowerShell anywhere in the cloned/unzipped repo, then run:  .\tools\RUNME.ps1
# If Windows blocks the script as downloaded-from-the-internet, unblock it first:
#   Unblock-File .\tools\RUNME.ps1

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

# --- demo: a throwaway workspace, driven end-to-end, on THIS fresh machine ---
Write-Step "creating a throwaway demo workspace"
$DemoDir = Join-Path $env:TEMP ("quackitect-demo-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
New-Item -ItemType Directory -Path $DemoDir -Force | Out-Null
Write-Info "workspace: $DemoDir"

& $QuackCmd start stubs $DemoDir
if ($LASTEXITCODE -ne 0) { Fail "quack start stubs failed (exit $LASTEXITCODE)." }

Write-Step "driving the demo workspace (status, then a rendered report)"
& $QuackCmd -C $DemoDir status
if ($LASTEXITCODE -ne 0) { Fail "quack status on the demo workspace failed (exit $LASTEXITCODE)." }

$BoardPath = Join-Path $DemoDir "board.html"
& $QuackCmd -C $DemoDir report --out $BoardPath
if ($LASTEXITCODE -ne 0) { Fail "quack report on the demo workspace failed (exit $LASTEXITCODE)." }
if (-not (Test-Path $BoardPath)) { Fail "report claimed success but $BoardPath is missing." }

# --- show the result: the fresh (empty) demo board, and the real shipped book for reference ---
Write-Step "opening the results"
$BookPath = Join-Path $RepoRoot "spec\book.html"
if (Test-Path $BookPath) {
    Write-Info "opening the shipped book (the full quackitect project, as reference): $BookPath"
    Start-Process $BookPath
} else {
    Write-Info "no spec\book.html in this checkout - skipping (run 'quack report book' to render one)."
}
Write-Info "opening the demo board (this fresh workspace, just created): $BoardPath"
Start-Process $BoardPath

Write-Host ""
Write-Host "runme: done. Go + quack are installed, and the demo workspace proved the round trip." -ForegroundColor Green
Write-Host "  demo workspace: $DemoDir  (throwaway - delete any time)"
Write-Host "  demo board:     $BoardPath"
Write-Host "  reference book: $BookPath"
Write-Host "  next: cd into this repo and tell your AI agent 'let's start a new project' (see README.md)."
