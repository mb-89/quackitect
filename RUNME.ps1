# RUNME, for a person who lives in PowerShell.
#
# One installer serves every box and it is RUNME.sh, which the shell Git ships
# reads. This hands it every argument. Bare, it then opens the editor here with
# the quackitect panel showing.
#
#   .\RUNME.ps1           the install, then the editor opens here
#   .\RUNME.ps1 check     the tests, then the rules over the tree
$ErrorActionPreference = "Stop"
$root = ($PSScriptRoot -replace "\\", "/")

$shell = @(
  "$env:ProgramFiles\Git\bin\bash.exe"
  "${env:ProgramFiles(x86)}\Git\bin\bash.exe"
  "$env:LocalAppData\Programs\Git\bin\bash.exe"
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1

if (-not $shell) {
  $found = Get-Command bash.exe -ErrorAction SilentlyContinue
  if ($found) { $shell = $found.Source }
}

if (-not $shell) {
  Write-Error "Git for Windows is missing, and it carries the shell this needs. Install it from https://git-scm.com/download/win, then run this again."
  exit 1
}

# [[spec/design_output/editor#one-command-opens-the-editor]]
if ($args.Count -eq 0) {
  $env:SE_EDITOR_OPENS = "powershell"
  & $shell "$root/RUNME.sh"
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  $code = Get-Command code -ErrorAction SilentlyContinue
  if (-not $code) {
    Write-Error "No code stands on the PATH. Install VS Code, then open this folder in it."
    exit 1
  }
  & $code.Source $PSScriptRoot
  exit 0
}

& $shell "$root/RUNME.sh" @args
exit $LASTEXITCODE
