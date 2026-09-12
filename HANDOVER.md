---
kind: [[handover]]
status: todo
urgency: soon
depends_on: [a-process-is-a-route, a-group-is-a-branch]
---

# Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and the page beside it draws it. Read the note first. It
stands on the branch `claude/relaxed-knuth-f0uk4d` until the owner merges it,
so take that branch in where `work sync` leaves it absent.

This branch is the engine. Its chapters are The pull, The test verb, Evidence
per step, Children and private tickets, and the three rules at the top.

| what stands today | where |
|---|---|
| the schemas, the routes, the record and the render | the two branches before this one |
| the group verbs and the claim | the group branch |
| the judge, which runs through `$.model.classify` inside the hook process | `.claude/skills/level0/hooks/level0.js` |
| the stop rules, one file | `spec/config/stop/level0.yml` |
| the box id v4 keeps | none here yet |

# What waits

| the piece | where | proves it |
|---|---|---|
| `work pull [ticket]` | `src/scripts/work.js` | it hands back the ticket in hand and answers `work`, `refused` or `wait` |
| the five checks, cheapest first | `work.js` | the hold and the take hash, the schema and the fields, the commands, the hand rule, the judge |
| the idempotent hand-back | `work.js` | a hand-back the record answers gets the recorded answer, and a stale take hash gets `refused` |
| the pass | `work.js` | the record entry, the step, `state: open`, one commit named by ticket and step, the push, the next ticket |
| the rejected push | `work.js` | it fetches, rebases the one commit, tries once, else answers `refused` |
| the fail | `work.js` | `on_fail` or the step itself, the reason, the return in the record |
| `work.failsBeforePerson` | `work.js` and the config | a step failing back twice inserts a person step |
| `when` at the hand-out | `work.js` | the pull skips a leaf whose condition fails to hold, and the record says so |
| `needs` at the hand-out | `work.js` | a verb the box lacks answers `wait` with the reason |
| the `checked` field | `work.js` | the pull refuses a hand-back with a line short of the checklist |
| `work test` | `work.js` | it answers `green`, `assertion`, `build` or `missing` over the delta from the first take |
| the hold per hand | `.se/hold/<hand>.json`, `.se/box.json` | the pull refuses a second live hold for one session |
| the two-level pull | `work.js` | on trunk a box takes a group, on a branch it takes the group's own leaves around its tickets |
| the derived `children` | `work.js` | a parent advances once every child closes `done` or `became`, and a `dropped` child sends it to `on_fail` |
| the private queue | `work.js` | a box's private tickets come after the group's run out |
| the stop rule | `spec/config/stop/level1.yml` | `work-waiting` reads the session's hold |
| the plugin wrapper | `.claude/skills/level1/` | the pull runs under the tool, and the judge check runs there alone |

# The rules to hold

- The agent holds three verbs, and this branch lands one. The shell is the verb, and the tool wraps it.
- A `work` answer hands the leaf, with its fields, its guidance and `does` first.
- A leaf holding a `verdict` field takes the verdict from the field, and the pull refuses the flag there.
- The pull fetches the branch before every hand-out and hand-back.
- A person's hand-back from the shell meets the four mechanical checks, and the judge reads it at the next agent pull.

# The tests

Every check and every answer takes a test under the fake doors, and the
rejected push takes one of its own. Drive one real pull under
`claude --plugin-dir` before `work done`, and write what you see in the retro.

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
