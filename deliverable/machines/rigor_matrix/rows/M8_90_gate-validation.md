---
kind: matrix-row
name: gate-validation
statement: "GATE validation: meets the need - and this bless IS the sign-off."
state_kind: gate
busbar: true
filled_by: agent
depends_on:
  - run-demos
  - sweep-consistency
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
  - se_prompt_place
evidence:
  - name: meets_need
    template: per-item
    items:
      - $value-props
    description: "per value prop: how this iteration's changes serve it - or untouched, honestly, and why that is fine. Cite the filled stories and the reports."
  - name: musts_demonstrated
    template: per-item
    items:
      - $must-stories
    description: "per must story: its demonstration report - performed for real, reference on file"
  - name: market_tier
    description: (market) the real-world checks green per meth-market-tier - required only when the iteration is declared to market
    required: false
major: full
major_complexity: C3/R4
minor: tailored
minor_complexity: C3/R4
patch: none
product: full
product_complexity: C3/R4
specification: tailored
major_note: |
  Applies in full: every value prop answered, every must story
  demonstrated end to end with its report on file. The slide law holds
  the whole corpus filled. The bless is the sign-off.
minor_note: |
  Scoped: the DELTA's props argued, its new must stories demonstrated,
  resident reports cited as they stand. The bless is the acceptance, as
  ever. The full all-stories walk belongs to product cadence, not to
  every minor.
patch_note: |
  Does not apply. The green battery, the refreshed slide and the sweep
  carry the validation burden at this size; the owner's look at the leave
  form is the acceptance. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  The product-level acceptance: every promise argued from filled
  stories, every must story's demonstration repeatable - reports on
  file, procedures re-runnable, never one-time theater.
specification_note: |
  DOCUMENT FORM: the gate record - the bless IS the sign-off, hash-bound,
  no second artifact. Renders into the derived milestone table.
---

## Guidance

Review per [[meth-gate-review]]. The bless is the acceptance act: hash-bound, channel-recorded - no second sign-off artifact.

TWO JUDGMENTS LEFT THIS FORM, one per field. Everything else went mechanical: the slide law holds every deck filled, the sweep is its own signed state, and gaps live in the register through raid_additions.

- meets_need answers PER VALUE PROP: what this iteration did for the promise, argued from the filled stories and reports. An untouched prop gets the honest line - untouched, and why that is fine - never a fabricated service claim.
- musts_demonstrated answers PER MUST STORY: the report of its real run.

Market iterations only: the expensive real-world tier per [[meth-market-tier]] is mandatory before this gate.
