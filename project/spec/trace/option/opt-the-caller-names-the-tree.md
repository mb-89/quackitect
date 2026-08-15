---
minted_in: i27
id: opt-the-caller-names-the-tree
type: "[[option]]"
statement: delete the resolution decision and make every path carry its tree, so nothing infers which store an act belongs to
cluster: cluster-the-walk
question: which tree a path resolves to
found_by: without
source: "trimming — what if resolve-a-path does not exist, and who does its job then; the answer is THE USER"
---

## Mechanism

There is no rule to get wrong because there is no rule. A path that does not
name its tree is refused, by name, with the remedy showing the two forms.

WHO TAKES THE JOB OVER: the caller. That is one of the four sanctioned
answers in meth-trimming, and it is the one people dislike because it looks
like pushing work onto somebody else.

THE ARGUMENT FOR IT IS THAT WE ALREADY DO THIS ELSEWHERE, twice, and it
works. A committed ref is named explicitly with `ref`. A declared root is
named explicitly as `@name/rest`. Neither is inferred, and neither has ever
produced a silent misroute - the two doors out of the root are the only part
of path handling that has never gone wrong.

WHAT IT COSTS. Every call site changes, and the refusal fires constantly
until habit catches up. Against that, the cost is paid LOUDLY and once,
where a wrong inference is paid silently and repeatedly.

WHAT IT DOES NOT SOLVE. A caller who names the wrong tree is obeyed exactly.
It converts a silent engine error into a loud caller error, which is a
strictly better failure but not no failure.

THE HONEST OBJECTION. This is the null option for the whole iteration: it
says the function this record just minted should not exist. It goes on the
chart precisely because nobody proposes that.
