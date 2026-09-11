# RUNME, for a person who lives in PowerShell.
#
# One installer serves every box and it is RUNME.sh, which the shell Git ships
# reads. This hands it every argument, so a task or a terminal here runs the
# same words and opens no window of its own.
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

& $shell "$root/RUNME.sh" @args
exit $LASTEXITCODE
