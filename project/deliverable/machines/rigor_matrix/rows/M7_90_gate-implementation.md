---
kind: matrix-row
name: gate-implementation
statement: "GATE implementation: built inside the baseline, verified green across all iterations."
state_kind: gate
busbar: true
filled_by: agent
depends_on:
  - verification
legal_tools:
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_test
evidence:
  - name: quality_ok
    template: choice-with-rationale
    options:
      - acceptable
      - not-acceptable
    description: "internal quality over the mechanical floor — the judgment, with its reason on the line"
  - name: debt_taken
    description: "the debt accepted this iteration: one note ref per line, or none with the why. Every quick-and-dirty is a visible backlog note."
  - name: risks_acceptable
    template: choice-with-rationale
    options:
      - acceptable
      - not-acceptable
    description: "the implementation risks added or regraded this iteration, judged — name the raid ids in the rationale, or say none moved"
major: full
minor: full
patch: tailored
product: full
specification: tailored
major_note: |
  Applies in full: the machine already proved the mechanics upstream.
  This gate judges what no law can - internal quality with its debt,
  and the risks.
minor_note: |
  Applies in full: the same two judgments over the delta. The delivery
  gate does not scale down.
patch_note: |
  Tailored: the mechanics are proved upstream even for a patch (the
  reproduction failed first, the battery is green, the sweep held). The
  two judgments remain.

  ESCALATE: an unsanctioned element in the diff sends the work to major
  through the architecture gate - the same law as at every size.
product_note: |
  Standing obligation: the code and the baseline agree - the
  models-adhered check has held at every size, so no unsanctioned element
  exists. The product-level audit of this claim is the overhaul's job.
specification_note: |
  DOCUMENT FORM: the gate record into the derived milestone table, as at
  every gate.
---

## Guidance

Review per [[meth-gate-review]]. FIVE CHECKS LEFT THIS FORM because the
machine proves them upstream (owner ruling 2026-08-11):

- build planned — the seeded drawing refuses build-steps when absent
- red observed — observe-red's law, per spec, at its birth
- designs realized and models adhered — trace-design's sweep, both ways
- verification green — the battery and the claims table, law-checked

What remains is JUDGMENT. Internal quality per the SyA chapter
(@ai/sya_kb/digest/sya/22_Driving-Internal-Quality.md): the mechanical
floor is green by construction; what needs a human-grade eye is the
DEBT — every quick-and-dirty taken this iteration stands as a visible
note, listed in debt_taken, and the choice says whether the sum is
acceptable. Risks the same: what the build added or regraded, judged.

A genuinely-needed new element goes back through the architecture gate,
as always.
