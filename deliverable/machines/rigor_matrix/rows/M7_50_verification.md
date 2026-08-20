---
kind: matrix-row
name: verification
statement: The full battery runs mechanically - once, at the gate side, across all iterations.
state_kind: work
filled_by: engine
command: npm --prefix deliverable test
depends_on:
  - trace-design
exit_script:
  - deliverable/engine/bin/battery.ts
entry_read:
  - deliverable/machines/methods/meth-verification-discipline.md
legal_tools: se_file_read, se_file_search, se_file_glob
floor: true
evidence:
  - name: claims
    template: checklist
    items:
      - $claim-specs
    description: one checkbox per non-test spec — observed green by fresh eyes. The battery is the engine's and needs no field.
major: full
minor: full
patch: full
product: full
specification: tailored
major_note: |
  FLOOR - the full battery, engine-filled. Identical at every size.
minor_note: |
  FLOOR - the full battery, engine-filled, all iterations. Identical at
  every size.
patch_note: |
  FLOOR - never struck, at any size. The FULL battery runs, not only the
  new check: a patch's regressions land elsewhere, and only the whole
  battery sees them. Engine-filled, same as everywhere.
product_note: |
  FLOOR, and the product's heartbeat: the battery green at rest, always.
  A red trunk is the one state the product may never rest in.
specification_note: |
  DOCUMENT FORM: the run reference with full output under it, verdict in
  the gate record. The book's verification chapter derives pass state
  from the live suite, never from a pasted log.
---

## Guidance

The one place the full battery runs ([[meth-test-first]]), engine-filled.
Failure opens the fallback into fix-findings - collect everything, fix in
one pass, one confirm run. The command is the project's battery; each
project declares its own.

THE SUBMIT FIRES IT, and until i11 nothing did. `filled_by: engine` reached
three places in the code - a validation error, a priority, and a copied
field - and no path ever ran the command. So the agent ran the battery from
wherever it stood, which is the habit this row was written to prevent.

[[battery]] IS THE MECHANISM, declared as this row's `exit_script`. It reads
the `command` above rather than carrying its own, so the row stays the one
place the project's battery is named.

THIS STATE GRANTS NO TEST VERB, ON PURPOSE. It never did, and that is what
made the i11 refusal a trap for one afternoon: the battery was allowed only
here, and here could not call it. Nothing calls it now except the engine.

THE CLAIMS HALF IS THE SAME CHECKLIST IN GREEN (owner ruling
2026-08-11): every demonstration, inspection and analysis spec is
observed green — one deliberate check per spec, refused while any box
stands open. The battery carries no field: it runs mechanically and its
verdict records itself.

FRESH EYES VERIFY ([[meth-verification-discipline]]). A person adheres
to the card. An agent SPAWNS A TESTER SUBAGENT — fresh context, reads
the card and the specs, then verifies. The tester is a GATEKEEPER for
this state and its fix-findings loop: one tester across the rounds,
shown the deltas after each fix pass, never respawned to reread from
zero.

## A claim already owed against an open debt arrives PRE-FILLED

OWNER RULING 2026-08-15: "If a verification is already marked as debt, then
don't mention it again. We have them as debt, don't we? If we have, we need
nothing to do."

THE CLAIMS CHECKLIST ARRIVES BLANK EVERY ITERATION, so every iteration
re-adjudicates the same unwatched demonstrations. i12 spent two rounds of a
fresh-eyes verification on five specs that three open register entries
already carried.

THE RULE: a spec named in the source_refs of a register entry whose kind is
`debt` and whose status is `open` arrives as `- [owed] <spec> — <entry>`,
not as a blank box. The iteration then adjudicates only what its own delta
touched.

IF THE ENTRY CLOSES, the box goes blank again and somebody has to answer it.
That is the whole safety property: the debt carries the claim, and closing
the debt hands it back.

IT IS MECHANICAL. The checklist is built from a list of spec ids; a debt
entry lists spec ids in its own source_refs. Matching one against the other
is a set operation, and the entry's status is a frontmatter field.

THE REGISTER ALREADY SAYS SO ABOUT ITSELF.
raid-iss-whole-product-claims-reverified-by-every-record states the problem
in its own statement, and raid-debt-human-observed-demonstrations names the
four specs in its impact line: "Verification refuses while any claim box
stands open, so four specs nobody at a terminal can observe stop every
iteration from closing. The alternative is checking boxes on unobserved
claims, which is worse."

Both were written before i12 and neither is read by anything.
