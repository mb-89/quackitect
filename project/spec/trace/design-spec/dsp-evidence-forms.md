---
minted_in: i1
id: dsp-evidence-forms
type: "[[design-spec]]"
statement: evidence forms built from state declarations and checked at every save, carried by one form model over markdown sections
realizes:
  - "el-walk-engine"
files:
  - "project/deliverable/engine/stateform.ts"
  - "project/deliverable/engine/forms.ts"
---

## Responsibility

The form a state owes is derived from its declaration: fields, live
sources, templates and checks. The same checks run at save, at submit
and over stored evidence, so a signed claim that stops holding turns
grey. The per-state laws live here too — coverage, the spec laws, the
observation checklists.

## Behavior and constraints

- A live source resolves at serve time and freezes on a signed form.
- Bound fields rebuild from trace nodes on every look; a cell write
  lands on the node it names.
- A derived field is a reading, never a claim: nothing stored, nothing
  demanded.

## Coverage is mutual, and both sides are computed

`covers: <type>` ON A REFERENCE FIELD MEANS TWO THINGS AT ONCE, and neither
is a judgment call.

- Every referenced node must refine one of the covered type. A story serving
  no proposition is work nobody asked for.
- Every standing node of that type must be refined by SOMETHING IN THE CORPUS.
  A proposition no story serves is a promise nothing shows.

THE SECOND HALF USED TO READ THE AGENT'S LISTING, and that was the defect. The
covered side came from disk and the covering side came from whatever the agent
typed, so the check could be satisfied by naming nodes without examining any of
them.

MEASURED ON ONE WALK, FOUR TIMES: five typed names at write-stories,
twenty-two at generalize-use-cases, thirty-three at write-requirements, and a
fifty-five-row table echoed back at the engine at derive-functions. Nothing was
examined on any of them, and the cost of passing grew with the corpus while the
value stayed at zero.

BOTH SETS ARE ON DISK. The nodes are files and every `refines` edge is in
frontmatter, so the engine enumerates the covering side exactly as it already
enumerates the covered one.

WHAT THE FIELD STILL CARRIES is the one thing the corpus cannot answer: which
nodes THIS delta touched. That is judgment, and it stays.

## An empty set is a claim, and it is written

A BLANK FIELD AND A FIELD THAT HONESTLY FOUND NOTHING LOOK IDENTICAL
AFTERWARDS. So "one line saying none" is a legal answer, and a shaped field
needs the same door — without one, a state with nothing to tabulate can only be
passed by inventing a row.

FOUND AT A SCORE TABLE. A record that composes no candidates by construction
has no rows to score, and the only way past the check was a fabricated score.
The whole method exists to stop exactly that.

IT MUST OPEN THE SHAPE CHECK TOO. A `none` that satisfies the table and then
fails the line grammar is the same unsatisfiable pair by another route, which
this checker has now hit five times.

A CHART IS THE EXCEPTION. Two candidates is the floor, because one combination
is not a choice, and that check runs BEFORE the `none` door on purpose. An
enumerated space nobody has combined is unfinished, never empty, so `none`
may not buy its way past it. It once reached a gate with zero candidates drawn
and the only complaint was "no references", which reads like a formatting slip
rather than the missing work it was.

## Checking is the claim, and owed is the third state

A CHECKLIST REFUSES WHILE ANY NAMED ITEM STANDS UNCHECKED. There is no text to
write — the deliberate click is the record, and an unchecked box is work still
owed.

A THIRD STATE EXISTS FOR WHAT CANNOT BE HONESTLY OBSERVED. Rather than
fabricate a tick, `- [owed] <item> — <ref>` addresses the claim to an OPEN
entry in the register, so the debt has somebody with a trigger rather than
being merely declared.

IT NEVER COUNTS AS CHECKED. A missing or unresolved ref refuses exactly like an
unchecked box, because the only honest alternative to an owed box is a stall,
and an owed box is strictly more information than a tick.

## A cell that lost its tail

A NODE-TABLE CELL LANDS VERBATIM on the node's frontmatter. Four experiments
once reached their nodes ENDING IN AN ELLIPSIS with the clause that carried the
meaning gone, and all four were rewritten by hand.

THE COMMENT THAT USED TO SIT HERE SAID THE ENGINE WROTE NO ELLIPSIS, and that
was wrong in both halves. A one-line helper cut every frontmatter value at 200
characters and appended one. The searches the comment reported missed it
because the ellipsis was a template literal rather than a string literal, and
the limit was a bare number rather than a named maximum.

IT MISDIRECTED THREE HUNTS, because a comment asserting the result of a search
reads like evidence and nobody re-runs it. The cut is removed; this record
stands as the warning that A RECORDED SEARCH RESULT IS NOT A CHECK.

THE GUARD DOES NOT NEED THE CULPRIT. Whatever cut it, a frontmatter value that
trails off is not an answer, and the one outcome that must not stand is the
SILENT one: the form shows the whole text, the node carries a fragment, and the
ellipsis reads as style rather than as loss.

## The hint order

IT IS THE DIFFERENCE BETWEEN 149 QUESTIONS AND 873. Taken
most-important-first, every item is predicted to be the new bottom of the
chain, so the walk's one probe is the question most likely to be confirmed. A
wrong hint costs one question, never a wrong answer.

DAMAGE LEADS IT. Ordered from MoSCoW alone, a response-time requirement came
out above the foundations of the system — and no amount of pairwise comparison
discovers that, because the comparison never reads what breaks. Every
requirement already carries that line, and the grade leads the sort.

IT IS A HINT, NOT THE ANSWER. The walk still settles the order and a person
still overrules any pair. This only decides where it starts.

AN UNGRADED ROW SORTS IN THE MIDDLE. Not last, or every row written before the
scale existed would sink beneath rows nobody has thought about; not first, or
leaving it blank would be the way to the top.
