---
kind: [[guidance]]
scope: ["whoever runs the classify step of a retro"]
rationale: [[spec/rationales/classifying]]
---

# Actionables

1. Collapse the findings into classes: one defect with one cause, seen in any number of chapters. *
2. Give every class a category from the improvement rows, its defect, its fix and a pattern finding the defect. *
3. Write the pattern over the log or the transcripts, so the engine counts it again next retro. *
4. Give every finding a disposition: the class it joins, or a reason to drop it. *
5. Name every promotion: what moves, where it stands, and where it goes. *
6. Write the classes, the dispositions, the promotions, the limits and the checklist items to `classes.json`.
7. Run `./RUNME.sh retro classes <retro>`, which counts each rate and refuses an item with no disposition. *
8. Run `./RUNME.sh retro matrix <retro>` again, so the report opens on the class fixes.
9. Mint one ticket per class once the owner reads the report, and name it under the class's tickets. *
10. Give every collected note and memory a disposition: a class, done and where, a ticket, or a reason to drop. *
11. Check a note against the tree before judging it, because most open notes stand built already. *
12. Name a fix a ticket plans already by that ticket, and mint no second one. *
13. Name what this retro reads nowhere, and why, under limits. *
14. Ask one level above the classes which question catches a whole family, and add it to the checklist. *

# Examples

| the rule | do | do not |
|---|---|---|
| 9 | a ticket per class, after the owner reads | a mint before the owner reads |
| 11 | a search of the tree before the judgment | a judgment from the note's text alone |
| 12 | the name of the standing ticket | a second ticket for the same fix |
