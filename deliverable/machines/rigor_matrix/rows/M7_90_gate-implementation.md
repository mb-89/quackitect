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
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_run
  - se_test
evidence:
  - name: quality_ok
    template: checklist
    items:
      - $iq_checklist
    description: the internal-quality checklist — the meth-internal-quality card holds the items and the debt rules. Checking each box is the claim.
  - name: debt_taken
    template: refs
    of: raid
    description: "the debt accepted this iteration: raid entries of kind debt, one reference per line, or one line saying none — with the why"
  - name: risks_acceptable
    template: choice-with-rationale
    options:
      - acceptable
      - not-acceptable
    description: the implementation risks added or regraded this iteration, judged — name the raid ids in the rationale, or say none moved
  - name: design_holds
    template: choice-with-rationale
    options:
      - holds
      - drifted
    description: "the design OUTPUT against the design INPUT that asked for it: does what was built still answer the requirements and use cases it was derived from? Quote the requirement and the design section that answers it. A design that drifted is a finding here, never a note for later — either the design comes back to the input, or the input was wrong and is amended through its own gate."
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
machine proves them upstream:

- build planned — the seeded drawing refuses build-steps when absent
- red observed — observe-red's law, per spec, at its birth
- designs realized and models adhered — trace-design's sweep, both ways
- verification green — the battery and the claims table, law-checked

What remains is JUDGMENT, shaped ([[meth-internal-quality]]). The
quality checklist is checked off deliberately — the card holds the
items, and an unchecked box refuses the submit. The DEBT is the
register's: every quick-and-dirty taken this iteration stands as a raid
entry of kind `debt`, and debt_taken references them. Risks the same:
what the build added or regraded, judged with its reason.

THE DRIFT CHECK RUNS IN THE OTHER DIRECTION FROM THE SWEEP (owner). The
trace's sweep asks whether the CODE realizes the DESIGN. This asks whether
the DESIGN still answers the INPUT — the requirements and use cases it was
derived from, several milestones back.

NOTHING ELSE ASKS IT. Every check between M3 and here reads downward:
requirement to function, function to candidate, design to code. A design
that quietly stopped answering its own requirement passes all of them,
because each hop only compares itself to the hop above.

QUOTE BOTH SIDES. The requirement in its own words, and the design section
that answers it. A verdict with no quote is `not answered` (contract rule
5), and this is exactly the kind of claim that reads as diligence while
saying nothing.

DRIFT IS A FINDING, NOT A DISCLOSURE. Naming it does not close it. Either
the design comes back to the input, or the input was wrong and is amended
through the gate that owns it.

A genuinely-needed new element goes back through the architecture gate,
as always.
