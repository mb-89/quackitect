---
kind: matrix-row
name: cut-criteria
statement: "Three acts in order: cut what does not differentiate, sort by what breaks, then draw the line — all before a single score is written."
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
    description: what was cut, the order that survived, and the line drawn across it
    guidance: |
      THREE ACTS, IN THIS ORDER. Out of order is how the last one comes
      out wrong.

      ONE. CUT WHAT DOES NOT DIFFERENTIATE. Strike a row by writing its
      reason in the cut cell. It stays on the page, struck. This act is
      BLIND TO IMPORTANCE: an axis every candidate meets identically is
      out whether it is fatal or cosmetic.

      TWO. SORT, IN TWO STEPS. The page ARRIVES roughly sorted, worst
      breakage first, read from `breaks_how_badly`. Nobody types that.

      Then CHECK it. Walk the rough order and push a row up or down
      where it is wrong — the same act a person makes, with the same
      arrows. A moved row owes a rationale, and the submit refuses
      without one.

      Most of the work is inside a band. Five levels leave dozens of
      rows tied, and the machine has nothing to say about a tie.

      THREE. DRAW THE LINE. Press `cutoff` on the last row that is still
      a criterion. Everything below is out by position and owes no
      reason of its own.

      THE TARGET IS THE VITAL FEW. Eleven is the reference, not a rule
      (owner ruling 2026-08-09). Go above it where the rows genuinely
      earn it, and say which ones did.

      FIFTY IS NOT A CUT. A line that leaves most of the pool standing
      has drawn nothing, and neither has a cutoff on the last row.

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

THREE ACTS LIVE HERE, AND THE ORDER BETWEEN THEM IS THE WHOLE POINT (owner ruling 2026-08-09).

- ONE, CUT. Strike every axis no candidate differentiates on. Blind to importance.
- TWO, SORT. Rough it out mechanically by what each row BREAKS, then CHECK it.
- THREE, THRESHOLD. Draw the line across the sorted survivors.

THE SORT IS TWO STEPS, NOT ONE (owner ruling 2026-08-09).

- THE ROUGH SORT IS THE MACHINE'S. It reads `breaks_how_badly` and orders worst first. Nobody types it.
- THE CHECK IS A JUDGMENT, and the agent makes it exactly as a person would. Read the rough order and push a row up or down where it is wrong.

A MOVE IS THE SAME ACT WHOEVER MAKES IT. Agent or person, it is one row past another and it owes its reason. The submit refuses a move with no rationale, and the gate reads a move apart from the boundary.

WHY THE CHECK EXISTS. A five-level scale puts dozens of rows in one band, and inside a band the machine has nothing to say. That is where the judgment belongs, and it is cheap because it is local: a row only ever argues with its neighbours.

WHY THE CUT COMES FIRST. Sorting a pool that is about to lose half its rows spends judgment on rows that are leaving, and it puts a struck axis above a live one on the page.

WHY THE SORT IS NOT DERIVE-CRITERIA'S. That state produces the POOL: which requirements are criteria, and which of them compound into one axis. The order it happens to enumerate in is not an importance claim, and reading it as one is what put a response-time row above the foundations of the system.

THE SORT IS MECHANICAL, SO IT CANNOT BE AIMED. It reads `breaks_how_badly`, which every requirement carries and which is authored at M3, before any candidate exists. Moving the sort to this state therefore costs nothing in blindness: the KEY is still fixed before the options are known, and that is what the guard was ever protecting.

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
- BELOW THE LINE — the axis discriminates and sorted outside the vital few. Out by position, not on its merits, and it owes no reason of its own.

A ROW'S FUNCTION PREDICTS WHETHER IT WILL DISCRIMINATE, and it is one frontmatter field away. A criterion whose function is not the one under redesign is a CANDIDATE for the no-differentiation cut, because every option leaves it untouched by construction.

THAT IS A FILTER AND NEVER A VERDICT. It says where to look first, not what to cut. The cut still owes its own check against the candidate records.

WHAT IS NOT A LEGAL REASON TO CUT: it looks like they are all about the same, the axis seems minor, or scoring it would be work. The first is a guess, and the ranking moves when a guess is wrong.

THE LINE IS DRAWN HERE, AND ONLY HERE. One drawing is enough because the ORDER under it is mechanical: the boundary takes a prefix of a computed sort and cannot promote anything past it.

THE VITAL FEW IS THE TARGET, and eleven is the reference rather than the rule (owner ruling 2026-08-09). More than eleven is right where the extra rows genuinely earn it; fifty is not a cut, and a cutoff on the last row is not one either.

DRAW THE LINE ON THE SCALE, NOT ON A COUNT. A boundary between two damage levels says something a reader can check: everything above ends the product or stops a use case, everything below is routed around. A boundary at a number says only that somebody stopped counting.

"EVERYTHING STILL DISCRIMINATES" IS NOT AN ARGUMENT FOR NOT CUTTING. The first act already removed everything that does not. What is left still differs in how much its loss costs, and that is what the line is for.

SO THE GAMEABLE SURFACE IS ONE NUMBER: how deep the cut goes. That is visible at a glance, and the gate reads it.

THE OVERRIDE IS A DOOR THROUGH THE METHOD, DELIBERATELY (owner ruling 2026-08-08, made with the risk named). It is the only place a person catches a criteria set that came out wrong, and that check is worth the door.

ONE EDIT IS SHARPER THAN THE OTHERS. Pulling a single row across the line out of rank order jumps the blind ordering, and it is the edit that can be aimed at a favourite. The gate reads it apart from a boundary move.

CUTTING NOTHING IS A NORMAL OUTCOME on a well-derived criteria set, and the gate does not read it as laziness. Half the axes cutting is the signal that the criteria were derived without a clear enough picture of what varies.

The busbar sits here: the candidate machine's parallel compose states rejoin at this state, so every composed candidate is in hand before any axis is judged.

The method is [[meth-derive-criteria]], which owns the three cuts and says which one lands where.
