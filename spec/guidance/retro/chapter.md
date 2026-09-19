---
kind: [[guidance]]
scope: ["whoever runs the chapter step of a retro"]
rationale: [[spec/rationales/chaptering]]
---

# Actionables

1. Run `./RUNME.sh retro timeline <retro>` first, and cut from the hours it draws. *
2. Cut the work into chapters by what it holds, about six hours each, longer or shorter as it asks. *
3. Cut inside an idle stretch, so it carries no chapter of its own. *
4. Name each chapter in one line, saying what it holds.
5. Write the cuts to `chapters.json` in the retro's folder: an id, a start, an end and a title each.
6. Run `./RUNME.sh retro chapters <retro>`, which hands every chapter its lines and refuses a gap or an overlap. *
