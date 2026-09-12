---
kind: [[handover]]
status: held
urgency: soon
---

# Where it stands

Every schema takes a `governs` list, and the door, the sweep and the new
`mint_note` tool all read it. `./RUNME.sh test` passes 582 tests, and
`./RUNME.sh lint` names two lines, both of which stand on main untouched by this
branch. `./RUNME.sh check` goes red before the sweep, and the next chapter says
why.

| the piece | where it stands |
|---|---|
| `governs` in every schema | six schemas name a folder or a path |
| the reader answering a path | `governorOf` in `lib/schema.js` |
| the door refusing a stranger | `hooks/level0.js`, beside the departure door |
| the sweep naming one | `schemaFaults`, over every path git holds |
| the `mint_note` tool | registered at `session.start`, beside `claim_stop` |
| a placeholder for an absent field | `mintNote(schema, fields)` |
| the placeholder as a finding | `placeholderFaults`, at `warning` |
| the `mint` verb taking the same fields | `fieldsIn` reads `--name=value` |
| the guidance line | rule 11 in `spec/guidance/guidance.md` |

# What waits

| the thing | what it asks |
|---|---|
| `./RUNME.sh check` on main | the plugin gate refuses the `turn.step` hook |
| `spec/funnel/level-zero-closes.md` | two lines break a Vale rule, on main too |
| `paragraph.schema.yaml` | it governs nothing, and no note names its kind |

The plugin gate is the one thing between this branch and a green `check`. The
engine reads `.claude/skills/level0/hooks/level0.js` and refuses line 517.
`turn.step` streams, so it takes `async function* ($, e, next)`, and this tree
writes `async ($, e, next)`. The same hook stands at line 487 on main and draws
the same refusal there, so it comes from elsewhere. The fix reaches the answer
door, which this brief leaves alone. A branch of its own takes it.

# What the tree carries today

No stranger stands in a governed folder. The sweep answers nothing over the
tree. A contract test now walks every note under a `governs` glob, and asserts
that each one reads as the kind that glob holds.

# The surprises

1. `spec/guidance/**/*.md` misses `spec/guidance/voice.md`. The glob reader in
   `lib/paths.js` reads `**` as `.*`, and it keeps the `/` after it literal. So
   that pattern wants two slashes. Every `governs` entry says the folder
   outright, `spec/guidance/**`, which reads both depths. The brief's own
   example carries this, so read a glob here as this reader reads it.
2. `paragraph.schema.yaml` holds a `kind` and describes no note. So the reader
   counts it as a seventh note kind, and the contract test stands red on main
   today. `schemasIn` now keeps a schema carrying a `body`, and the design note
   says why.
3. A placeholder belongs outside `checkNote`. The door refuses whatever
   `checkNote` names, so a minted note refuses itself on its first edit. The
   placeholders live in `placeholderFaults`, which the sweep and the tool call
   and the door leaves alone.
4. A frontmatter placeholder reads off the raw line, past the parsed value. The
   YAML reader splits a flow list on every comma, even inside a quote. So
   `scope: ["one entry, and another"]` comes back as two entries. Comparing the
   line against what `mint` writes sidesteps that.
5. A field taking an `enum` carries a real value. `status: todo` is the shape a
   handover names, so the finding passes over `const` and `enum` both.

# The dead ends

1. Comparing a placeholder by parsed value. See surprise four.
2. Probing a path with `$.fs.exists` before the tool writes. The fake engine in
   `test/level0/hooks.test.js` answers `exists` for the Vale binary alone, so
   the tool reads a path that stands and writes over it. It reads the file
   instead, which both engines answer the same way.
3. Leaving the anchor `schema#warning-now-and-error-later` dangling. Two places
   reach it and no chapter answers, so this branch writes the chapter.

## How this branch runs

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
