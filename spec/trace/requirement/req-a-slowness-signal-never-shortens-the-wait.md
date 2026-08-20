---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: req-a-slowness-signal-never-shortens-the-wait
type: "[[requirement]]"
statement: Where the product shows that an operation is running past its bound, that showing shall not leave a person less willing to wait than silence leaves them.
kind: quality
characteristic: interaction-capability
measure: in a side-by-side look at the same operation, the count of people who abandon the wait with the signal shown is no higher than with nothing shown
verify_method: demonstration
breaks_if_removed: The transparency demand is met to the letter and people leave anyway, and it reads as the demand having been wrong rather than as one reading of honest having been wrong.
breaks_how_badly: abrasive
priority: should
weighs_against:
  - req-open-notes-stay-visible > — a signal that steals from the wait it is reporting makes the product slower for saying so; notes going out of sight is recoverable by looking
refines:
  - uc-quality-performance-efficiency
source_refs:
  - raid-risk-an-accurate-progress-signal-can-drive-abandonment
  - sty-the-slow-call-that-says-it-is-working
  - req-work-past-its-bound-says-it-is-working
---

## Scenario

SOURCE: a person waiting on an operation that has passed its bound.

STIMULUS: the product shows the signal that req-work-past-its-bound-says-it-is-working demands.

ENVIRONMENT: an ordinary session, on an operation whose true duration the
person cannot predict.

ARTIFACT: the slowness signal itself.

RESPONSE: the person keeps waiting where waiting is the right thing to do.

RESPONSE MEASURE: in a side-by-side look at the same operation, no more people
abandon the wait with the signal shown than with nothing shown.

## Detail

WHY THIS ROW EXISTS, and it argues against a ruling this iteration made two
states before it. The prior-art scan at gate-motivation reports a 2010
University of Michigan study finding that the slow-to-fast progress bar — the
most technically honest representation of actual progress — produced the
HIGHEST abandonment rate, at 21.8 percent. PRIMARY NOT SEEN: this is a
secondary write-up and the study was not read.

WHAT SURVIVES OF THE RULING. The same body of work reports people shown a
moving feedback bar were satisfied and waited around three times longer than
people shown nothing. Telling beats silence, which is what
req-work-past-its-bound-says-it-is-working demands.

WHAT NARROWS. Honest means the person is not left guessing whether it is
working. It does not mean publishing a faithful completion estimate, and this
row makes that a demand rather than a preference.

WHY IT IS `should` AND NOT `must`. Its measure needs people watched
side by side, which nobody has run and which the owner must schedule. A `must`
whose pass line has never been executed would gate M4's candidates on evidence
that does not exist. raid-risk-an-accurate-progress-signal-can-drive-abandonment
holds the same question and names the owner.

WHY IT IS NOT FOLDED INTO THE ROW ABOVE. That row is verified by test — did a
signal appear inside a second. This is verified by demonstration with people
watching. Detail that verifies differently is a sibling row, which is this
method's own split rule.

## Behaviour

NO MODEL WANTED HERE. There is no order and no transition to show. It is a
constraint on the content of one signal.
