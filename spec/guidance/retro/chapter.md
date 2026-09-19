---
kind: [[guidance]]
scope: ["whoever runs the chapter step of a retro"]
rationale: [[spec/rationales/chaptering]]
---

# Actionables

1. Run `./RUNME.sh retro timeline <retro>` first, and cut from the hours it draws. *
2. Cut the window into chapters of about six hours, at a session start, an idle stretch or a new topic. *
3. Name each chapter in one line, saying what it holds.
4. Write the cuts to `chapters.json` in the retro's folder: an id, a start, an end and a title each.
5. Run `./RUNME.sh retro chapters <retro>`, which hands every chapter its lines and refuses a gap or an overlap. *
