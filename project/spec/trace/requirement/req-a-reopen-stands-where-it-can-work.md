---
minted_in: i3-the-walk-s-feedback-loop-the-reading-cre
id: req-a-reopen-stands-where-it-can-work
type: "[[requirement]]"
statement: When several steps reopen at once, the engine shall stand the walk only in those with no other reopened step upstream of them.
kind: functional
verify_method: test
breaks_if_removed: The mirror paints every reopened step as live and the pull offers every one of them, while the input check refuses each in turn on arrival. The drawing says eight positions where one is true, and nobody can adjudicate from it.
breaks_how_badly: corrosive
refines:
  - uc-take-a-step
source_refs:
  - "engine/machine.ts reopenStates, the token assignment"
  - "the owner's report 2026-08-13: gate-kickoff and write-requirements live together"
  - "tests/tokens.test.ts, the reopen token set"
priority: must
---

## Detail

- A reopened step BELOW another reopened step gets no token. Its inbound fuel
  is dropped by the same reopen, so it re-arms and fires again once its
  feeders sign.
- A genuine fork keeps every one of its tokens. Two reopened steps with no
  path between them are both frontier.
- Argument order must not decide it. The moved-demand list arrives in whatever
  order the size record yields.

## Behaviour

Three steps on one chain, kickoff before requirements before build. A size
change moves the demands of kickoff and requirements.

    reopen [kickoff, requirements]
      -> token on kickoff
      -> requirements is reachable, not stood in
      -> build keeps its own claim until requirements signs again

The transition that must NOT exist is a token arriving on `requirements`
before `kickoff` signs. Today it is placed there directly, and that is the
defect.
