---
kind: [[handover]]
status: done
urgency: soon
---

# Where it stands

Every schema takes a `governs` list, and the door, the sweep and the new
`mint_note` tool all read it. `./RUNME.sh test` passes, and `./RUNME.sh check`
stands green after the sync at the end of this note.

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
| `./RUNME.sh check` on main | green now: trunk carries the `turn.step` generator and the two cuts in the funnel note |
| `paragraph.schema.yaml` | it governs nothing, and no note names its kind, so `isNoteSchema` keeps it out of the note kinds |

The plugin gate stands between this branch and a green `check` until trunk
brings the `turn.step` generator in. The sync below takes it, and
`./RUNME.sh check` runs green on this head, so `work done` closes the branch.

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

# The sync

Trunk comes in with three branches, and six files conflict. `describesANote`
and trunk's `isNoteSchema` are one predicate, so `isNoteSchema` stays and the
chapter over it stands beside `A folder names its kind`. The write door
registers `check_answer` and `mint_note` both, and the contract test reads
`isNoteSchema` where it read `describesANote`.
