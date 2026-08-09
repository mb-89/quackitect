---
kind: matrix-row
name: cut-criteria
statement: "The engine proposes the cuts, you confirm or overrule them — before a single score is written."
state_kind: work
busbar: true
filled_by: agent
depends_on:
  - run-candidates
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: cuts
    template: rank-cut
    items:
      - $criterion_axes
    page_size: 10
    description: the settled ranking, with the line drawn across it and every strike reasoned
    guidance: |
      The order is already settled. The decision here is where the line
      falls.

      Press `cutoff` on the LAST row that is still a criterion. Everything
      below it is out by position, and owes no reason of its own.

      Strike a row on its own merits by writing the reason in its cut
      cell. It stays on the page, struck.

      Move a row with the arrows if the blind ordering got it wrong. A
      moved row owes a rationale, and the submit refuses without one.

      The method is [[meth-derive-criteria]].
major: full
minor: none
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: every criterion checked against the composed set, the
  cuts reasoned by construction, the surviving axes handed to scoring.
  Cutting nothing is a legal and common outcome.
minor_note: |
  Does not apply. No candidate set exists at this size, so there is
  nothing to cut against. STRIKE PROPOSAL - owner adjudicates.
patch_note: |
  Does not apply. No candidate set exists at this size. STRIKE PROPOSAL -
  owner adjudicates.
product_note: |
  STANDING ARTIFACT: the cut record. It is what makes "why was that never
  weighed" answerable at the next major without re-arguing it.
specification_note: |
  DOCUMENT FORM: rides the design-output chapter's criteria table as a
  struck-through row with its reason. No separate section.
---

## Guidance

THE WEIGHTS ARE ALREADY FIXED, AND THIS STATE DOES NOT TOUCH THEM. It removes whole axes from the score table. Every surviving weight stays exactly where derive-criteria put it, and nothing walks back.

WHY IT IS ITS OWN STATE (owner ruling 2026-08-08). The cut needs the candidates, so it cannot run at derive-criteria. Run inside evaluate-set it would be made with the totals already visible, which is the same poisoning the weights-first order exists to prevent, arriving one step later. The house already rules that composing and evaluating never share a state. Cutting and evaluating do not either.

THE BAND IS ONE MARK, NOT A COLUMN (owner ruling 2026-08-08).

It used to ask four things of every row:

- `cut_proposed`
- `cut_verdict`
- `cut_reason`
- `criterion_band`

Over ninety rows that is the same question asked ninety times, with the
answers free to disagree.

One mark on one row cannot disagree with itself. It is also the only number
the gate has to read: how deep the cut went.

TWO KINDS OF CUT ARRIVE HERE, and they are not equally safe.

- NO DIFFERENTIATION — every candidate meets the axis identically BY CONSTRUCTION.
  - All four use the same render path. All three inherit the same lane.
  - Checkable from the candidate records, with no score anywhere.
- BELOW THE BAND — the axis discriminates and ranked outside the vital few. That boundary was drawn blind at derive-criteria, before any candidate existed.

WHAT IS NOT A LEGAL REASON TO CUT: it looks like they are all about the same, the axis seems minor, or scoring it would be work. The first is a guess, and the ranking moves when a guess is wrong.

THE BAND IS DRAWN HERE, AND ONLY HERE (owner ruling 2026-08-08). One drawing is enough because the ORDER is already locked. It closed at derive-criteria, upstream of the busbar, before any candidate existed. A boundary takes a prefix of that fixed ranking and cannot promote anything past it.

SO THE GAMEABLE SURFACE IS ONE NUMBER: how deep the cut goes. That is visible at a glance, and the gate reads it.

THE OVERRIDE IS A DOOR THROUGH THE METHOD, DELIBERATELY (owner ruling 2026-08-08, made with the risk named). It is the only place a person catches a criteria set that came out wrong, and that check is worth the door.

ONE EDIT IS SHARPER THAN THE OTHERS. Pulling a single row across the line out of rank order jumps the blind ordering, and it is the edit that can be aimed at a favourite. The gate reads it apart from a boundary move.

CUTTING NOTHING IS A NORMAL OUTCOME on a well-derived criteria set, and the gate does not read it as laziness. Half the axes cutting is the signal that the criteria were derived without a clear enough picture of what varies.

The busbar sits here: the candidate machine's parallel compose states rejoin at this state, so every composed candidate is in hand before any axis is judged.

The method is [[meth-derive-criteria]], which owns the three cuts and says which one lands where.
