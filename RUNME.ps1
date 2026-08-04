<#
.SYNOPSIS
The install. Run it ONCE.

.DESCRIPTION
Preflight (node/git/ripgrep hard deps), cage install, engine selftests, then
the caged agent, inside the Mirror's terminal pane. RUNME consumes the launch
flags and forwards every other argument to the se server. ALL of them, launch
and engine alike, are defined ONCE in engine/bin/se-mcp.ts and printed as ONE
list. Run .\RUNME.ps1 --help.

.EXAMPLE
.\RUNME.ps1
.EXAMPLE
.\RUNME.ps1 --autonomy 0
.EXAMPLE
.\RUNME.ps1 --manual
.EXAMPLE
.\RUNME.ps1 --own-terminal
.EXAMPLE
.\RUNME.ps1 --classic
.EXAMPLE
.\RUNME.ps1 --kill
#>
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# THE PRODUCT NAME IS ONE FACT (brand.json at the root). Nothing below spells
# it out, so an export renames the whole system by writing that one file.
$brandFile = Join-Path $root "project\brand\brand.json"
$brand = if (Test-Path $brandFile) { Get-Content $brandFile -Raw | ConvertFrom-Json } else { [pscustomobject]@{ name = "se"; id = "se"; abbr = $null } }
$P = $brand.name
$brandId = $brand.id

# The server (engine/bin/se-mcp.ts) is the registry for everything that
# changes how the ENGINE runs. RUNME declares only the flags that change how
# IT LAUNCHES - the server never sees those.
$forwarded = @($args | ForEach-Object { "$_" })
# ONE HELP, NOT TWO (owner ruling 2026-07-28). RUNME used to print its own
# list and then the server's, and a reader had to stitch them together. The
# launcher's flags are now declared alongside the engine's in se-mcp.ts, so
# there is a single text and this file just renders it.
#
# It goes to the OUTPUT stream. Write-Host writes to the host stream, which a
# pipe or a redirect drops - help you cannot capture is the same defect as a
# flag nobody documented.
if ($forwarded | Where-Object { $_ -in @("--help", "-h", "-?", "-Help") }) {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) { node (Join-Path $root "project\deliverable\engine\bin\se-mcp.ts") --help }
  else { Write-Output "  (node not installed yet - the whole help lives in project\deliverable\engine\bin\se-mcp.ts)" }
  exit 0
}

