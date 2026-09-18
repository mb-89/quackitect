---
kind: [[handover]]
status: done
urgency: now
depends_on: work/blast-radius-decides-the-stop
---

# Where it stands

The guidance stops a box where going on needs a person. A person answers
anything, so that ground admits anything.

Rule five of [[spec/guidance/working]] now reads the cost of a wrong answer.
Where a commit undoes the mistake, the box decides and moves.

| what changes | where |
|---|---|
| rule five takes the cost test | `spec/guidance/working.md` |
| chapter four argues it, and names where the earlier wording stands | `spec/rationales/working.md` |
| `dirty` reads a commit origin lacks, beside the working tree | `src/scripts/work-stands.js` |
| the chapter a branch moves clean | `spec/design_output/work.md` |

The second pair answers a fault this session meets. `branch take` and
`branch release` reset hard onto origin, and `dirty` reads the working tree
alone. So a box committing its work moves it into the reset's path.

A release on this branch takes two commits that way. Either reading refuses the
move now, and each names its way out. A live release, one commit ahead, comes
back refused.

`./RUNME.sh check` answers 0 on this commit, and the suite answers green.

# What waits

| what | who does it |
|---|---|
| merge `work/blast-radius-decides-the-stop` first, then this | a desk |

That branch renames the stop rule to match. This note and the stop table answer
alike once both land, and the rationale says they do.

# Where the earlier wording stands

Version four carries the test this takes, under `spec/guidance/behaviour.md` on
the `v4` branch:

- Spend your thinking where a mistake is dear to undo. Where it is cheap, decide and move.
- Disagree and commit. Write the concern where a reader decides it, and continue.

Version three splits the question into two dials, under `deliverable/machines`
on the `v3` branch:

| the dial | what it answers |
|---|---|
| autonomy | what the agent decides alone |
| stop-at | how far the agent walks before it hands back |

`stopat.md` names why one rule struggles here. A stop hook reads where the walk
stands and sees no reason, so a stop the contract wants reads like an
overcautious one.

# What surprises me

Both earlier versions answer this already, and v5 carries neither answer. The
tree holds them one branch away, and a reader reaches them with
`git show origin/v4:<path>`.

Version four keeps the argument beside the rule, under a numbered `Discussion`
chapter. Version five moves it to `spec/rationales`. The rule itself stays short
in both, and that is the part worth keeping.
