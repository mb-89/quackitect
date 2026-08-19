---
minted_in: i36
id: raid-asm-an-engineer-can-tell-stop-hook-from-cancellation-today
type: "[[raid]]"
kind: issue
statement: An engineer watching this session could not tell a stop-hook block apart from a host-side cancellation or a lost MCP connection from chat context alone, and the ambiguity surfaced as a live ECONNRESET report.
owner: the driving agent
trigger: any future interruption reported before req-interrupted-call-names-the-stopping-layer ships
status: open
breaks_how_badly: corrosive
how_likely: expected
impact: The engineer spent a turn asking the agent to investigate rather than reading a report the system did not yet produce. Every future interruption repeats the same guesswork until the requirement ships.
source_refs:
  - project/spec/iterations/i36-the-harness-is-not-claude-measure-what-e/evidence/pressure-test.md
  - req-interrupted-call-names-the-stopping-layer
weighs_with: none
weighs_against: none
---

## Finding

Was recorded as an assumption at identify-assumptions, then probed against
today's own session: a `se_pull` call was cancelled, the harness's MCP log
showed a raw `ECONNRESET`, and the owner asked the agent to investigate
because nothing told either of them which layer had actually ended it.

Checking the mirror directly (`Get-NetTCPConnection -LocalPort 7333`, then an
HTTP request to `/`) showed the same process still listening and answering.
The next `se_pull` succeeded with no restart. So the call was a plain
cancellation, not a server crash — but nothing in the product said so; only a
manual side-channel check settled it.

## Why this is an issue, not a risk

It already happened, in this very session, so the RAID kind rule (present
tense, hurting now) makes it an issue rather than an assumption that might
turn out false later.

## Fallout

`req-interrupted-call-names-the-stopping-layer` already exists to close this
exact gap and is the sole thing tracking it; nothing else cites this entry
yet, so there is no further fallout to chase.
