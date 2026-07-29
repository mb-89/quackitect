---
id: e24-fix-runme-ps1-gains-a-kill-flag-that-stops-e
kind: fix
status: open
opened: 2026-07-29T15:18:32.490Z
goal: "RUNME.ps1 gains a --kill flag that stops every leftover quackitect process, so a stale port never blocks a launch again.\n\nTHE TRIGGER (owner, 2026-07-29). A launch failed because something already held the port, left over from an earlier session. The owner wants `.\\RUNME.ps1 --kill` to clear every leftover in one command, then to relaunch by hand.\n\nWHAT LEAVES LEFTOVERS. Three node entry points, plus a child process.\n\n- engine/bin/se-mcp.ts — the MCP server. It embeds the Mirror on port 7333 (--mirror-port, SE_MIRROR_PORT).\n- engine/bin/se-pty.ts — the terminal host on port 7334 (--pty-port, SE_PTY_PORT). It is started DETACHED, so it outlives the window that launched it. This is the most likely culprit.\n- engine/bin/se-manual.ts — manual mode's mirror, also port 7333.\n- The caged claude or copilot process the terminal host spawns. Kill the process TREE, never only the parent.\n\nSHAPE. --kill changes how RUNME launches, not how the engine runs. So it joins --own-terminal and --manual in the flags RUNME consumes, and its help text is declared alongside the engine's in se-mcp.ts. ONE help, not two (owner ruling 2026-07-28). It must run BEFORE preflight and then exit, so killing a leftover never depends on npm install succeeding first.\n\nHONESTY. It reports what it found and what it killed. Finding nothing is a normal successful outcome and must read that way, never as a failure."
---

# e24-fix-runme-ps1-gains-a-kill-flag-that-stops-e

Free prose — the human head of the record. Machine-facing fields stay in the frontmatter.
