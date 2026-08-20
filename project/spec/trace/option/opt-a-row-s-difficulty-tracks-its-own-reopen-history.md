---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-a-row-s-difficulty-tracks-its-own-reopen-history
type: "[[option]]"
cluster: the-sizing
question: where the difficulty number comes from
statement: "a state's difficulty rises when its own past walks were reopened and falls when they were not, so the number is corrected by the record instead of being fixed by a declaration"
found_by: transform
source: "SIT Attribute Dependency applied to cluster-the-sizing — make difficulty vary with a quantity it currently ignores"
---

## Mechanism

TWO ATTRIBUTES THAT DO NOT CURRENTLY VARY TOGETHER. A state's difficulty is fixed
by hand. A state's reopen history is recorded and read by nobody in this design.
Reopening is the machine's own signal that work came back wrong — which is the
closest thing the corpus has to an observation of difficulty.

TIE THEM. A row walked five times and reopened four is hard, whatever anybody
declared. A row walked twenty times and never reopened is not, and putting the
strong hand on it is the waste
raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker names.

IT CORRECTS THE DRIFT RISK FROM THE OTHER SIDE.
raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so worries that
declarations only ever get raised, because raising is safe and lowering needs an
argument. A history-fed number falls on its own when nothing goes wrong, and the
argument for lowering is the record.

IT IS NOT ESCALATE-ON-FAILURE. opt-run-cheap-and-escalate-on-a-failed-check
escalates inside one attempt and forgets afterwards. This changes what the row is
worth for every future walk, and it is the only option here where a decision made
today is better because of what happened last month.

WHAT IT COSTS: a feedback loop with no damping, and the loop can lie in both
directions. A row reopened four times because a human changed their mind reads as
hard; a row never reopened because nobody checked reads as easy, which is the
worse of the two — this design would have rewarded the states whose fabrications
went uncaught. It needs a reopen reason it can filter on, and reopen reasons are
free text today.
