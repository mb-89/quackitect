---
form: expedition-leave
status: done
by: agent
files:
---

# e5 — evidence forms

## What was the goal

Build the evidence-form machinery the owner designed: a new condition type beside read and script, template-referenced (A3-style one-pagers), with a mechanical lint, the prefill law, the standard expedition-leave form unified with the report, and the mirror's fill surface for the human hand.

## What was done

- `engine/forms.ts`: template parser (same field-line grammar the compiler already speaks), the lint (required sections must carry VISIBLE content — HTML comments are invisible, so unconfirmed prefills never pass; listed files must exist in the record's evidence/ folder; status must be done), scaffold, surgical section writes, per-prefill confirm, status stamp.
- Condition type `evidence_form` registered with its note (machines/conditions/evidence_form.md); session evaluates it against the bound record; the refusal names each page's exact problems.
- Standard template machines/forms/expedition-leave.md — five sections, instance file report.md. Wired as `entry_evidence_form` on continue_expedition/leave: the gate out demands the page before leave can be entered.
- Session form API for both hands: formGet/formSave/formConfirm/formDone/formFolder — the human's done runs the same lint the agent's tick runs.
- Mirror fill surface: the condition shows "open form"; the details pane renders statement, fields as textareas, each unconfirmed prefill in its own box with its OWN confirm button, the evidence-folder link (opens the worktree folder), file presence marks, problems, save and done.
- The prefill law baked into product/guidance/voice.md (visual design rules).

## What settled it

59/59 selftests green. New coverage: template parse + refusals; the lint end-to-end including the prefill law (commented content blocks the pass, confirm-by-uncomment releases it), file existence, status; surgical write shape-holding (second prefill untouched, section-scoped replace, append); integration — continue_expedition compiles with the new condition, the gate reads unmet on prefill, met after confirm + done, and the form flow satisfies the close guard.

## What was not done

- No mirror redline yet — the fill surface follows the owner's verbal sketch; the owner's first live look will redline it.
- Forms only bind to expeditions (the bound record); iteration records reuse the same machinery later.
- The A3 layout is sectioned markdown, not a drawn A3 sheet; visual A3 rendering is open.
- This session's running server predates the build — everything goes live on the next restart.

## Files

Verification is the selftest suite in-tree; no separate evidence files.
