# The tree's one entry. Level zero needs no build, so this runs its checks.
param([string]$What = "check", [Parameter(ValueFromRemainingArguments)][string[]]$Rest)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
switch ($What) {
  "check" { node --test "src/level0/test/*.test.mjs"; if ($LASTEXITCODE -ne 0) { exit 1 }; node src/level0/bin/lint.mjs . }
  "lint"  { node src/level0/bin/lint.mjs @Rest }
  "fix"   { node src/level0/bin/lint.mjs --fix @Rest }
  "test"  { node --test "src/level0/test/*.test.mjs" }
  default { Write-Host "usage: .\RUNME.ps1 [check|lint|fix|test]"; exit 2 }
}
exit $LASTEXITCODE
