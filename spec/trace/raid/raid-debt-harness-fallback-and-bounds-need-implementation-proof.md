---
minted_in: i36
id: raid-debt-harness-fallback-and-bounds-need-implementation-proof
type: "[[raid]]"
kind: debt
looked: 2026-08-25
statement: The research fallback and answer-bound changes are started but not yet proven on the live harness path.
owner: the driving agent
trigger: implementation begins after the motivation gate
status: open
breaks_how_badly: corrosive
how_likely: expected
impact: Treating the started code as complete would leave a red test suite and could make boot or spill recovery less reliable.
source_refs:
  - spec/references/ref-agent-harness-portability-2026-08-19.md
  - spec/trace/raid/raid-host-payload-offload-breaks-read-proof.md
  - spec/trace/raid/raid-mcp-stop-is-not-diagnosable.md
last_looked: 2026-08-23
look_verdict: rescheduled
---

## Repayment

- Fix spill resolution in the test and live server roots.
- Place the regenerated prompt layer and skill projections.
- Make the focused MCP, cage, skill, answer-bound and file-reader tests green.
- Reload the engine.
- Prove a boot result stays inline or follows a working character cursor.
- Prove `se_web_search` returns results without a configured Brave key.
- Prove a failed provider returns an honest native-search handoff.
- Prove interruption output distinguishes the stopping layer.
- Fix `se_web_fetch` to report the final URL after a redirect and apply
  `offset` paging against that resolved page, not the pre-redirect one.
- Refresh unreachable Codex, Cursor and Claude primary sources or keep their claims unverified.

## Swept 2026-08-20, at the standalone retro after i37 shipped

RE-AFFIRMED AS STANDING, trigger unchanged. i37 did not touch what this entry
is about, so nothing here moved.

THE LOOK IS THE POINT. A debt nobody re-reads is a lie in the ledger, and this
line is the evidence that somebody read it on this date.


## Looked 2026-08-25 — the bounds half is proven, the fallback half is the finding

FIRST DATED LOOK. This entry had never been re-read.

THE BOUND PATH IS PROVEN ON A LIVE HARNESS. Every answer over the limit spilled
to disk, carried its first page inline and handed back a cursor, and paging the
cursor rebuilt the answer. That happened dozens of times in one session on
Windows, and nothing was lost.

THE FALLBACK HALF IS WHERE THE COST IS. The limit in force was the cautious
default, because this machine had never measured its own. A cloud box measured
more than six times that figure. So the mechanism works and the number it works
with is a guess nobody is told about.

That half now stands as its own work token, and the owner ruled on 2026-08-25
that any host which does not know its limit measures it at start-up.
