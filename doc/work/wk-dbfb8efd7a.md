---
id: wk-dbfb8efd7a
seq: 84
type: work
title: any is not every
status: aborted
assignee: main
scope: single-step
traced: true
disposition: dropped
reason: "The class is written where an agent reads it. doc/guidance/specifying.md, beside A SET COVERED BY ONE MEMBER: rg -q over several files exits zero when any of them matches, so a command naming every member reads as the remedy and the tool quietly ORs them. The tell is whether the exit code is about any or about every. The instance is on wk-8573243384 and I am fixing that criterion as part of its redraft. Obsolete as a token."
aborted_from: backlogged
minted_by: reviewer6
---

## detail

CLASS: A COMMAND THAT LOOKS LIKE IT WALKS A SET AND DOES NOT, BECAUSE THE TOOL'S
EXIT CODE IS ABOUT ANY AND NOT ABOUT EVERY.

This is wk-10d3cf13cd's class -- doc/guidance/specifying.md, "A SET COVERED BY
ONE MEMBER" -- reached by a new road. There the sentence was about a set and the
command named one member, and it was visible on the page. Here the command names
every member, so it reads as the remedy, and the tool quietly ORs them.

  rg -q PATTERN a.md b.md c.md

exits zero when ONE of the three matches. I ran it on three files with the
pattern in only the first: exit 0. A criterion whose sentence is "the rule
reaches every agent, because a rule only one harness reads is a rule the others
do not have" is therefore green in exactly the case its own sentence forbids.

THE SAME TRAP IN OTHER CLOTHES: grep -l over several paths, test -f a -o -f b,
a for loop with no || exit 1 in it, a find whose -exec swallows the status,
jq over an array without any/all, and any pipeline whose exit code is the LAST
command's rather than the worst.

WHY IT IS HARDER TO SEE THAN THE ORIGINAL. A reviewer reading the criterion sees
three filenames and stops, because three filenames is what walking a set looks
like. The defect is one level down, in what the tool does with them, and the only
way to see it is to run the command against a case that ought to fail.

FOUND ON wk-8573243384, the spec for writing an inherited-checks rule into the
guidance. Its fourth criterion greps the three projected guidance files for the
rule in one rg. All three are projected from doc/guidance/behaviour.md, so the
case that matters is a re-projection that did not run everywhere, and that is
precisely the case the command cannot see.

WHAT TO DO INSTEAD. Run every command criterion against a case that ought to
FAIL, not only against the tree, before agreeing it. Make one member fail and
watch the command go red; if it does not, the command is not walking the set.
Where a tool ORs, write the loop yourself and fail on the first miss:

  for f in a.md b.md c.md; do rg -q PATTERN "$f" || exit 1; done

and say in the criterion that it fails on the first miss, so the next reader
does not have to work out what the tool does.

THE CHECK, RED TODAY: take the pattern out of two of the three projections and
run the criterion. The rg form stays green. The loop form goes red and names the
first file that lost it.

