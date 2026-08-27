---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-dec-read-credit-is-global-across-positions-and-never-across-sessions
type: "[[raid]]"
kind: decision
statement: Read credit is global across positions within one hand's session, and it never crosses a session.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - "owner ruling, 2026-08-26"
  - req-reading-credit-survives-a-reload
  - "deliverable/engine/sessionreads.ts lines 88 to 100"
  - raid-asm-read-evidence-outlives-the-session-that-produced-it
---

## What was decided

THE OWNER'S WORDS: closing the editor or starting a new agent should not carry
read evidence. Only an engine restart DURING a session needs it to survive.

SO "GLOBAL" IN THE KICKOFF GOAL MEANS ACROSS POSITIONS, within one hand's
session. Read a document once, and do not owe it again at the next state
demanding the same document.

## Why the goal itself does not carry this

THE ENGINE REFUSED THE APPEND, and it was right to. The goals field is read by
the goals_served round of every gate below the kickoff, so changing it is a
reopen rather than a correction. The owner ruled that nothing was to be
reopened for this.

THIS NODE IS THEREFORE THE GOAL'S FOOTNOTE. Anybody reading the goal's word
"global" and wondering about its scope is answered here.

## Rejected options

CREDIT CROSSES SESSIONS. Rejected by the owner, and the engine already argues
against it in its own comment: a hand does not survive a restart either, so its
reading cannot. Credit carried into a new session asserts something false about
the only party a reading proof is about.

ONE SHARED LEDGER FOR EVERY HAND. Rejected, and it was tried. It let a freshly
spawned walker inherit credit for pages it had never seen, and the gate then
reported the reading done to a hand holding none of it.

CREDIT DIES ON AN ENGINE RELOAD TOO. Rejected: the hand is still there and still
holds what it read. The engine losing its own memory is not the hand forgetting.

## Consequences

NOTHING IN THE ENGINE CHANGES. Credit is already per reader, already written to
the session settings, already keyed per version, and already lost with the hand.
Every one of those is what this decision asks for.

THE ASSUMPTION AGAINST IT CLOSES.
[[raid-asm-read-evidence-outlives-the-session-that-produced-it]] measured the
design against a scope nobody asked for.

THE GOAL'S WORDING STAYS AMBIGUOUS ON THE PAGE. That is the cost of not
reopening, and it is paid knowingly. This node is what a reader has to find.

A LATER RECORD MAY STILL FIX THE WORDING, at a moment when reopening the
kickoff costs nothing because nothing below it stands.
