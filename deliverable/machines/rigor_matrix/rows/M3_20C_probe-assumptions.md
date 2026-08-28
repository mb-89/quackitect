---
kind: matrix-row
name: probe-assumptions
statement: Probe every standing assumption against the real channel, whenever it was recorded.
state_kind: work
filled_by: agent
depends_on:
  - identify-assumptions
entry_read:
  - deliverable/machines/methods/meth-assumption-probing.md
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_run
  - se_test
  - se_log_query
  - se_answer
evidence:
  - name: probes
    template: node-table
    of: raid
    items:
      - $assumptions
    columns:
      - probe
      - probed
    description: every standing assumption, with what its probe checked and when
    guidance: |
      Fill one row per assumption.

      - Open the assumption from its link.
      - Read it.
      - Run the check its Probe section names.
      - Write the outcome word in `probe`.
      - Say how you know, after the word.
      - Write the date in `probed`, as YYYY-MM-DD.

      The outcome word is one of four.

      - holds: the check ran, and the assumption survived.
      - false: the check ran, and it did not.
      - unprobed: no cheap check exists yet. Say why.
      - scheduled: it needs a spike. M6 carries it.

      A cell still holding its comment counts as empty.
      The submit refuses it by name.
major: full
major_complexity: C2/R3
minor: tailored
minor_complexity: C2/R3
patch: tailored
patch_complexity: C2/R3
product: full
product_complexity: C2/R3
specification: tailored
major_note: |
  Applies in full: every standing assumption probed, including the ones
  earlier iterations recorded. An architectural move on an unprobed
  assumption is the expensive way to find out.
minor_note: |
  Applies to the delta's new assumptions, plus any standing one whose
  trigger has fired since it was last probed.
patch_note: |
  One narrow duty: when the patch exists BECAUSE an assumption proved
  wrong, record that probe result and turn the entry into an issue.
  Otherwise nothing here.
product_note: |
  STANDING ARTIFACT: the probe record across the whole register. At rest
  every assumption is probed or carries a reason it is not, and a probe
  that aged past its trigger is re-run rather than trusted.
specification_note: |
  DOCUMENT FORM: probe results as EVIDENCE DOCUMENTS, one per probe,
  linked from the RAID entry they settle. The book links, never inlines.
---

## Guidance

THIS STATE'S INPUT IS THE RAID FOLDER, not the state above it. Every standing
assumption is probed, whenever it was recorded.

That is why identifying and probing are two states.
With one state doing both, "probe assumptions" naturally reads as "probe the
ones I just wrote". An assumption recorded in i1 is then never looked at
again, which is exactly when it has most likely gone stale.

ONE PROBE SETTLES WHAT A DATASHEET CLAIMS. Check the real channel:

- what the harness actually loads
- what the command actually exits with
- what the API actually returns
- what the platform actually does

A document saying a thing works is the claim, not the check. Reasoning that it
must hold is how the assumption got made in the first place.

THE CHEAPEST REAL CHECK WINS. A probe is minutes. If it needs a spike, that is
M6's work and the entry says so.

FOUR OUTCOMES, and each writes back to the node:

- holds — status probed, date stamped.
- false — the kind becomes ISSUE, because it has already happened.
- unprobed — status stays open WITH its reason.
- scheduled — M6 carries it.

NAMING A GAP DOES NOT CLOSE IT. Unprobed is legal, unexplained is not.

WHEN ONE TURNS OUT FALSE, FOLLOW IT UPWARD. Everything whose source_refs named
that entry now rests on something known false, and those items go in
`fallout`.

This is the payoff of the register being addressable. Nothing could be traced
back from a table row.

The method is [[meth-assumption-probing]], which the entry read demands before
this state opens. The register is [[meth-raid]].