# THE EXPORT. The system must run on another machine WITHOUT this repo's
# history (owner requirement 2026-07-30): copy the working tree, minus the
# history and the session state, into a fresh single-commit repository.
# Runs before preflight and exits - exporting must never wait on npm.
$exportIx = [array]::IndexOf($forwarded, "--export")
if ($exportIx -ge 0) {
  # THE EXPORT RENAMES. Folder, name and abbreviation are all required -
  # there is no fallback to this project's own name, because a forgotten
  # argument would ship it to somebody else.
  $dest    = if ($exportIx + 1 -lt $forwarded.Count) { $forwarded[$exportIx + 1] } else { $null }
  $newName = if ($exportIx + 2 -lt $forwarded.Count) { $forwarded[$exportIx + 2] } else { $null }
  $newAbbr = if ($exportIx + 3 -lt $forwarded.Count) { $forwarded[$exportIx + 3] } else { $null }
  if ([string]::IsNullOrWhiteSpace($dest) -or [string]::IsNullOrWhiteSpace($newName) -or [string]::IsNullOrWhiteSpace($newAbbr)) {
    Write-Host "--export needs a folder, a name and an abbreviation:" -ForegroundColor Red
    Write-Host "  .\RUNME.ps1 --export C:\path\to\empty 'Blue Heron' BH" -ForegroundColor Yellow
    exit 1
  }
  if ($newAbbr.Length -lt 2 -or $newAbbr.Length -gt 3) {
    Write-Host "the abbreviation is two or three letters - got '$newAbbr'" -ForegroundColor Red
    exit 1
  }
  # The id has to survive being a folder name, an npm name and a VS Code
  # command id, so it is reduced to what all three accept.
  $newId = ($newName.ToLower() -replace '[^a-z0-9]+', '-').Trim('-')
  if ([string]::IsNullOrWhiteSpace($newId)) {
    Write-Host "'$newName' has no letters or digits to make an id from" -ForegroundColor Red
    exit 1
  }
  if ((Test-Path $dest) -and (@(Get-ChildItem $dest -Force).Count -gt 0)) {
    Write-Host "--export target must be EMPTY - refusing to write over $dest" -ForegroundColor Red
    exit 1
  }
  if ($null -eq (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "git not found - the export creates a fresh repo. winget install Git.Git and re-run." -ForegroundColor Red
    exit 1
  }
  Write-Host "$P - exporting as '$newName' ($($newAbbr.ToUpper())) - history stays home" -ForegroundColor Cyan
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
  # ABSOLUTE FROM HERE. Push-Location below moves the working directory into
  # the destination, so a RELATIVE $dest would resolve against the destination
  # itself from that point on - brand.json and the README were written to
  # <dest>\<dest>\... and the write failed with a path not found.
  $dest = (Resolve-Path -LiteralPath $dest).Path
  # /XD excludes by NAME wherever it appears: the repo history, every
  # worktree, the session state, node_modules and the generated cage dirs.
  # /XF drops the generated MCP config; the _cage templates travel (their
  # file is mcp.json, a different name) and RUNME regenerates on launch.
  # .git rides BOTH lists: in a normal checkout it is a directory (/XD), in
  # a git WORKTREE the root carries a .git FILE (/XF) — missing that file
  # made an export re-use the live repository (found in the smoke test).
  # THE RECORDS STAY HOME TOO. project/spec is this project's own expedition
  # and iteration history. It is noise to whoever receives the copy, and
  # confusing noise, because it describes work they never did.
  $specDir = Join-Path $root "project\spec"
  robocopy $root $dest /E /NFL /NDL /NJH /NJS /NP /XD .git .worktrees .se node_modules .claude .copilot $specDir /XF .git .mcp.json | Out-Null
  if ($LASTEXITCODE -ge 8) {
    Write-Host "copy FAILED (robocopy $LASTEXITCODE)" -ForegroundColor Red
    exit 1
  }
  # The machine writes its records here, so the home exists from the start.
  New-Item -ItemType Directory -Force -Path (Join-Path $dest "project\spec") | Out-Null
  if (Test-Path (Join-Path $dest ".git")) {
    Write-Host "a .git survived the copy - refusing to init over live history" -ForegroundColor Red
    exit 1
  }
  Push-Location $dest
  try {
    # git WARNS on stderr - line endings, for one - and a Stop preference
    # turns any such warning into a terminating error mid-export. The exit
    # codes are what decide here, not the chatter.
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    git init -q -b main
    # A LOCAL identity rides .git/config, so the engine's own commits work
    # on a machine that never configured git.
    # ONE FILE RENAMES THE WHOLE SYSTEM. Every branded surface renders from
    # this at launch, so nothing else in the tree had to be rewritten.
    # WRITTEN WITHOUT A BOM. Set-Content -Encoding utf8 emits one on Windows
    # PowerShell, and JSON.parse refuses the file it produces.
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    $brandJson = @{ name = $newName; id = $newId; abbr = $newAbbr.ToUpper() } | ConvertTo-Json
    [System.IO.File]::WriteAllText((Join-Path $dest "project\brand\brand.json"), $brandJson, $utf8NoBom)
    # A FRESH FRONT DOOR. This repo's README is about THIS repo - its branch
    # layout, its history - which is noise to whoever receives the copy.
    $readme = @"
# $newName

$newName runs inside VS Code. You walk a state machine with an AI agent, and
a mirror beside your editor shows where the walk stands.

## Install it, once

    .\RUNME.ps1

Run that ONE time. It installs whatever is missing, places the VS Code
extension, and opens VS Code.

## Then work in VS Code

After that first run, open this folder in VS Code like any other project.
The $($newAbbr.ToUpper()) button in the left bar opens the mirror.

You do not run RUNME.ps1 again. It is the installer, not the way in.

## What is in here

- project/deliverable - the engine, the machines, the VS Code extension.
- project/guidance - the rules the agent is bound by.
- project/spec - where your own records get written.
- project/ - the folder you open. Everything being built lives here.
- project/brand/brand.json - the product name. Change it, and every surface follows.
- project/brand/palette.css - every colour. Edit it. No code change, no restart.

## Attaching an agent

Open the command palette and run "$($newName): How to Attach Your Agent".

## Give it to someone else

    .\RUNME.ps1 --export C:\path\to\empty "Their Name" TN

That makes a fresh copy under a new name, with its own empty git repo. Your
history and your records stay here.
"@
    [System.IO.File]::WriteAllText((Join-Path $dest "README.md"), $readme, $utf8NoBom)
    git config user.name "$newName"
    git config user.email "export@$newId.local"
    git add -A
    git commit -q -m "$newName - a fresh start, history stays home"
    if ($LASTEXITCODE -ne 0) {
      Write-Host "the fresh repository could not be committed - see above" -ForegroundColor Red
      exit 1
    }
    $ErrorActionPreference = $prevEap
  } finally {
    Pop-Location
  }
  Write-Host "  exported to $dest as '$newName' - a fresh repo, one commit, no history" -ForegroundColor Green
  Write-Host "  next: cd $dest ; .\RUNME.ps1" -ForegroundColor Cyan
  exit 0
}

# THE KILL. A stale server still holding the Mirror's port stops the next
# launch dead, and the terminal host is started DETACHED so it outlives the
# window that made it. This runs BEFORE preflight and then exits: clearing a
# port must never wait on npm install, and nothing is launched afterwards.
if ($forwarded | Where-Object { $_ -in @("--kill", "-Kill") }) {
  Write-Host "$P - kill: looking for leftovers" -ForegroundColor Cyan
  $entryPoints = @("se-mcp.ts", "se-pty.ts", "se-manual.ts")
  $ports = @(7333, 7334)

  # TWO WAYS OF BEING FOUND, because either one alone has a blind spot. The
  # command line catches an instance running on a non-default port. The
  # listening port catches one whose command line cannot be read.
  $found = [ordered]@{}
  foreach ($p in @(Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue)) {
    if ([string]::IsNullOrEmpty($p.CommandLine)) { continue }
    $hit = @($entryPoints | Where-Object { $p.CommandLine -like "*$_*" })
    # THE PID KEY IS A STRING ON PURPOSE. An ordered dictionary indexed by an
    # integer reads it as a POSITION rather than a key, so a real pid throws.
    if ($hit.Count -gt 0) { $found["$($p.ProcessId)"] = "node $($hit[0])" }
  }
  foreach ($port in $ports) {
    foreach ($conn in @(Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)) {
      $owner = "$($conn.OwningProcess)"
      if ($found.Contains($owner)) {
        $found[$owner] = "$($found[$owner]), port $port"
      } else {
        $name = (Get-Process -Id ([int]$owner) -ErrorAction SilentlyContinue).ProcessName
        $found[$owner] = if ($name) { "port $port ($name)" } else { "port $port" }
      }
    }
  }

  if ($found.Count -eq 0) {
    Write-Host "  nothing was running - ports $($ports -join ' and ') are free" -ForegroundColor Green
    exit 0
  }

  # NEVER KILL YOUR OWN SESSION. A caged agent told to clear the ports would
  # otherwise taskkill the very server serving it, halfway through its turn.
  # Anything in this process's own ancestry is reported and left standing.
  $ancestry = @()
  $walk = $PID
  for ($i = 0; ($i -lt 16) -and ($walk -gt 0); $i++) {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$walk" -ErrorAction SilentlyContinue
    if ($null -eq $proc) { break }
    $ancestry += "$($proc.ProcessId)"
    $walk = [int]$proc.ParentProcessId
  }

  $killed = 0
  $spared = 0
  # taskkill writes to stderr for a process that died on its own, and a Stop
  # preference turns that into a terminating error mid-sweep.
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  foreach ($entry in $found.GetEnumerator()) {
    if ($ancestry -contains $entry.Key) {
      Write-Host "  SPARED $($entry.Key) - $($entry.Value) - it is running this script" -ForegroundColor Yellow
      $spared++
      continue
    }
    Write-Host "  killing $($entry.Key) - $($entry.Value)"
    # /T takes the CHILDREN with it. The terminal host spawns the caged agent,
    # so killing only the parent leaves that agent orphaned and alive.
    taskkill /PID $entry.Key /T /F 2>&1 | Out-Null
    $killed++
  }
  $ErrorActionPreference = $prevEap

  # SAY WHETHER IT WORKED, not whether it ran. A kill reporting success over a
  # port that is still held is the exact failure this flag exists to end.
  Start-Sleep -Milliseconds 400
  $held = @($ports | Where-Object { Get-NetTCPConnection -State Listen -LocalPort $_ -ErrorAction SilentlyContinue })
  if ($held.Count -gt 0) {
    Write-Host "  killed $killed, but port(s) $($held -join ', ') are STILL HELD" -ForegroundColor Red
    if ($spared -gt 0) {
      Write-Host "  $spared spared as this script's own ancestors - run --kill from a plain terminal" -ForegroundColor Yellow
    }
    exit 1
  }
  Write-Host "  killed $killed - ports $($ports -join ' and ') are free" -ForegroundColor Green
  exit 0
}

Write-Host "$P - preflight" -ForegroundColor Cyan

# RUNME INSTALLS ITS OWN HARD DEPENDENCIES (owner, 2026-07-30: a fresh
# machine said "node not found" and stopped - installing was the whole
# idea). It tries winget itself, pulls the new PATH into THIS window, and
# only falls back to instructions where winget cannot help.
function Ensure-Tool([string]$cmd, [string]$wingetId, [string]$label) {
  if (Get-Command $cmd -ErrorAction SilentlyContinue) { return $true }
  if ($null -eq (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "$label not found, and winget is not available to install it." -ForegroundColor Red
    Write-Host "  install $label yourself, then re-run: winget install $wingetId" -ForegroundColor Yellow
    return $false
  }
  Write-Host "$label not found - installing it now (winget $wingetId)..." -ForegroundColor Yellow
  winget install -e --id $wingetId --accept-package-agreements --accept-source-agreements
  # A fresh install lands on the PATH of NEW processes only - pull the
  # machine and user PATH into this window so the launch continues HERE,
  # never asking for a restart.
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
  if (Get-Command $cmd -ErrorAction SilentlyContinue) { return $true }
  # Some installers miss the registry PATH until a relog - probe the usual
  # homes directly before ever bothering the user.
  foreach ($dir in @("$env:ProgramFiles\nodejs", "$env:ProgramFiles\Git\cmd", "$env:LOCALAPPDATA\Microsoft\WindowsApps")) {
    if (Test-Path (Join-Path $dir "$cmd.exe")) { $env:Path = "$dir;" + $env:Path }
  }
  if (Get-Command $cmd -ErrorAction SilentlyContinue) { return $true }
  Write-Host "$label installed, but no shell can see it yet - as a last resort, open a NEW terminal and run .\RUNME.ps1 again." -ForegroundColor Yellow
  return $false
}

# Node >= 22.6 (native TypeScript type stripping - no build step anywhere).
if (-not (Ensure-Tool "node" "OpenJS.NodeJS.LTS" "node")) { exit 1 }
$nodeVersion = (node --version).TrimStart("v")
if ([version]$nodeVersion -lt [version]"22.6.0") {
  Write-Host "node $nodeVersion is too old - need >= 22.6 for native TS. Upgrading (winget)..." -ForegroundColor Yellow
  winget upgrade -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
  $nodeVersion = (node --version).TrimStart("v")
  if ([version]$nodeVersion -lt [version]"22.6.0") {
    Write-Host "node is still $nodeVersion - open a NEW terminal and run .\RUNME.ps1 again (or update Node yourself)." -ForegroundColor Red
    exit 1
  }
}
Write-Host "  node $nodeVersion  OK"

# git is a HARD dependency (ref search runs through git grep; v3 is a branch of quack).
if (-not (Ensure-Tool "git" "Git.Git" "git")) { exit 1 }
Write-Host "  $((git --version))  OK"

# RUNME IS THE INSTALL, AND YOU RUN IT ONCE (owner ruling 2026-08-02). It puts
# the extension in place and opens the editor. After that the extension owns
# everything: the server, the attach configs, the engine's npm install. Opening
# VS Code on project\ is enough from then on.
#
# THE ONE THING THAT BRINGS YOU BACK HERE is a change to the extension itself,
# because VS Code loads the COPY under ~/.vscode/extensions rather than the
# source. A junction would fix that, and cannot: brand.ts RENDERS this tree's
# $PRODUCT$ placeholders into the copy, so the copy is what carries a name.
# Moving that rendering to activation time is what would retire this step.
#
# VS CODE IS THE HOST (owner, 2026-07-30). Ensure VS Code, put the extension
# in place, open the workspace - the extension owns the rest: the server,
# the attach configs, the engine's npm install. A session already running is
# fine - the extension attaches to it instead of spawning a second one.
# It is the DEFAULT now, not a flag (owner, 2026-07-30). --classic is the
# opt-out and takes the old terminal-and-browser path further down.
$classic = [bool]($forwarded | Where-Object { $_ -eq "--classic" })
$forwarded = @($forwarded | Where-Object { $_ -notin @("--classic") })
if (-not $classic) {
  if (-not (Ensure-Tool "code" "Microsoft.VisualStudioCode" "VS Code")) { exit 1 }
  $extSrc = Join-Path $root "project\deliverable\vscode"
  $extDest = Join-Path $env:USERPROFILE ".vscode\extensions\$brandId.$brandId-0.1.0"
  New-Item -ItemType Directory -Force -Path $extDest | Out-Null
  robocopy $extSrc $extDest /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) {
    Write-Host "extension copy FAILED (robocopy $LASTEXITCODE)" -ForegroundColor Red
    exit 1
  }
  # THE COPY IS WHAT CARRIES A NAME. The source keeps its placeholders, so
  # there is one tree and a rename stays one file.
  $rendered = node (Join-Path $root "project\deliverable\engine\bin\brand.ts") --root $root --dest $extDest
  if ($LASTEXITCODE -ne 0) {
    Write-Host "naming the extension FAILED - see above" -ForegroundColor Red
    exit 1
  }
  # SOME VS CODE BUILDS TRUST extensions.json once it exists and do not
  # discover new folder copies automatically. Upsert this local extension so
  # copy-based install works consistently without packaging.
  $extReg = Join-Path $env:USERPROFILE ".vscode\extensions\extensions.json"
  $extPkg = [System.IO.File]::ReadAllText((Join-Path $extDest "package.json")) | ConvertFrom-Json
  $extId = "$($extPkg.publisher).$($extPkg.name)"
  $extFolder = Split-Path $extDest -Leaf
  $extPath = "/" + ($extDest -replace "\\", "/")
  $entry = [pscustomobject]@{
    identifier = [pscustomobject]@{ id = $extId }
    version = [string]$extPkg.version
    location = [pscustomobject]@{ '$mid' = 1; path = $extPath; scheme = "file" }
    relativeLocation = $extFolder
  }
  $entries = @()
  if (Test-Path $extReg) {
    try {
      $parsed = [System.IO.File]::ReadAllText($extReg) | ConvertFrom-Json
      $entries = @($parsed)
    } catch {
      Write-Host "extensions.json could not be read - rebuilding it with this extension entry" -ForegroundColor Yellow
      $entries = @()
    }
  }
  $entries = @($entries | Where-Object { $_.identifier.id -ne $extId })
  $entries += $entry
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  $registered = $false
  try {
    [System.IO.File]::WriteAllText($extReg, ($entries | ConvertTo-Json -Depth 8 -Compress), $utf8NoBom)
    $verify = @([System.IO.File]::ReadAllText($extReg) | ConvertFrom-Json)
    $registered = [bool]($verify | Where-Object { $_.identifier.id -eq $extId })
  } catch {
    $registered = $false
  }
  if (-not $registered) {
    Write-Host "extension registry update FAILED - VS Code may ignore the copied extension on this machine." -ForegroundColor Yellow
    Write-Host "  next: close all VS Code windows, run .\RUNME.ps1 again, then check: code --list-extensions --show-versions | Select-String '$extId'" -ForegroundColor Yellow
    Write-Host "  fallback for this machine: build/install a VSIX (npm exec --yes --package @vscode/vsce -- vsce package ; code --install-extension .\\$($extFolder.Split('-')[0])-0.1.0.vsix --force)" -ForegroundColor DarkYellow
  }
  Write-Host "  extension in place - $rendered" -ForegroundColor Green
  Write-Host "  $extDest" -ForegroundColor DarkGray
  Write-Host "$P - opening VS Code on project\ - the extension takes it from here. You should not need to run this again" -ForegroundColor Cyan
  code (Join-Path $root "project")
  exit 0
}

# A SESSION ALREADY RUNNING must be seen BEFORE launching over it (owner,
# 2026-07-30). The mirror losing its port only WARNS, so a stale server
# made every next launch quietly mirror-less. Refuse loudly instead - and
# never auto-kill: what holds the port may be a live session doing work.
$busy = @()
foreach ($port in 7333, 7334) {
  if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) { $busy += $port }
}
if ($busy.Count -gt 0) {
  Write-Host "a $P session is still running - port(s) $($busy -join ', ') are held." -ForegroundColor Red
  Write-Host ""
  Write-Host "  to stop it, run:      .\RUNME.ps1 --kill" -ForegroundColor Yellow
  Write-Host "  then launch again:    .\RUNME.ps1" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "  (meant to keep it? the running session is in your browser: http://localhost:7333)" -ForegroundColor Cyan
  exit 1
}

