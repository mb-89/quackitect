---
kind: [[handover]]
status: todo
urgency: whenever
depends_on: [the-agent-pulls-a-ticket]
---

# Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and the page beside it draws it. Read the note first. It
stands on the branch `claude/relaxed-knuth-f0uk4d` until the owner merges it,
so take that branch in where `work sync` leaves it absent.

The pull lands before this branch, and this one teaches it who holds a step.
Its chapters are Hands, Escalation is a step, and Children and private
tickets.

| what stands today | where |
|---|---|
| the spawn hook, which hands the guidance to a helper | `.claude/skills/level0/hooks/level0.js`, `agent.spawn` |
| the session id, read in one place | `.claude/skills/level0/lib/copilot.js` |
| the pull, its hold and its record | the pull branch |

# What waits

| the piece | where | proves it |
|---|---|---|
| the hand id | `work.js` | the box, the session and the agent stand in the record |
| the spawn for a step | the plugin wrapper | a `by` that excludes the hand spawns one, with a prompt the engine writes |
| the spawned hand's road back | `work.js` | its pull answers `done` after its hand-back, and touches no other hold |
| the helper's tag | the spawn hook | a helper the session spawns carries the session's hand, so `not <step>` still holds |
| the person's hand | `work.js` | the verb refuses `by: person` where the environment names an agent's harness |
| `work.personSigns` | the config and `work.js` | switched on, a person's hand-back needs a signed commit |
| `work escalate <question>` | `work.js` | it inserts a person step with `asks` and one `answer` field, and points `step` at it |
| `options` | `work.js` | an `asks` with options takes a `choice` answer, and one word passes |
| the refusal count | `work.js` | `work.refusalsBeforePerson` inserts a person step with the findings |
| the split refusal | `work.js` | past `work.stepsBeforeSplit` the pull answers the ask, and the close waits for the successors |
| the group leaves | `work.js` | a box with nothing at an agent step leaves the group at `todo` |

# The rules to hold

- A role is a property of a step, and no agent holds one for life.
- An inserted step counts for no `not`.
- A gate the mint writes and an escalation the engine inserts are one mechanism.
- On a box with no plugin, the shell pull parks the step for a person and says so.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Head the retro `What surprises me`, and name every dead end
   you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Run `./RUNME.sh work merge <name>` from main to take it in, then
   `work close`. A cloud box stops at step 4, because the harness holds
   main shut there and a cloud box opens no pull request.
