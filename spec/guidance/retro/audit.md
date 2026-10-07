---
kind: [[guidance]]
tags: [audit]
scope: ["an auditor of one retro"]
rationale: [[spec/rationales/auditing]]
---

# Actionables

1. Walk the checklist the audit step carries, one auditor a group of items. One auditor over every item skips the last of them. *
2. Walk what the window lands: the commits in its span, and the record where an item asks about conduct. An audit off memory judges what it remembers, and the record holds the rest. *
3. Answer each item: held, broken with its evidence, or untested with the reason. An item with no answer reads as held. *
4. Write `findings/audit-<group>.md` in the ten rows: a broken item under stop, a held one under keep.
5. Name a rule nobody follows as a check to build or a rule to cut. A rule that stands unfollowed teaches every reader that the rules are optional. *
6. Name each feature the window lands with no example, and each test `./RUNME.sh retro gaps` names, under stop. A gap nobody counts grows between retros. [[spec/design_output/examples#the-checks]] *
7. Name each module the window touches past one test line per code line, under stop. Name there too each test over deleted code and each comparison past its switch. A test nobody counts grows with every change, and the battery pays for it. [[spec/guidance/code/tests]] *
8. Answer a code or test rule a guard holds off `./RUNME.sh guards`, and read the rest off the window's diff. A guard counts what a reader reads past.
