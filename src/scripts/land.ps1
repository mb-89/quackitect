# Land named files on the branch tip, exactly as this tree holds them.
#
# IT IS A WRAPPER AND NOT A SECOND DOOR. land.sh is the push door and stays the
# only one: two implementations of one door drift, and this project has paid for
# that with four grammars reaching the engine. This finds a shell for it.
#
# WHY IT IS NEEDED. PowerShell has no sh. `bash` on a Windows box resolves to
# WSL, which answers WSL_E_WSL_OPTIONAL_COMPONENT_REQUIRED where WSL is not
# installed, and Git for Windows ships its own bash that is not on PATH.
#
#   .\src\scripts\land.ps1 "<commit message>" <path> [<path> ...]

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string] $Message,
    [Parameter(Mandatory = $true, Position = 1, ValueFromRemainingArguments = $true)]
    [string[]] $Paths
)

$ErrorActionPreference = "Stop"

# GIT'S OWN SHELL, FOUND WHERE GIT IS. git.exe is on PATH because this project
# needs it anyway, and its bash sits two folders up from it. That is one lookup
# and no guess at an install location.
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) { throw "git is not on PATH, so there is no shell to run the push door with." }

$root = Split-Path -Parent (Split-Path -Parent $gitCmd.Source)   # ...\Git\cmd\git.exe -> ...\Git
$candidates = @(
    (Join-Path $root "bin\bash.exe"),
    (Join-Path $root "usr\bin\sh.exe"),
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe"
)
$shell = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $shell) {
    throw "No shell was found for the push door. Looked at:`n  " + ($candidates -join "`n  ")
}

# THE SCRIPT IS FOUND BESIDE THIS ONE, so the wrapper works from any directory.
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$land = Join-Path $here "land.sh"
if (-not (Test-Path -LiteralPath $land)) { throw "land.sh is not beside this script: $land" }

# FORWARD SLASHES, BECAUSE THE SHELL READS THEM AND land.sh HANDS THEM TO GIT.
$args = @($land.Replace('\', '/'), $Message) + ($Paths | ForEach-Object { $_.Replace('\', '/') })

& $shell @args
exit $LASTEXITCODE
