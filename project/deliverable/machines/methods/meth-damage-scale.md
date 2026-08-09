---
kind: method
catalog: damage_levels
catalog_sections: THE FIVE LEVELS
statement: "How badly a requirement breaks things when it is not met. Five levels, each with a test somebody can apply."
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

The criteria ordering starts from damage, worst first.

That is a HINT ORDER, not the answer. The pairwise walk still settles the
order, and it still lets a person overrule any pair. What changes is where it
starts from.

Two things fall out, and the second is the one that was hurting:

- FEWER QUESTIONS. The walk is cheapest when the hint is close to right,
  because every item then lands where it was predicted and costs one question.
- A SANE STARTING POINT. Ordered from nothing, a response-time requirement
  came out above the foundations of the system (owner report 2026-08-08). No
  amount of pairwise comparison discovers that it should not be there, because
  the comparison never reads what breaks.

## Sources

- The strike test is the register's own `breaks_if_removed`, which every
  requirement already carries. This scale grades what that line describes.
- Owner ruling 2026-08-08: the ordering must take account of what breaks if
  the requirement is left out, and that wants a scale rather than a sentence.
