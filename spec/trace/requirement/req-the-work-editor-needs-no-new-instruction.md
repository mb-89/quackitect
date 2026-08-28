---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-the-work-editor-needs-no-new-instruction
type: "[[requirement]]"
statement: The system shall let a person who has operated one of its table editors operate the work editor with no instruction beyond what the first editor taught.
kind: quality
characteristic: interaction-capability
verify_method: demonstration
measure: One watched attempt. A person who has used one of the system's existing table editors is given the work editor and asked to narrow the list, fold a group and move a row. They complete all three with no instruction, no reference and no prompting, and every place they hesitate is written down.
breaks_if_removed: The cell machinery splits in two, and the divergence shows up later as two surfaces that disagree while both keep working.
breaks_how_badly: corrosive
refines:
  - uc-route-outstanding-work-to-where-it-is-done
  - uc-read-what-the-system-owes-and-what-it-is-doing
source_refs:
  - raid-dec-one-editor-is-widened-rather-than-a-second-written
  - "owner ruling: widen the existing table editor, because if somebody understands one editor they should understand them all"
priority: should
weighs_with:
  - none
weighs_against:
  - req-work-records-when-it-opened-and-when-it-closed > an editor nobody can use blocks the work, where missing timestamps only weaken a later reading
  - none
---

## Scenario

- Source: a person who has used one of the system's existing table editors.
- Stimulus: they open the work editor for the first time.
- Artifact: the work editor.
- Environment: no instruction, no reference page, no walkthrough.
- Response: they narrow the list, fold a group and move a row.
- Response measure: one watched attempt completes all three unaided, with the hesitations recorded.

## Detail

LEARNABILITY IS THE SCARCE THING HERE, and that is why the row exists.
Nineteen editors already stand.

FOUR THINGS HAVE NO PRECEDENT ANYWHERE IN THE TREE, so the row is a demand
rather than an observation: grouping rows into folding buckets, two panes
side by side, dragging a row from one pane to the other, and a plus that
mints from a template.

THE COUNTER-COST IS ACCEPTED AND NOT DENIED. A widget that accumulates
special cases becomes the thing nobody dares change. If that happens,
extracting the shared widget is the recorded way out.

THE MEASURE IS A WATCHED ATTEMPT RATHER THAN A POPULATION, and the register
says why. About four people have ever seen this product, the owner is keeping
it near that number deliberately, and all four have already seen it. A
four-in-five measure cannot be run against a population of four who are all
disqualified as newcomers.

THAT ENTRY ALSO PRESCRIBES THE REPLACEMENT: at this scale what works is a
single watched attempt. This row takes it rather than inventing a bar.

THE HESITATIONS ARE THE RESULT, not only the pass. One attempt cannot carry a
rate, so what it carries instead is where somebody stopped and why.
