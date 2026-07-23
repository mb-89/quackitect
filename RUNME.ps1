# RUNME — run me: start an agent in the workspace.
# Setup happens only when missing. Verification lives in `npm run verify`.
$ErrorActionPreference = "Stop"
$origLocation = Get-Location

function Fail($msg) { Write-Host "RUNME: $msg" -ForegroundColor Red; Set-Location $origLocation; exit 1 }

# Node >= 22 (type stripping + node:sqlite)
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "RUNME: Node not found - installing via winget..."
    winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    if (-not $?) { Fail "winget install failed; install Node >= 22 manually" }
    Write-Host "RUNME: Node installed - open a fresh terminal and re-run RUNME.ps1"
    exit 0
}
$major = [int]((node --version).TrimStart("v").Split(".")[0])
if ($major -lt 22) { Fail "Node >= 22 required, found $(node --version)" }

if (-not (Test-Path "$PSScriptRoot\product\deliverable\node_modules")) {
    Push-Location "$PSScriptRoot\product\deliverable"
    try { npm ci; if (-not $?) { Fail "npm ci failed" } } finally { Pop-Location }
}

# Start the agent in the workspace. Claude is the default; Copilot is the
# fallback when Claude isn't installed.
Set-Location "$PSScriptRoot\workspace"
try {
    if (Get-Command claude -ErrorAction SilentlyContinue) {
        claude
    } elseif (Get-Command copilot -ErrorAction SilentlyContinue) {
        # Copilot CLI has no repo-level MCP config yet - register the se server
        # in the user-level config (idempotent merge, absolute paths).
        $copilotHome = if ($env:COPILOT_HOME) { $env:COPILOT_HOME } else { "$env:USERPROFILE\.copilot" }
        New-Item -ItemType Directory -Force $copilotHome | Out-Null
        $cfgPath = Join-Path $copilotHome "mcp-config.json"
        $cfg = if (Test-Path $cfgPath) { Get-Content $cfgPath -Raw | ConvertFrom-Json } else { [pscustomobject]@{} }
        if (-not $cfg.PSObject.Properties["mcpServers"]) {
            $cfg | Add-Member -NotePropertyName mcpServers -NotePropertyValue ([pscustomobject]@{})
        }
        $se = [pscustomobject]@{
            command = "node"
            args    = @("$PSScriptRoot\product\deliverable\bin\se-mcp.ts", "--root", "$PSScriptRoot")
        }
        if ($cfg.mcpServers.PSObject.Properties["se"]) { $cfg.mcpServers.se = $se }
        else { $cfg.mcpServers | Add-Member -NotePropertyName se -NotePropertyValue $se }
        $cfg | ConvertTo-Json -Depth 10 | Out-File $cfgPath -Encoding utf8
        copilot
    } else {
        Fail "no agent CLI found - install Claude Code or GitHub Copilot CLI, then re-run"
    }
} catch {
    Set-Location $origLocation
    throw
}
