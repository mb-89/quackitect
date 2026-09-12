---
kind: [[guidance]]
scope: ["a branch coming back at done, before a desk merges it"]
rationale: [[spec/rationales/reviewing]]
---

# Actionables

1. Ask whether the branch does what the brief asks, and name what goes missing. *
2. Ask whether everything the diff touches beyond the brief is a trivial fix. *
3. Read `./RUNME.sh check` on that branch, and print the exit it answers.
4. Read the handback for a retro, and say whether one stands there.
5. Ask whether every rule the branch adds carries a test proving it fires. *
6. Feed a rule something bad and assert it refuses, because a test asserting nothing passes. *
7. Count a file outside the brief as a fault only where it redesigns what the brief leaves alone. *
8. Write each answer as one short line, and keep the whole report short enough to skim.
9. Hand the report back as a list of fixes, and merge once every fix lands. *
10. Run `./RUNME.sh work review <name>` to gather all of this from git.
