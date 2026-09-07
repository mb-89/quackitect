---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: lane answers before building
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: cage
---

## detail

A fresh clone gets no tool lane for the whole session, and every agent on that box works crippled. Measured here on 2026-09-04: the harness answered quackitect (CONNECTION_CLOSED) at session start, and no se_ tool existed for the rest of the session. THE CHAIN. .mcp.json names node ./util/cage/mcp-lane.mjs. .bin is not in version control, so a clone carries no se-mcp. mcp-lane.mjs:36 sees the file missing and calls spawnSync on the installer, which runs go run over four modules, one of them cgo SQLite. The script says so itself at line 37: this takes a few minutes once. The harness waits for initialize on a timeout of seconds, gets nothing, and drops the server for the session. Nothing brings it back. THE BUILD DID FINISH. .bin/se-mcp is an ELF file in this tree now, and the engine answers ./RUNME.sh. So the lane was not unbuildable, it was late. WHY NOTHING ELSE CATCHES IT. The harness spawns MCP servers before SessionStart, so .claude/hooks/session-start.sh cannot build in time, and mcp-lane.mjs:9 already says this. The standing check mcp-tools drives the lane, and it runs where .bin is already built, so it never sees the cold case.

## proposed action

Take the build off the protocol path. Two parts. ONE: the stub answers the harness at once. It stops using stdio inherit, reads standard input itself, answers initialize and ping from a static reply, and forwards everything else to the child once the child is up, buffering what arrives meanwhile. TWO: a cold start comes up in seconds rather than minutes. src/mcp is eleven files of pure Go with no cgo, and the lane needs the engine at tool-call time rather than at start. So with nothing built the stub runs go run ./src/mcp rather than the whole installer, and .bin/se stays SessionStart's job as it already is.

## approach

Read wk-286ed8482b first. It retires the lane once level 0 registers the tools, and this fixes the cold start of the door that token deletes. Where the retirement is near, the honest answer may be to close this rather than build it.

If it is built, the shape is the one the proposed action names, as an interface.

The stub owns standard input. It answers initialize and tools/list itself, from laneTools rather than from a second list, so the cold answer and the warm answer cannot drift. Everything else is queued until the child is up, then forwarded in order.

The cold path runs go run ./src/mcp, which is eleven files of pure Go. The installer leaves the protocol path entirely, and .bin/se stays SessionStart's job.

The red is a tree with .bin renamed away. A standing check drives that case, so a box with .bin built cannot hide it.

## done when

- from a tree with .bin renamed away, node util/cage/mcp-lane.mjs --method . --work . answers a JSON-RPC initialize within 10 seconds
- the same cold stub answers tools/list with the tool names laneTools declares, read from that function rather than from a second list
- no call to spawnSync on the installer is left in util/cage/mcp-lane.mjs while standard input carries the protocol
- the standing check mcp-tools still passes on a tree with .bin built
- a standing check drives the cold case, so a box with .bin already built cannot hide it

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the approach is on the token before any work, as an interface or a shape a reader can disagree with |  |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the change is small enough to review whole, or it is split first | — |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | the change follows the approach on the token, or the token says why it departed |  |  |
| [ ] | se test --on this token answered ok, and what it ran is named |  |  |
| [ ] | the note says what changed and why, for a reader who was not here |  |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

