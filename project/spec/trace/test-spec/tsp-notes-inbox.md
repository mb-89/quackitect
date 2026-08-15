---
minted_in: i1
id: tsp-notes-inbox
type: "[[test-spec]]"
statement: A stray is captured in one call from anywhere, stays visible until dispositioned, and drains into exactly one home, verified by test over the notes machinery.
method: "test"
verifies:
  - "req-stray-captured-in-one-call"
  - "req-capture-moves-nothing"
  - "req-idea-lands-as-note"
  - "req-duplicate-stray-still-captured"
  - "req-open-notes-stay-visible"
  - "req-drained-note-leaves-count"
  - "req-drain-one-home-with-payload"
  - "req-parked-note-re-drains"
  - "req-unknown-drain-ref-refused"
  - "req-retro-window-drains-whole"
  - "req-kickoff-refuses-pending-notes"
files:
  - "tests/feed.test.ts"
  - "tests/retro.test.ts"
  - "tests/surveywindow.test.ts"
---

## Scope

The note lane end to end: capture from any state, visibility until a
recorded disposition, the drain's one-home law with its payload, the
backlog's park-and-return, and the retro window that must reach zero.

## Approach

Component level. State-based over the note lifecycle: pending, drained
per home, parked, re-drained. Boundary cases at the drain (unknown ref,
missing payload, judgment homes outside the retro). Three claims are
DEFINED here ahead of their cases and land as named cases in
feed.test.ts and retro.test.ts with the builds that close them: the
duplicate stray still captured, the desk's idea-to-note routing, and
the kickoff refusing while the inbox pends.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: se_note is legal in EVERY state — a stray
is captured where it strikes; draining splits: done and obsolete
anywhere, carried and backlog only in the retro; the backlog home:
backlog demands its ready-when, parks the note, and migration re-drains
it; since last_retro: the log query scopes to the period after the
newest drain call.