# Engine dependencies. @vscode/ripgrep ships the rg binary via npm.
Write-Host "$P - installing engine dependencies" -ForegroundColor Cyan
Push-Location (Join-Path $root "project\deliverable")
try {
  npm install --no-audit --no-fund --loglevel=error
  if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install FAILED - the engine cannot run without it." -ForegroundColor Red
    exit 1
  }
  # ripgrep is a HARD dependency (owner ruling 2026-07-26): no fallback engine.
  $rgPath = node -p "try { require('@vscode/ripgrep').rgPath } catch { '' }"
  if ([string]::IsNullOrWhiteSpace($rgPath) -or -not (Test-Path $rgPath)) {
    # npm should have provided it; when it did not, RUNME installs the
    # system ripgrep itself - hard dependencies install, never instruct.
    if (-not (Ensure-Tool "rg" "BurntSushi.ripgrep.MSVC" "ripgrep")) { exit 1 }
    Write-Host "  ripgrep (PATH) $((rg --version) -split "`n" | Select-Object -First 1)  OK"
  } else {
    Write-Host "  ripgrep (npm) $rgPath  OK"
  }
} finally {
  Pop-Location
}

# Extension dependencies. koffi is how the extension presses a key: VS Code
# will not synthesise one for an extension, and Claude's chat box belongs to
# another extension, so the kickoff has to be sent through the operating
# system. A FAILURE HERE IS NOT FATAL - the launcher falls back to leaving the
# kickoff in the box for the reader to send by hand.
Write-Host "$P - installing extension dependencies" -ForegroundColor Cyan
Push-Location (Join-Path $root "project\deliverable\vscode")
try {
  npm install --no-audit --no-fund --loglevel=error
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  koffi did not install - the agent still starts, but you press Enter yourself." -ForegroundColor Yellow
  } else {
    Write-Host "  koffi (key sender)  OK"
  }
} finally {
  Pop-Location
}

# Install the cage. .mcp.json and .claude\settings.json cannot be written by
# remote tools (desktop security rule), so they ship as templates in
# workspace\_cage and are placed locally here - declaratively, every run.
Write-Host "$P - installing cage config" -ForegroundColor Cyan
$ws = Join-Path $root "project"
New-Item -ItemType Directory -Force -Path (Join-Path $ws ".claude") | Out-Null
Copy-Item (Join-Path $ws "_cage\mcp.json") (Join-Path $ws ".mcp.json") -Force
Copy-Item (Join-Path $ws "_cage\claude-settings.json") (Join-Path $ws ".claude\settings.json") -Force
Write-Host "  project\.mcp.json + project\.claude\settings.json in place"
# COPILOT'S CAGE IS SHAPED DIFFERENTLY. Its MCP config is a file like
# Claude's, so it is placed here the same way. Its tool DENIAL is not a
# file at all - Copilot takes that on the command line, so that half rides
# the launch and lives in _cage\copilot-cage.json as data you can correct.
New-Item -ItemType Directory -Force -Path (Join-Path $ws ".copilot") | Out-Null
Copy-Item (Join-Path $ws "_cage\copilot-mcp-config.json") (Join-Path $ws ".copilot\mcp-config.json") -Force
Write-Host "  project\.copilot\mcp-config.json in place"

# The FAST gate only (sub-second): canvases compile, hard deps answer, the
# log location is writable. The FULL test suite is not run here - it runs
# INSIDE boot (prepare_idle's selftest exit script), engine-observed, so
# launching stays instant and the walk still proves the engine green.
Write-Host "$P - preflight (full selftests run in boot)" -ForegroundColor Cyan
Push-Location (Join-Path $root "project\deliverable")
try {
  node engine\bin\preflight.ts --root $root
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Preflight FAILED - do not launch on a red engine." -ForegroundColor Red
    exit 1
  }
} finally {
  Pop-Location
}

# Launch Claude Code inside the cage. workspace/.claude/settings.json
# denies the native tools by name (explicit blacklist); workspace/.mcp.json
# serves the se lane. The agent's whole world is the MCP server - which also
# embeds the Mirror (http://localhost:7333): YOUR hand on the same walk.
# .mcp.json args are fixed template text, so the forwarded command line
# rides the env (newline-separated - argument values may carry spaces).
# THE FLAGS RUNME OWNS. They change how RUNME launches, not how the engine
# runs, so they are taken out of the forwarded command line here.
$ownTerminal = [bool]($forwarded | Where-Object { $_ -eq "--own-terminal" })
$manual = [bool]($forwarded | Where-Object { $_ -eq "--manual" })
$forwarded = @($forwarded | Where-Object { $_ -notin @("--own-terminal", "--manual") })

# WHICH AGENT HOST. Claude wins when both are installed (owner ruling).
# MANUAL MODE MEANS NO LLM. Either you asked for it, or neither CLI was
# found - a missing agent must not stop you walking the machines yourself.
$agentHost = $null
if (Get-Command claude -ErrorAction SilentlyContinue) { $agentHost = "claude" } elseif (Get-Command copilot -ErrorAction SilentlyContinue) { $agentHost = "copilot" }
if (($null -eq $agentHost) -and (-not $manual)) {
  Write-Host "no agent CLI found - starting in manual mode." -ForegroundColor Yellow
  Write-Host "  Claude Code:  https://code.claude.com/docs" -ForegroundColor Yellow
  Write-Host "  Copilot CLI:  https://docs.github.com/copilot/how-tos/copilot-cli" -ForegroundColor Yellow
  $manual = $true
}
if ($manual) {
  Write-Host "$P - manual mode: no agent, the Mirror is yours" -ForegroundColor Cyan
  node (Join-Path $root "project\deliverable\engine\bin\se-manual.ts") --root $root @forwarded
  exit $LASTEXITCODE
}
$env:SE_ARGS = ($forwarded -join "`n")
$argNote = if ($forwarded.Count -gt 0) { " (args: $($forwarded -join ' '))" } else { "" }
Write-Host "$P - launching caged agent in project/$argNote" -ForegroundColor Cyan
Write-Host "$P - the Mirror (your hand on the walk): the server opens http://localhost:7333 as soon as it is up" -ForegroundColor Cyan

# The server opens the Mirror itself as soon as it listens (se_panel
# reopens it any time) - no polling job here.

# The agent only acts inside a turn, and no turn starts until a first
# message - so RUNME sends it. The agent boots as far as the threshold
# lets it, ANNOUNCES where it stands, and stops; a stopped agent cannot
# hear the slider - the user messages it (e.g. "continue") to resume.
# THE KICKOFF LIVES IN ONE FILE - workspace/_cage/kickoff.txt. The VS Code
# extension sends the same text, so the wording cannot fork.
$kickoff = (Get-Content (Join-Path $ws "_cage\kickoff.txt") -Raw).Trim()
# THE TERMINAL PANE IS THE DEFAULT. The agent runs inside a pseudo-terminal
# hosted beside it, so the Mirror shows it in the left column. That host is
# started DETACHED: with the terminal in the browser this window has nothing
# left to show, and leaving the session tied to it means closing the window
# kills the agent - which happened for real on 2026-07-28. When no terminal
# binding is installed the host runs the agent on this terminal instead, so a
# terminal that will not start still never costs you your agent.
Push-Location (Join-Path $root "project")
try {
  if ($agentHost -eq "copilot") {
    # COPILOT DOES TAKE AN OPENING PROMPT - `copilot -i "<text>"` starts an
    # INTERACTIVE session and runs that text as its first turn. This file
    # used to claim otherwise and made the human paste the kickoff by hand
    # every single launch (owner, 2026-07-30: "we cant copy it in everytime.
    # this is not acceptable"). `-p` is the one that answers and exits; `-i`
    # is the session. Both hosts are now started the same way: one command,
    # kickoff included, nothing to paste.
    #
    # THE KICKOFF IS A BELT, NOT THE TROUSERS. workspace/AGENTS.md carries
    # the same first action, and Copilot reads it from the cwd - so an agent
    # started by hand, with no flags at all, still knows to pull.
    #
    # The cage is read from data - see copilot-cage.json, verified against a
    # live CLI and carrying the record of what was wrong before.
    $cage = Get-Content (Join-Path $ws "_cage\copilot-cage.json") -Raw | ConvertFrom-Json
    $cageArgs = @($cage.mcp_args) + @($cage.exclude_args) + @($cage.allow_args) + @($cage.deny_args) + @($cage.extra_args)
    Write-Host "$P - agent host: GitHub Copilot CLI" -ForegroundColor Cyan
    if ($ownTerminal) {
      Write-Host "$P - own terminal: the agent runs in THIS window, kickoff included" -ForegroundColor Cyan
      copilot @cageArgs -i $kickoff
    } else {
      Write-Host "$P - the agent runs in the Mirror's terminal pane, in the background" -ForegroundColor Cyan
      node (Join-Path $root "project\deliverable\engine\bin\se-pty.ts") --pty-port 7334 --detach -- copilot @cageArgs -i $kickoff
    }
  } elseif ($ownTerminal) {
    Write-Host "$P - own terminal: the agent runs in THIS window; the Mirror's terminal pane stays empty" -ForegroundColor Cyan
    claude $kickoff
  } else {
    Write-Host "$P - the agent runs in the Mirror's terminal pane, in the background" -ForegroundColor Cyan
    node (Join-Path $root "project\deliverable\engine\bin\se-pty.ts") --pty-port 7334 --detach -- claude $kickoff
  }
} finally {
  Pop-Location
}
