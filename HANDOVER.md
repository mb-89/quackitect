---
kind: [[handover]]
status: held
urgency: now
---

# Where it stands

The three schemas of level one stand, the checker reads a route, and `mint`
writes a ticket a hand can work. Branch 1 of eight is complete, and branches 2
and 3 read what it lands.

| what lands | where |
|---|---|
| the ticket schema, and the one home of the route | `spec/schemas/ticket.schema.yaml` |
| the group schema, naming the route from there | `spec/schemas/group.schema.yaml` |
| the process schema, over a bare YAML file | `spec/schemas/process.schema.yaml` |
| a line per key at every depth of the frontmatter | `lib/schema.js`, `readYaml` |
| one walk over a map, at every depth | `lib/schema.js`, `mapFaults` |
| `x-one-per`, `x-names`, `x-earlier`, and three modifiers | `lib/schema.js` |
| `$ref`, inside a schema and across two | `lib/schema.js`, `refOf` |
| a data schema, which governs YAML and no note | `lib/schema.js`, `checkData` |
| the render of the route, as a chapter per step | `lib/schema.js`, `mintNote` |
| the three places, and the verbs' four fields | `lib/ticket.js` |
| the record's shape, and the lines it draws | `lib/ticket.js`, `engineRows` |
| the past tense, over a ticket and a group | `.vale.ini` |

The design output says how each piece works, in [[spec/design_output/schema]].
Six chapters are new there, and every comment in the code points at one.

| the proof | where |
|---|---|
| the checker, keyword by keyword | `test/level0/schema.test.js`, 17 new cases |
| the door, place by place | `test/level0/ticket.test.js`, 15 cases |
| the three kinds, off disk, with a fixture per refusal | `test/contract/ticket.test.js` |

`./RUNME.sh check` answers green: 773 tests, no fault, and the sweep names no
line.

# What waits

Branch 2 writes the five route files under `spec/processes/`. The contract test
already binds them, so a bad one turns the check red the moment it lands.

| the piece | whose it is |
|---|---|
| `spec/processes/<name>.yaml`, five of them | branch 2 |
| the six slots' three checks, in the mint and the lint | branch 2 |
| `--process` at the mint, and `work reroute` | branch 2 |
| `not <phase>` read as every leaf under it | branch 4, at the pull |
| the rows `engineRows` answers, written into the file | branch 4, at the hand-back |
| `reason` on a closed ticket alone | open, and the retro says why |

Six findings stand, and each one waits on a person:

| the finding | what to do |
|---|---|
| trunk answers red over the owner's design input | keep the vale stanza, or reword the note |
| 12 pointers in the code name no heading | add a sweep, and fix the twelve |
| `reason` binds on `closed` alone, and no keyword says so | add a conditional, or leave it to the pull |
| `order: strict` holds at the body's own level | two leaves can carry a field of one name |
| the commit door refuses the attribution trailer | the Private rule reads the address in it |
| the brief names two red tests that stand green | read the count off the check, not a brief |

# What surprises me

The brief says two tests stand red on `main` over the paragraph kind. They stand
green. `./RUNME.sh check` runs 730 tests at the branch point with no fault, and
`isNoteSchema` already leaves the paragraph schema out.

So the YAML kind wants a design, and no repair. The design output now names the
three shapes a schema takes:

- a note schema, which names the chapters of a note
- a data schema, which names the rules over a bare YAML file
- a model schema, which a projector reads and no checker does

Trunk answers red, and it answers red before this branch starts. Twenty-five
voice findings stand in `spec/design_input/the-agent-pulls-tickets.md`, mostly
the modal `may`. `work done` reads the check's stamp, so no branch of these eight
finishes while trunk stands red.

I take the narrow way out, and the owner picks between two:

| the way | what it costs |
|---|---|
| one stanza in `.vale.ini`, which this branch takes | four rules go quiet over `spec/design_input/*.md` |
| a reword of the note, in 25 places | every one of the eight briefs quotes that note |

The stanza puts the design inputs beside the rationales, for the permission modal
and the long list item. No word of the owner's note moves, and one commit takes
it back.

Five dead ends, one a line:

- Vale refuses a prose comment in code, and wants a link on every one past the header.
- Level zero refuses `cat >>` into a test, and every other shell write.
- A heading holds five words, so six pointers in the code want renaming.
- `expects: string` is wrong, because `expects: 0` reads as an integer.
- The commit door refuses the attribution trailer, on the address inside it.

Two calls stand behind the shape, and the argument for each reads short:

| the call | why |
|---|---|
| the route lives in one file | a copy in three schemas is a defect, so `refOf` reads a kind |
| the door reads the schema | `x-written` and `x-engine` say who writes, so the door holds no list |

A new kind opts into the door by naming those two keys, and the door changes
nowhere. I write no script, so `.se/scripts` stays empty.
