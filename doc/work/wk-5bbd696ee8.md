---
id: wk-5bbd696ee8
seq: 1000002
type: work
title: a draft obeys itself
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: reviewer8
---

## detail

CLASS: A DRAFT DOES NOT OBEY THE CLASS IT IS CARRYING, AND A REMEDY ALREADY
STANDING IN THE TREE IS RETYPED INSTEAD OF CALLED.

A drafter writes a class down -- what the mistake is, what it costs, what to do
instead -- and then commits that same class in the criteria of the draft that
carries it. The prose and the commands are written in one sitting, the prose is
read as the deliverable, and nobody reads the commands back through it. The
draft is then the one place in the tree where the rule is stated and broken at
the same time, which is worse than not stating it, because a worker who copies
the criterion has copied the defect out of the file that forbids it.

THE SECOND HALF IS REUSE. The remedy for a set the project keeps re-checking is
usually already written once, and the draft types the members out again rather
than calling it. A helper that reads the declaration is a name, and typing the
members is three lines that look like the same thing and are not.

MEASURED ON wk-02e17b9eb4, "the set enumerates itself", whose whole subject is
that a hand list stands in for a set the language can enumerate. Its fifth
criterion is `for f in AGENTS.md .github/copilot-instructions.md
.claude/output-styles/quackitect.md; do rg -q describes.the.set $f || exit 1;
done`. The set is declared in util/projections.json, seven projections of which
three take their sources from doc/guidance, and src/engine/search_test.go
already carries `projectionTargets`, a helper that reads that declaration, used
by TestTheSearchRuleReachesEveryProjection, whose own doc comment reads "A
HAND-DRAWN LIST IS EXACTLY THE SIZE OF WHAT YOU ALREADY LOOKED AT. Declare a
fourth projection from the same source and the claim stays true of its three
while the fourth goes without the rule." The advice had also been written to the
same drafter on wk-8573243384's round 1, in the words "BETTER, DERIVE THE THREE
RATHER THAN TYPING THEM". Three deliveries of the rule, and the fourth
projection is still uncovered.

WHAT TO DO INSTEAD, in two steps and both before submitting.

READ EVERY COMMAND BACK THROUGH THE CLASSES IN doc/guidance/specifying.md,
under "The command decides the sentence above it", and hardest through the class
the draft itself is about. A draft whose subject is a class is the draft most
likely to commit it, because the drafter has spent the sitting writing the prose
and not the commands.

AND BEFORE WRITING A COMMAND OVER A SET, ASK THE TREE WHETHER IT ALREADY WALKS
THAT SET. Search for the file the set is declared in -- rg the declaration's
path across src/ and util/ -- and call what answers. Where nothing answers,
write the walk once, in a place the next criterion can name, rather than in the
criterion.

THE CHECK, RED TODAY: take one projection out of util/projections.json's
doc/guidance-sourced three, or add a fourth, and run the draft's criterion. A
typed list of three says nothing. A walk derived from the declaration goes red
and names the file that lost the rule.

