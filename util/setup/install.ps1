# The bootstrap. It makes the toolchain exist and hands over. Everything it
# does beyond that lives in the installer, which is written once and runs on
# both platforms.
#
# Every argument goes through to the installer, which is where the flags are
# declared and where --help prints them.
#
#   util\setup\install.ps1 --help
param(
  [Parameter(ValueFromRemainingArguments = $true)]
  $Rest
)
$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")

function Have($name) { $null -ne (Get-Command $name -ErrorAction SilentlyContinue) }

function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
              [Environment]::GetEnvironmentVariable("Path", "User")
}

Write-Host "quackitect - checking the toolchain" -ForegroundColor Cyan

if (-not (Have "winget")) {
  Write-Host "winget is not on this machine, and it is how packages are installed here." -ForegroundColor Red
  Write-Host "  Install 'App Installer' from the Microsoft Store, then run this again."
  exit 1
}

# Go is the only tool the bootstrap needs. The installer takes the rest,
# because a list of dependencies is data and belongs in the manifest.
if (-not (Have "go")) {
  Write-Host "  installing go" -ForegroundColor Yellow
  winget install -e --id GoLang.Go --accept-package-agreements --accept-source-agreements | Out-Null
  Refresh-Path
}
if (-not (Have "go")) {
  Write-Host "go is installed but no shell can see it yet." -ForegroundColor Yellow
  Write-Host "  Open a NEW terminal and run this again."
  exit 1
}
Write-Host "  $(go version)"

$se_args = @("run", ".", "--root", "$root")
if ($Rest) { $se_args += $Rest }

Push-Location $PSScriptRoot
try { & go @se_args; $code = $LASTEXITCODE } finally { Pop-Location }
exit $code
