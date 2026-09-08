# RUNME. The one command that always works.
#
# It does two things: it installs what this tree needs, then it hands every
# argument to the command line.
#
#   .\RUNME.ps1           what this tree can do
#   .\RUNME.ps1 check     the tests, then the rules over the tree
$ErrorActionPreference = "Stop"
$here = $PSScriptRoot

& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $here "src\scripts\install.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& node (Join-Path $here "src\scripts\cli.mjs") @args
exit $LASTEXITCODE
