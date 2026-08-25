---
kind: method
catalog: damage_levels
catalog_sections: THE FIVE LEVELS
statement: How badly a requirement breaks things when it is not met. Five levels, each with a test somebody can apply.
---

# The damage scale — how badly, not how much

Every requirement already says WHAT breaks without it. This says HOW BADLY.

It is the missing half. "The loop's rhythm dies" and "a finished record stops
being evidence" are both real damage, and nothing recorded that one of them
ends the product and the other is a daily tax.

## Situation

M3, when the requirement is written, because that is when somebody actually
knows. M4 reads it: the criteria ordering starts from damage rather than from
nothing.

## THE FIVE LEVELS

- **fatal** — the product stops being the thing it claims to be.
- **crippling** — one named use case can no longer complete.
- **corrosive** — it still works, and people route around it every time.
- **abrasive** — noticed and complained about; nobody changes what they do.
- **cosmetic** — nobody would notice.

## The test for each

One question per level, answered against the register rather than against a
feeling. Take the highest level whose test passes.

- FATAL. Strike the row, then describe this product truthfully in one
  sentence, the way you describe it today.
  - If that sentence has to change, it is fatal.
- CRIPPLING. Name a use case that can no longer reach its end.
  - If you can name one, it is crippling.
  - If everything still completes, it is not.
- CORROSIVE. People CHANGE WHAT THEY DO to avoid the damage, by batching
  calls, keeping a side file, or doing it by hand.
  - A workaround people actually adopt is corrosive.
- ABRASIVE. They would mention it and carry on.
- COSMETIC. Nobody would notice at all.

## COSMETIC IS A DELETION CANDIDATE, NOT A LEVEL

A row nobody would notice missing is a row nobody needs. It joins the register
as a non-goal or it leaves.

The level exists so the honest answer can be given. It is not a place to park
rows that nobody wants to argue about.

## HOW BADLY IS NOT HOW MUCH

The commonest way to fill this in wrong is to read it as importance, and then
everything anybody cares about becomes fatal.

The scale asks about the WORLD after the row is struck, not about the person
answering. A requirement can matter a great deal to the person who wrote it
and be abrasive. A requirement nobody has thought about in a year can be
fatal.

THE ANCHOR IS THE STRIKE TEST. If two people disagree, they are disagreeing
about what actually happens, which is a question with an answer.

## It does not replace MoSCoW

They ask different things and both are kept.

- MoSCoW says whether the row is in scope for this release. It is a plan.
- The damage scale says what the world looks like without it. It is a fact
  about the system.

A must can be abrasive — scoped in because it is cheap and asked for. A could
can be fatal — genuinely load-bearing and genuinely not scheduled yet.

## WHAT M4 DOES WITH IT

IT IS THE SORT KEY AT cut-criteria, worst first. Not
a hint for something else to improve on — the order itself.

THE SORT IS THEREFORE MECHANICAL, and that is the property worth protecting.
Nobody types the order, so nobody can aim it.

IT STAYS BLIND EVEN THOUGH IT RUNS LATE. The sort happens at cut-criteria,
where the candidates already exist, and that would normally break the guard
that weights are fixed before the options are known. It does not break here,
because the KEY is authored at M3 on the requirement itself. A person who
wanted a favourite axis to rise would have to re-grade what breaks without it,
in the register, against the strike test, where anybody can check it.

THE SORT IS TWO STEPS, AND THIS IS THE FIRST. The
grade roughs the order out. Then somebody CHECKS it and pushes rows up or down
where it came out wrong.

THE AGENT MAKES THAT CHECK EXACTLY AS A PERSON DOES. Same arrows, same
rationale, same refusal without one. A move is not a person-only act.

WHERE THE JUDGMENT ACTUALLY LANDS. Five levels over a large pool leaves dozens
of rows tied inside one band, and the machine has nothing to say about a tie.
That is what the check is for, and it is cheap because a row only ever argues
with its neighbours.

WHY IT WAS SPECIFIED THIS WAY. Ordered from nothing, a response-time
requirement came out above the foundations of the system (owner report
2026-08-08). It was still there, ranked first of seventy-two
while graded corrosive — third of five — because a stored order from an
earlier pass overrode the computed one. Two lessons, and both are load-bearing.

- A COMPARISON THAT NEVER READS WHAT BREAKS CANNOT DISCOVER THIS. So the
  damage grade leads rather than advises.
- A STORED ORDER MUST NOT SILENTLY BEAT THE COMPUTED ONE. Only a recorded move
  overrides the sort.

## Sources

- The strike test is the register's own `breaks_if_removed`, which every
  requirement already carries. This scale grades what that line describes.
- Owner ruling 2026-08-08: the ordering must take account of what breaks if
  the requirement is left out, and that wants a scale rather than a sentence.
