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
6. Write the classes, the dispositions and the promotions to `classes.json` in the retro's folder.
7. Run `./RUNME.sh retro classes <retro>`, which counts each rate and refuses a finding with no disposition. *
8. Run `./RUNME.sh retro matrix <retro>` again, so the report opens on the class fixes.
9. Mint one ticket per class, and name it under the class's tickets. *
