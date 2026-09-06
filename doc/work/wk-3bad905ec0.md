---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: lane socket mirrors engine
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-elgar
claimed_by: aeaf7bd9/worker-elgar
claimed_at: "2026-09-05T12:02:26Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 585889dba03a0e3ad0e866cc4bb7d9d658341b1c
  - 6f7695cf0c30136f6b971ad02fb3b9bc00aec8c8
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 88f23140771ff331c858f06b8e7227d505af7963
  - f447a1aaf56b13a48e6ec7741dc336bf18acac2d
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: "util/checks/mcp-tools.mjs now starts a second engine over a 96-byte folder, makes each engine's record a folder so no beat can rewrite it, and asks se_claim whoami through the lane over the short and the long folder. With theEngineSocket at five bytes of hash the long case failed with no engine is running over, and at six both pass. The mirror is held by a check that drives the real engine."
---

## detail

Found reviewing wk-4ad15a5c86. theEngineSocket in src/mcp/model.go is a copy of socketPath in src/engine/socket.go: .se/engine.sock under the work folder while the path is under 100 bytes, and otherwise quackitect-<six bytes of sha256>.sock under the temporary folder. The lane dials it whenever the record names no socket, which is the path this token opened so a flapping record stops reading as a dead engine.

The two agree today, and nothing holds them together. The engine's tests use socketPath and the lane's tests use theEngineSocket, so each side is consistent with itself. A change to socketPathLimit, the hash width or the file name on the engine's side leaves the lane dialling a path nothing listens on, and the answer is "the engine is not answering on <path>. Start it again", which is the symptom this token fixed, come back with nothing naming it.

The record is the ordinary channel and names the socket on every beat, so the fallback is reached only when the record flaps or is gone. That is exactly when a wrong mirror would be found, by an agent rather than a check.

## proposed action

Hold the mirror with a check that drives the real engine: start one over a work folder, remove the socket from its record or the record itself, and ask the lane for a ping. Two work folders, one short and one long enough to cross the limit, so both halves of the rule are driven. util/checks/mcp-tools.mjs already drives the lane against the real engine and is the place for it. Or let the engine's ping answer its socket path and have the lane's test assert theEngineSocket equals it.

## done when

- a lane call with the record naming no socket reaches a real engine over a short and a long work folder, decided by: node util/checks/mcp-tools.mjs . exits 0 with those two cases named in its output
- changing the hash width in theEngineSocket alone makes that check fail, seen once and put back

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one block at the end of util/checks/mcp-tools.mjs, and ask() taking the folder it points the lane at |  |
| [x] | every done-when line is decidable, and names the command where one decides it | line 1 by se test --propose mcp-tools, which prints the short and long cases. Line 2 by changing sum[:6] to sum[:5] in theEngineSocket, go build -C src/mcp -o ../../.bin/se-mcp ., and the same check |  |
| [x] | the basics it stands on exist, or are minted first | liveEngine in util/checks/lib/engine.mjs, the lane's fallback to theEngineSocket, and se_claim whoami all existed |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token.md read, red recorded below |  |
| [x] | one test was written first and seen red for the reason expected | lane built at sum[:5]: mcp-tools said ok for the short folder (41 bytes) and FAIL for the long one (138 bytes), no engine is running over /tmp/mcptools-long-..., 1 failed |  |
| [x] | the same test was seen green after the change, and named | sum[:6] put back and the lane rebuilt, mcp-tools ok with both cases named, 0 failed |  |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | mcp-tools.mjs only: rmSync imported, ask(calls, over = work), and the block that starts an engine over a 96-byte folder, makes each record a folder so no beat rewrites it, and asks se_claim whoami |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | none. The diff on src/mcp/model.go against HEAD is wk-4ad15a5c86's fallback, not this token's |  |

