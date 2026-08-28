---
id: wt-the-four-biggest-mechanical-wins-the-rating-pass-found-each
type: "[[work-token]]"
statement: |-
  The four biggest mechanical wins the rating pass found, each with a measured failure behind it.

  WHAT THIS IS. On 2026-08-28 four hands read all 63 rigor-matrix rows to rate
  their complexity. The owner asked them to hunt at the same time: find the work
  a SCRIPT could do, so it can be written rather than typed.

  WHY THE RATING FOUND THEM. A row rated LOW on judgement and HIGH on reading is
  a step that reads a great deal and decides very little. That is the shape a
  script replaces, and the rating made it visible.

  WHERE THIS GOES. The speed-up round, when it is seeded. Until then it stands
  here rather than in a scratchpad, because a scratchpad does not travel.

  WHAT A READER SHOULD DO WITH IT. Treat each find as a candidate, not a ruling.
  Every one names the file and line it was read from, so it can be checked before
  it is believed.

  ## The four biggest, and each has a measured failure behind it

  1. A RULE STATED IN A ROW AND ENFORCED NOWHERE.
     `M4_30_evaluate-set` line 54 says "4 and 5 need that name. No name, no
     score above 3." `deliverable/engine/pareto.ts` lines 103 to 105 says in its
     own words that nothing checks them, and records the cost: 22 of 44 cells sat
     at the top two marks with that column blank, and the front was computed from
     it anyway.

  2. ONE EDITOR BUG PRODUCING FOUR FIELDS OF RETYPING.
     `deliverable/engine/editors/node-table.ts` line 15 builds every cell from
     the stored fill and never opens the node, against its own header comment at
     lines 5 to 6. `stateform-problems.ts` line 371 reads the values off the
     nodes, and line 677 then refuses the hand's table for any cell left empty.

  3. A COUNT CLAIMED, HELD NOWHERE, COMPUTED BY NOTHING.
     `M5_30B_decompose-structure` lines 97 to 98 name a `trace_complete` field
     holding the count of requirements reaching the structure. The field does not
     exist; the evidence list at lines 19 to 27 carries only two others. The
     computation is a plain graph traversal.

  4. A SWEEP WITH NO COMPUTED CANDIDATE SET.
     `M8_20A_sweep-consistency` line 57 orders the hand to list what the
     iteration changed. Its exit script checks markers and conformance only. A
     diff of the record's own commits would produce the candidate list, and the
     judgement would stay a hand's.


  ---
place: i68-the-walk-gets-fast-the-fixed-per-call-to
ready_when: ready when the speed-up round scopes its build
---

## Why it stands

The four biggest mechanical wins the rating pass found, each with a measured failure behind it.

WHAT THIS IS. On 2026-08-28 four hands read all 63 rigor-matrix rows to rate
their complexity. The owner asked them to hunt at the same time: find the work
a SCRIPT could do, so it can be written rather than typed.

WHY THE RATING FOUND THEM. A row rated LOW on judgement and HIGH on reading is
a step that reads a great deal and decides very little. That is the shape a
script replaces, and the rating made it visible.

WHERE THIS GOES. The speed-up round, when it is seeded. Until then it stands
here rather than in a scratchpad, because a scratchpad does not travel.

WHAT A READER SHOULD DO WITH IT. Treat each find as a candidate, not a ruling.
Every one names the file and line it was read from, so it can be checked before
it is believed.

## The four biggest, and each has a measured failure behind it

1. A RULE STATED IN A ROW AND ENFORCED NOWHERE.
   `M4_30_evaluate-set` line 54 says "4 and 5 need that name. No name, no
   score above 3." `deliverable/engine/pareto.ts` lines 103 to 105 says in its
   own words that nothing checks them, and records the cost: 22 of 44 cells sat
   at the top two marks with that column blank, and the front was computed from
   it anyway.

2. ONE EDITOR BUG PRODUCING FOUR FIELDS OF RETYPING.
   `deliverable/engine/editors/node-table.ts` line 15 builds every cell from
   the stored fill and never opens the node, against its own header comment at
   lines 5 to 6. `stateform-problems.ts` line 371 reads the values off the
   nodes, and line 677 then refuses the hand's table for any cell left empty.

3. A COUNT CLAIMED, HELD NOWHERE, COMPUTED BY NOTHING.
   `M5_30B_decompose-structure` lines 97 to 98 name a `trace_complete` field
   holding the count of requirements reaching the structure. The field does not
   exist; the evidence list at lines 19 to 27 carries only two others. The
   computation is a plain graph traversal.

4. A SWEEP WITH NO COMPUTED CANDIDATE SET.
   `M8_20A_sweep-consistency` line 57 orders the hand to list what the
   iteration changed. Its exit script checks markers and conformance only. A
   diff of the record's own commits would produce the candidate list, and the
   judgement would stay a hand's.


---

## When it comes back

ready when the speed-up round scopes its build
