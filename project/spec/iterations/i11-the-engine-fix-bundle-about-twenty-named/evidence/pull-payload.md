---
form: pull-payload
by: agent
signed_off: 2026-08-16T12:30:23.412Z
authors: agent
files: null
---

# Evidence form / pull-payload

## current_situation

THE ECHO IS A RECEIPT NOW, NOT A COPY OF THE RECORD.

WHAT THIS DOES NOT FIX. The mirror's own copy is unchanged and still carries the whole corpus, which is correct — it renders cards from ids and needs the facts behind them.

THE GENERAL RULE IS STILL OWED. The comment on `formForAgent` names it: a size limit on every lane answer, with a handle to page the rest, so this class cannot reappear somewhere else. The bounded-answer machinery already exists — it is what saved this very answer to disk — so what is missing is the limit being applied at the source rather than at the wire.

THE COST OF NOT HAVING IT, seen twice today: a 290KB answer is moved to disk by the host, and `problems` — the one field that says why a claim refuses — is the field that never arrives.

## built

THE PULL STOPPED SHIPPING WHAT NO AGENT READS, and the cut is four things.

### Measured first, on this iteration's own walk

ONE ORDINARY SUBMIT ANSWERED 290,280 BYTES. Of its 5,311 lines, 5,080 were things the agent cannot use — 95.6%.

- `ref_paths` and `ref_facts`: 5,080 lines, the path and statement of EVERY node in the record.
- `field_args`: 27 keys for one free-form field, every one `""`, `[]`, `{}` or `null`.
- `template.fields`: the field list a second time, name for name.
- `fields[].content`: the 8,000 characters of evidence the agent had written one call earlier.

### The fix was mostly already written, and one path bypassed it

`formForAgent` HAS STRIPPED THE CORPUS SINCE i3, with a comment measuring the same waste at 380,000 characters. Every `forms:` path in the pull calls it — three of them.

`form_saved` DID NOT. The echo handed back after a submit went through `formGet`, the mirror's copy, which carries everything. So the corpus came back on exactly the calls that had just sent 8KB up the wire.

### What landed

`agentCopy(form, echo)` in `engine/session.ts` replaces the one-line strip.

- Drops `ref_paths` and `ref_facts`. The MIRROR still gets them through `formGet`, which is untouched — a card asking which of two rows matters more genuinely cannot be answered from two ids.
- Prunes every blank out of `field_args`, `field_hints` and `template_meta`, recursively. `false` survives on purpose: it is an answer, not a blank.
- Drops `template.fields` and keeps the rest of `template`.
- On an ECHO only, replaces each field's body with `chars`.

### Why the echo and not the owed form

A FORM THAT IS OWED KEEPS ITS CONTENT. A half-filled form coming back must show what already stands — that is exactly what stops a reopened claim being answered from scratch, which walking.md calls out as the waste the `recheck` block exists to prevent.

WHAT IS DROPPED IS THE COPY HANDED STRAIGHT BACK TO WHOEVER JUST SENT IT. The length stands in for the body, and it proves the one thing the sender cannot check itself: that the text landed whole.

### Green

36 of 36 across `pull.test.ts`, `pull-offer.test.ts`, `pull-seam.test.ts`, `forms.test.ts`, `field-omit.test.ts` and `stamp.test.ts` — run `test-msvs6a93-5`.

## follow_up

NOTHING BLOCKS. The chunk is built and its suites are green.

ONE THING FOR `audit-the-twenty`. The chunk statement named three defects and the measurement found a fourth, larger than all three: the corpus riding the echo. Whoever walks the audit should check whether the same bypass exists on any other answer that takes the mirror's copy rather than the agent's.

NEXT: `lane-shape`, then the stop-at dial at `mirror-buttons`.

## anything_else

