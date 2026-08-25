---
kind: matrix-row
name: onboard-retro
statement: "Onboarding opens with the retro: the field-feedback question first, then the notes inbox drains."
state_kind: work
filled_by: agent
same_as: retro
depends_on:
  - spawn-the-hands
evidence:
  - name: field_feedback
    description: what came back from the field, or an explicit "nothing yet"
  - name: notes_drained
    description: what happened to each pending note, in one word and a reason
    template: per-item
    items:
      - $inbox
  - name: call_log_mined
    description: counts and rejection clauses since the last retro, one lead per line
    template: list
  - name: waste_leads
    description: rework or waste found in the record
    template: list
    required: false
  - name: promotions
    description: local changes worth promoting to the template they came from. One per line, or none-found stated. The previous record's emit_back list is the first place to look, and never the only one.
    template: list
  - name: process_stale
    description: the standing state-of-the-art check on the process itself
major: full
minor: full
patch: tailored
product: full
specification: tailored
major_note: |
  Applies in full: field feedback, inbox drained, call history mined. A
  major deserves the cleanest possible start.
minor_note: |
  Applies. A minor is an iteration, and every iteration opens with the
  retro: field feedback first, inbox drained, call history mined. The
  cadence exists exactly for work of this size.
patch_note: |
  Applies, tailored (owner adjudication 2026-08-04: the strike proposal
  is rejected). A patch is an iteration, and every iteration opens with
  the retro - for a patch it is what decides what rides in: field
  feedback first, then the inbox sweep.
product_note: |
  STANDING STATE: the retro cadence itself. At rest the product shows a
  near-empty notes inbox, a drained backlog with ready-when conditions,
  and a process that has been checked against the state of the art within
  living memory. An inbox that only ever grows is this cell failing.
specification_note: |
  Leaves no book chapter. The retro's trace is the drained notes and the
  log; the book does not teach process history. What DOES surface: rules
  the retro minted land in their guidance homes, which the book's
  guidance chapter lists.
---

## Guidance

The seam this row adds: onboarding OPENS with the retro - the field-feedback question first - and the kickoff refuses while the inbox pends. Everything else about the retro is the referenced state's truth (same_as: retro), never restated here.

AN EMPTY INBOX SKIPS THIS ROW. Survey first. If nothing pends, do not run it - pull onward.

THE DOUBLE-FIRE IS WHY. A retro at the desk, then an iteration opened straight after, ran the whole retro twice within minutes with nothing left to drain the second time. The owner's words: "if the onboarding retro doesn't fire, then you just skip it. If we have just done a retro, we don't need another one."

THE FIELD-FEEDBACK QUESTION IS NOT SKIPPED BY THIS. It was asked by the retro that emptied the inbox. What is skipped is asking it again in the same sitting.

THIS IS THE CATCHING END OF THE EMIT. The previous record's `package` state filled `emit_back` with what it learned about the shared method. `promotions` is where that list is looked at and either landed or explicitly dropped. [[meth-emit-back]] holds both ends.
