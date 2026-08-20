---
minted_in: i9
id: req-only-a-file-with-its-own-door-is-withheld
type: "[[requirement]]"
statement: When a read resolves inside the machine-state folder, the lane shall withhold only those files that have a structured verb serving them, and shall serve every other file in that folder directly.
kind: functional
verify_method: test
breaks_if_removed: The whole folder stays unreadable to protect three files, so a person who wants to see what the machine is doing cannot open anything in it, and the collapse buys visibility that nothing delivers.
breaks_how_badly: abrasive
refines:
  - uc-take-a-step
source_refs:
  - "sty-walk-it-by-hand: the reading loop as a file, for a person to open"
  - "i9 draft-vision, the first ruling: hide what has a door, serve what does not"
  - "i9 kickoff goal: split the lane's exclusion by file instead of by directory"
priority: should
weighs_against:
  - req-newcomer-leaves-able-to-ask > — a folder that refuses to be read blocks anybody who wants to see what the machine did; a newcomer leaving without the vocabulary is fixed by the next tour
---

## Detail

THE RULE IS ONE SENTENCE. A file gets withheld because something better serves
it, never because of the folder it happens to sit in.

| what the file is | what happens to a direct read |
| --- | --- |
| served by a structured verb of its own | withheld, and the refusal names the verb that serves it |
| anything else in the folder | served, like any other file |

THE REFUSAL MUST NAME THE DOOR. A withheld read that only says no teaches the
reader that the folder is closed, which is the belief this row exists to
remove. Naming the verb turns a refusal into a redirection.

## Why a directory was the wrong unit

THE DOOR RULE IS ABOUT A HANDFUL OF FILES. Each of them has a verb giving it
structure, ordering and paging that a raw read throws away. That is a real
reason and it is unchanged.

HIDING THE DIRECTORY WAS A PROXY FOR THAT RULE, and the proxy caught
everything else in the folder as collateral. A proxy that catches more than its
rule is not the rule.

THIS ONLY BECOMES VISIBLE AFTER THE COLLAPSE. While the folder sat above what
the person opened, nobody could read it anyway, so the over-reach cost nothing
anybody noticed.

## What this row does NOT say

IT NAMES NO FILES. Which files have a structured door is a fact about the lane
that changes as verbs are added, so freezing a list here would make this row
wrong the first time one is.

IT SAYS NOTHING ABOUT WRITING. Whether those files may be written directly is a
different question with a different answer, and the guard on writes is another
row's subject.

## Behaviour

No model wanted. One condition and one response, and the Detail table carries
both branches.
