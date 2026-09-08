# Installs what this tree needs, and nothing else. RUNME calls this before it
# calls the command line, so a person runs RUNME and everything works.
#
# Every dependency this project takes is named in $needed. Adding one is adding
# a row, and a box that already has it pays one check.
#
# Windows installs through winget, which ships with the operating system.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$binDir = Join-Path $root ".se\bin"

# Pinned, so every box builds the same tree. Vale ships a binary for each
# platform, so nothing here compiles and no C toolchain is needed.
$valeVersion = "3.20.0"
$biomeVersion = "2.5.12"

function Refresh-Path {
  # A program installed a moment ago is on the machine and not yet in this
  # shell. Reading both scopes back is what makes one RUNME enough.
  $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $user = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = (@($machine, $user) | Where-Object { $_ }) -join ";"
}

function Winget($id) {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "winget is missing, so $id cannot be installed. Install App Installer from the Microsoft Store and run this again."
  }
  Write-Host "  installing $id through winget" -ForegroundColor Cyan
  winget install --id $id --exact --silent --accept-source-agreements --accept-package-agreements
  # winget answers a non-zero code when the package is already current, which
  # this script has to read as a success.
  if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne -1978335189) {
    throw "winget could not install $id (it answered $LASTEXITCODE)."
  }
  Refresh-Path
}

function Get-Vale {
  $arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "64-bit" }
  $name = "vale_${valeVersion}_Windows_${arch}.zip"
  $from = "https://github.com/errata-ai/vale/releases/download/v$valeVersion/$name"
  $zip = Join-Path $env:TEMP $name

  Write-Host "  downloading Vale $valeVersion" -ForegroundColor Cyan
  New-Item -ItemType Directory -Force $binDir | Out-Null
  Invoke-WebRequest -Uri $from -OutFile $zip -UseBasicParsing
  Expand-Archive -LiteralPath $zip -DestinationPath $binDir -Force
  Remove-Item $zip -Force
}

function Get-ValeLs {
  $arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "64-bit" }
  $servers = Join-Path $root "src\level0\lib\servers.js"
  $from = & node --input-type=module -e "import { valeLsUrl } from 'file:///$($servers -replace '\\','/')'; process.stdout.write(valeLsUrl('Windows', '$arch'));"
  if (-not $from) { throw "vale-ls ships no binary for Windows $arch." }
  $zip = Join-Path $env:TEMP (Split-Path $from -Leaf)

  Write-Host "  downloading vale-ls" -ForegroundColor Cyan
  New-Item -ItemType Directory -Force $binDir | Out-Null
  Invoke-WebRequest -Uri $from -OutFile $zip -UseBasicParsing
  Expand-Archive -LiteralPath $zip -DestinationPath $binDir -Force
  Remove-Item $zip -Force
}

function Get-Biome {
  $arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "x64" }
  $from = "https://github.com/biomejs/biome/releases/download/@biomejs/biome@$biomeVersion/biome-win32-$arch.exe"

  Write-Host "  downloading Biome $biomeVersion" -ForegroundColor Cyan
  New-Item -ItemType Directory -Force $binDir | Out-Null
  Invoke-WebRequest -Uri $from -OutFile (Join-Path $binDir "biome.exe") -UseBasicParsing
}

$needed = @(
  @{
    name = "node"
    why  = "the command line and the level zero rules are JavaScript"
    have = { $null -ne (Get-Command node -ErrorAction SilentlyContinue) }
    get  = { Winget "OpenJS.NodeJS.LTS" }
  },
  @{
    name = "vale"
    why  = "Vale holds the prose rules the write door and the linter read"
    have = { Test-Path (Join-Path $binDir "vale.exe") }
    get  = { Get-Vale }
  },
  @{
    name = "biome"
    why  = "Biome formats and lints the JavaScript in this tree"
    have = { Test-Path (Join-Path $binDir "biome.exe") }
    get  = { Get-Biome }
  },
  @{
    name   = "vale-ls"
    why    = "the Vale language server, so an editor draws the same rules"
    have   = { Test-Path (Join-Path $binDir "vale-ls.exe") }
    get    = { Get-ValeLs }
    # The editor wants this one, and the doors hold without it.
    wanted = $true
  }
)

$missing = @($needed | Where-Object { -not (& $_.have) })
if ($missing.Count -eq 0) { exit 0 }

Write-Host "Installing what this tree needs." -ForegroundColor Cyan
foreach ($one in $missing) {
  Write-Host "$($one.name): $($one.why)"
  if ($one.wanted) {
    try { & $one.get } catch { Write-Warning $_.Exception.Message }
    if (-not (& $one.have)) {
      Write-Warning "  $($one.name) stays missing, so the editor manages its own copy."
    }
    continue
  }
  & $one.get
  if (-not (& $one.have)) {
    Write-Error "$($one.name) is still missing after installing it. Open a new terminal and run this again."
    exit 1
  }
}
Write-Host "Ready." -ForegroundColor Green
exit 0
