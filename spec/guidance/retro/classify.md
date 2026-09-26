---
kind: [[guidance]]
scope: ["whoever runs the classify step of a retro"]
rationale: [[spec/rationales/classifying]]
---

# Actionables

1. Collapse the findings into classes: one defect with one cause, seen in any number of chapters. A finding standing alone gets a fix of its own, and the cause stands. *
2. Give every class a category from the improvement rows, its defect, its fix and a pattern finding the defect. A class with no pattern goes uncounted next retro. *
3. Write the pattern over the log or the transcripts, so the engine counts it again next retro. A pattern over nothing measurable measures nothing. *
4. Give every finding a disposition: the class it joins, or a reason to drop it. A finding with no disposition comes back next retro as new. *
5. Name every promotion: what moves, where it stands, and where it goes. Leave its ticket to the check step. A promotion with no destination stays where it is. *
6. Write the classes, the dispositions, the promotions, the limits and the checklist items to `classes.json`.
7. Run `./RUNME.sh retro classes <retro>`, which counts each rate and refuses an item with no disposition. A rate counted by hand drifts from the one the next retro counts. *
8. Run `./RUNME.sh retro matrix <retro>` again, so the report opens on the class fixes.
9. Hand every class on to the check step, and name its tickets there. A class this step turns into a ticket skips the tree the check reads. *
10. Give every collected note and memory a disposition: a class, done and where, a ticket, or a reason to drop. A note with no disposition stays on the box and drains nowhere. *
11. Check a note against the tree before judging it. Most open notes stand built already, and a ticket for a built thing costs a hand a round. *
12. Name a fix a ticket plans already by that ticket, and mint no second one. Two tickets for one fix send two hands after it. *
13. Name what this retro reads nowhere, and why, under limits. A retro naming no limit reads as complete, and the next one repeats its blind spot. *
14. Ask one level above the classes which question catches a whole family, and add it to the checklist. A checklist that grows one item a finding misses the next family. *

# Examples

| the rule | do | do not |
|---|---|---|
| 9 | a ticket per class, after the owner reads | a mint before the owner reads |
| 11 | a search of the tree before the judgment | a judgment from the note's text alone |
| 12 | the name of the standing ticket | a second ticket for the same fix |
