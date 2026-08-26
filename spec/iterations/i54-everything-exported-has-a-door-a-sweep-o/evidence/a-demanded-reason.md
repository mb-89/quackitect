---
form: a-demanded-reason
by: agent
signed_off: 2026-08-26T13:30:47.393Z
authors: agent
files: null
---

# Evidence form / a-demanded-reason

## current_situation

HOLDS. 104 of 113 reasons are considered.

### The earlier reading was wrong

This record had said no list in the tree refuses a reasonless entry, so the premise did not exist. A search over `deliverable/engine/**/*.ts` for places a missing reason changes behaviour found four classes, and three of them refuse.

- REFUSES: `session.ts:1394` on the escape hatch, and `sessionclaims.ts:903` and `:995` on the claim verbs. The last says it plainly — an amend that says nothing is an untracked edit.
- REFUSES, different subject: `iterations-draw.ts:109` on an empty step list.
- MARKS, never refuses: `calllog.ts:192` stamps `unreasoned: true` on a weaker walk with no reason.
- REPORTS as a form problem: `stateform-problems.ts:866` on rank-cut rows moved with no reason.
- IGNORES: the widget exemption list, whose own file says so on purpose.

### The population

The amend verb has the largest readable population, because every amend writes its reason onto the evidence file. `scratchpad/reasons.mjs` pulled all 113, across 15 records.

The classifier rule was stated before the count: a reason is templated if it says an upstream state re-signed and this form's contents are unchanged.

It flagged 17. Eight are false positives, each read to confirm it. Two match on "so the claim stands" and explain a form written by hand outside the walk. Three match on "is unchanged" and each names which nodes moved. Two match on "re-stamping" and describe a real ripple. One is a verdict correction.

That leaves 9 genuinely templated, or 8.0 percent.

### The nine are one cluster, not a thin spread

All nine sit in `i33-every-interface-a-person-or-an-agent-tou`, and they are 9 of that record's 20.

Every other record scores zero, including the three largest populations at 17, 11 and 10 reasons.

Mean length is a second and independent measure. The templated pile averages 95 characters; the considered pile averages 139.

### What the cluster says, and it is not laziness

The nine appeared where one author re-stamped a chain of forms after an upstream re-sign. The honest reason in each case genuinely is that nothing here moved.

The mechanism asked a question whose answer was the same nine times. That is a mechanism which should have asked once, not an author writing thin reasons.

## built

- spec/trace/experiment/exp-do-the-lists-that-demand-a-reason-collect-considered-ones.md

## follow_up

- `el-door-rule` should not ask for a reason where the answer is mechanical. The one cluster of boilerplate this tree holds came from a ripple, and a ripple's reason is derivable.
- The assumption moves from open to probed and holds at 8 percent templated. The falsifier it named was a column of near-identical sentences, and one column of nine in fifteen records is not that.
- The false-positive rate of the classifier is worth carrying. Eight of seventeen flags were wrong, so any later automated read of a reason column must be hand-checked before it is quoted.

## anything_else

The classifier is a proxy for a judgment, and it is marked as one. Its rule was written before the count, and the 17 it flagged were read individually rather than trusted.

Without that hand-check the answer would have been 15.0 percent templated instead of 8.0 percent. The proxy nearly doubled the number.
