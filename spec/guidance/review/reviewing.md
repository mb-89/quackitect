---
kind: [[guidance]]
scope: ["a branch coming back at done, before a desk merges it"]
rationale: [[spec/rationales/reviewing]]
---

# Actionables

1. Ask whether the branch does what the group's ask calls for, and name what goes missing. A review of the code alone passes a branch that answers the wrong ask. *
2. Ask whether everything the diff touches beyond the ask is a trivial fix. A change past the ask rides in unread, and nobody asks for it. *
3. Read `./RUNME.sh check` on that branch, and print the exit it answers.
4. Read the handback for a retro, and say whether one stands there.
5. Ask whether every rule the branch adds carries a test proving it fires. A rule with no test is a rule nobody runs. *
6. Feed a rule something bad and assert it refuses. A test asserting nothing passes, and proves nothing. *
7. Count a file outside the ask as a fault only where it redesigns what the ask leaves alone. A review refusing every stray file sends a trivial fix back for a round. *
8. Write each answer as one short line, and keep the whole report short enough to read at a glance.
9. Hand the report back as a list of fixes, and merge once every fix lands. A report of opinions leaves the drafter guessing what to change. *
10. Run `./RUNME.sh branch review <name>` to gather all of this from git.
11. Grade each question a return names as design or craft, and hand a craft one back to the drafter.
12. Grade a finding of prose or shape as form, and pass on it: it stands in the Problems panel until the push. A review failing on form sends a draft round and round on lines the write door says to leave. *

# Examples

| the rule | do | do not |
|---|---|---|
| 5 | a rule and the test that fires it | a rule with no test |
| 6 | a bad note, and an assert on the refusal | a test asserting nothing |
