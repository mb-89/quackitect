---
form: generalize-use-cases
amended: 2026-08-26T11:30:59.355Z by agent — A third use case was written at the inputs gate to generalise the exports-sweep story. The form must name it.
by: agent
signed_off: 2026-08-26T11:28:01.597Z
authors: agent
files: null
---

# Evidence form / generalize-use-cases

## current_situation

TWO STORIES STAND, one per role that carries the promise. This state tells the same two goals in their general form.

THE METHOD CARD WAS READ HERE, as its entry condition required, and its distinction shaped both nodes: a story is one person on one Tuesday, a use case is the same goal told once with the branches that can happen.

THE COVERAGE IS MECHANICAL BOTH WAYS and the engine checks it. Every use case refines at least one story, and every story sits inside a use case. Three of each, paired one to one.

THE THIRD PAIR WAS ADDED AT THE INPUTS GATE. Its unspecified-capability check found that the exports sweep — the seeded record itself — had no pass covering it. Two exemption stories had crowded out the goal the record was opened for.

## use_cases

- spec/trace/use-case/uc-learn-why-a-module-departs-from-a-rule.md
- spec/trace/use-case/uc-declare-an-exception-to-a-rule.md
- spec/trace/use-case/uc-answer-every-export-with-a-door-or-a-deletion.md

## follow_up

M3 DERIVES THE REQUIREMENTS FROM THESE STEPS AND EXTENSIONS. A step no requirement covers is a hole the coverage matrix will show.

THREE EXTENSIONS ARE ALREADY KNOWN TO HAVE NO REMEDY, and each names a registered gap rather than a branch somebody forgot.

- 5b of the reading use case: a reason written too thinly to judge. That is the reason-quality decay, the second kill criterion on this design.
- 3b of the declaring use case: a reason copied from a line already on the list. The same gap, met from the writing side.
- 6a of the declaring use case: an exemption that has stopped being needed and says nothing. That is the expiry risk, and Rust and ESLint both do what we cannot.

WRITING THEM AS EXTENSIONS IS THE POINT. A gap living in a risk entry is a gap a reader has to go looking for. A gap sitting in the branch where it happens is one the requirements step has to answer or explicitly decline.

## anything_else

TWO STEPS IN THESE USE CASES ARE DESIGN DECISIONS, NOT DESCRIPTIONS, and naming them here stops a later state re-opening them by accident.

- THE REFUSAL FIRES ON THE HATCH FILE, at write time, when a line carries no reason. It does not fire on the exempt module's own call, and it is not left to the sweep. The story forced this by being written, and the architecture milestone inherits it.
- ABSENCE FROM THE HATCH MEANS NOT EXEMPT, rather than not yet considered. That is what makes step 3a of the reading use case answerable at all.

NO QUALITY-AREA USE CASE IS WRITTEN. The nine are a closed list under the 2026-08-19 ruling, and this record adds no tenth. What it produces are two interactions.

THE HONEST WEAKNESS OF BOTH. Neither use case has been walked against a built system, because nothing is built. Their steps name a hatch file, a rule and a refusal that do not exist. The method card calls that finding a hole in the design and says finding it is the point, which is true and is also why these two are claims rather than observations.
