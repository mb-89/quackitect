---
minted_in: i51
id: raid-ar-walk-resumes-from-repo
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-walk-resumes-from-repo at risk — the response hinges on el-walk-engine's third standing.
owner: the adjudicator
trigger: a session ending while any step's leaving judgment is still deciding
status: open
impact: "A step left at the third standing has its judgment finish and its verdict reach nobody. Measured 2026-08-21 — the work survives losing its parent, and the answer has no route back into the record."
breaks_how_badly: fatal
how_likely: expected
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-walk-resumes-from-repo
  - req-a-pending-verdict-is-recorded-against-its-state
  - el-walk-engine
  - el-work-registry
  - raid-dec-a-step-s-standing-is-one-word-from-a-closed-set-of-three
---

Walked at evaluate-architecture by agent. The requirement is fatal and says the
walk is served from the recorded position using the repository content alone.

## The tradeoff, stated both ways

WHAT THE ARCHITECTURE BUYS. A pull returns inside its second while a leaving
judgment is still running. That is the whole point of i51, and the inline await
it removes is the single largest known contributor to the one-second breaches.

WHAT IT PAYS. A third standing exists that is true only while a process is
alive. `el-work-registry` holds the live operation and dies with the session;
the record keeps the word.

SO A CRASH LEAVES A WORD THE REPOSITORY CANNOT SETTLE. Before i51 there were
two standings and both were derivable from the tree.

## Why this is a risk and not an issue

THE STRUCTURE HAS A PLACE TO PUT THE ANSWER. `req-a-pending-verdict-is-recorded-against-its-state`
already demands the verdict land against its step, and
[[if-walk-engine-to-work-registry]] carries the settle call.

WHAT IS NOT DECIDED IS WHAT A FRESH SESSION DOES with a standing it finds
deciding and cannot match to a live process. Re-running the judgment is the
obvious answer and it is not written anywhere.

THAT DECISION BELONGS TO M7, and this entry is what carries it there.

## Where it was found

The ATAM walk, not a build. Nothing was measured, because there is nothing to
measure yet — this is a hole in what the structure says, and the entry says so
rather than pretending a number exists.

## Sharpened by two spikes, 2026-08-21

THIS ENTRY SAID THE WORK WAS LOST. It is not. Both halves were measured and the
truth is narrower and more fixable.

[[exp-does-a-left-check-survive-its-call]] SHOWED THE WORK SURVIVES. An orphaned
judgment whose starter had exited ran to completion and wrote its verdict.

[[exp-what-a-fresh-session-sees]] SHOWED THE ANSWER HAS NOWHERE TO GO. A running
job is recorded only under `.se/jobs/`, which `.gitignore` line 3 excludes. A
leaving verdict is weaker still: `deliverable/engine/sessionscript.ts` line 105
holds it in an in-memory Map and line 156 deletes the entry on settle, so it
never reaches disk at all.

SO THE FIX IS TWO FIELDS AND A SETTLE PATH. The operation record needs the state
it belongs to and the total its progress divides into. The verdict then lands in
the evidence form's frontmatter, where every other durable standing already
lives.

THE GRADE STAYS FATAL. `req-walk-resumes-from-repo` is fatal, and until the
settle path is built a fresh session still cannot serve the walk from the
repository alone.
