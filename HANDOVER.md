---
kind: [[handover]]
status: held
urgency: now
---

# Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and the page beside it draws it. Read the note first. It
stands on the branch `claude/relaxed-knuth-f0uk4d` until the owner merges it,
so take that branch in where `work sync` leaves it absent.

This branch is the first of eight, and everything after it reads what it
lands. Its chapters are A ticket is a note, The lifecycle, The route, Evidence
has a form, and Evidence per step.

| what stands today | where |
|---|---|
| the schema checker, over top-level scalars alone | `.claude/skills/level0/lib/schema.js`, `fieldFaults` and `frontFaults` |
| the line map, over indent-0 keys alone | `note.front.lines` |
| `mint`, which writes one valid note per kind | `./RUNME.sh mint <kind>`, in `src/scripts/cli.js` |
| the schemas, one per kind | `spec/schemas/*.schema.yaml` |
| the contract test over the schema folder | `test/contract/schema.test.js`, red on the paragraph kind today |

The paragraph schema is a YAML kind with no body, and the checker reads it as
a note. That is why two tests stand red on `main`. This branch teaches the
checker a YAML kind under a schema, and those tests go green with it.

# What waits

| the piece | where | proves it |
|---|---|---|
| the ticket schema | `spec/schemas/ticket.schema.yaml` | `mint ticket` writes a note the checker passes |
| the group schema | `spec/schemas/group.schema.yaml` | `mint group` writes a note the checker passes |
| the process schema, over a bare YAML file | `spec/schemas/process.schema.yaml` | the checker reads `spec/processes/standard.yaml` under it |
| a YAML kind under a schema | `lib/schema.js` | the paragraph schema tests go green |
| recursion into `steps` and `evidence` | `lib/schema.js` | a fault on `steps[1].steps[0].by` names its line |
| `x-one-per`, `x-names`, `x-earlier` | `lib/schema.js` | a route with a missing chapter, a bad `on_fail` and a bad `step` refuses three ways |
| the route's fields | the ticket and process schemas | `by`, `reads`, `on_fail`, `asks`, `when`, `checklist`, `does`, `input`, `needs`, `from`, `to`, `evidence` |
| the forms | the schemas | `text`, `list`, `command`, `link`, `files`, `choice`, `checklist`, `verdict` |
| the verbs' fields | the ticket schema and the write door | the door refuses an agent's edit to `state`, `step` or `steps` |
| the render | `mint` | the chapters follow the tree, a field is a heading under its leaf, and the comment beneath |
| the three places | the write door | the door refuses a write outside a field's slot, the discussion or a draft's ask, and names the line |
| the record | the ticket schema and the render | `record` renders under each leaf, and no hand writes it |
| the private folder | `.se/tickets/` | a private ticket passes the same schema |

# The rules to hold

- A name refers to a sibling first, and to a step from the top second. A path with a slash says exactly.
- `not <phase>` reads every leaf the mint puts under that phase.
- A leaf with no `on_fail` fails back to itself.
- The three keywords read the way `required` and `enum` do, so the door, the sweep and the language server read one rule.
- The six slots derive where the route says nothing: the step before, its evidence, the next step.

# The tests

The contract test over the schema folder stays the proof. Add one fixture per
refusal under `test/contract/`, so a nested fault, a bad path and an orphan
field each refuse with a line. Run `./RUNME.sh check` before every push.

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
