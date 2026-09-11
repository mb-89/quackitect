---
kind: [[handover]]
status: held
urgency: now
---

# Where it stands

The schema reads a note. `spec/schemas` holds six proposals, and a program now
reads all six, weighs every note against its kind, and names each departure at
warning severity.

| the piece | where it lands |
|---|---|
| the reader and the checker | `.claude/skills/level0/lib/schema.js` |
| the findings, at warning | `src/scripts/cli.js`, beside `treeFaults` |
| the underscore skip | `lib/paths.js`, and seven callers of it |
| the `mint` verb | `./RUNME.sh mint <kind> <path>` |
| the design note | `spec/design_output/schema.md` |
| the tests | `test/level0/schema.test.js`, `test/contract/schema.test.js` |

Every claim the brief asks for stands:

1. `./RUNME.sh check` answers 0 with 37 findings standing.
2. A `_note.md` breaking a rule answers nothing, from Vale or the sweep.
3. Each keyword the checker holds takes a case feeding it a bad note.
4. `./RUNME.sh lint` names every departure in the standard line shape.
5. `./RUNME.sh mint` writes one note per kind, and the checker passes each one.

# What the checker finds

33 notes carry a kind, 21 of them depart, and the departures count 37:

| kind | notes | depart | findings |
|---|---|---|---|
| design_output | 15 | 15 | 29 |
| rationale | 8 | 4 | 6 |
| guidance | 7 | 0 | 0 |
| design_input | 1 | 1 | 1 |
| funnel | 1 | 1 | 1 |
| handover | 1 | 0 | 0 |

Three departures carry the weight, and a person owns each one:

| the departure | how many | what stands behind it |
|---|---|---|
| `Schema.Scope` | 16 | every design output and the one funnel open with their own chapter |
| `Schema.describes` | 14 | every design output names the code it describes, and the schema forbids the field |
| `Schema.Why` | 4 | two rationales title their own chapter, and two number their chapters backwards |

The two backward ones are real disorder: `spec/rationales/testing.md` runs 4
then 3, and `spec/rationales/voice.md` runs 10 then 4.

# What a program passes over

Four keywords answer no finding, and each one costs something:

| keyword | why a program passes | what it costs |
|---|---|---|
| `tense` | Vale holds `PastTense` over the whole file | a chapter marked `past` inside a present-tense note meets no rule |
| `detailMarker` | the marker is one rule's own choice | a rule wanting an argument and carrying no star stays quiet |
| `description` | it is prose for a person | mint carries it, and nothing weighs a chapter against it |
| `matches` | it names a second note, and resolving a link is a job of its own | a rationale chapter answering no item stays quiet |

`matches` is the one worth building. It reaches `explains`, reads the note that
link names, and counts the starred items. A link resolver lands first.

# The schema this branch changes

`spec/schemas/guidance.schema.yaml` loses its `Motivation` chapter. Two rules
in the standing layer move it:

1. `spec/guidance/guidance.md` rule 3 says a guidance note holds one chapter,
   `Actionables`, and links its rationale in the frontmatter.
2. Rule 2 puts the argument, the history and the measurement in
   `spec/rationales`.

So a required `Motivation` chapter asks every note to carry its argument twice,
against the standing rule of this tree. All seven guidance notes depart from
that chapter, and the seven pass once it goes.

The next candidate is `design_output`, and it needs a person:

| the reading | what it says |
|---|---|
| the notes | 14 of 15 name `describes` or `implements`, so the schema wants the field |
| the schema's own comment | the code below names the note, so the field is a second copy of that trace |

# What lint costs

| the run | milliseconds |
|---|---|
| `./RUNME.sh lint` over the tree | 780 |
| `schemaFaults` inside it | 9 |
| `treeFaults` beside it | 9 |

Vale carries the rest. The checker reads 33 notes and six schemas through the
disk door, and it adds about one percent.

# What waits

| the thing | what the next session does |
|---|---|
| the severity flip | `SEVERITY` in `lib/schema.js` says `warning` in one place, so error is a one-word change |
| the write door | an `Edit` hands a whole-document rule the edited lines alone, so the door reads the file off disk first |
| the 37 findings | decide `describes` and `Scope` for design outputs, then mend the four rationales |
| `matches` | build the link resolver, then the keyword |
| the handover kind | `work.js` appends `How this branch runs` as a heading, and the schema counts it a chapter |

Nothing on this branch refuses a write. The findings stand at warning, and
`./RUNME.sh check` stays green while a person reads them.

# The retro

Four things surprise me:

1. `kind: [[guidance]]` reads as a flow list before it reads as a link, because
   both open with a bracket. The link case goes first, and a test holds it.
2. Vale reads a heading inside a template literal in a test file, so a YAML
   comment there trips `ShortHeading`. The comment goes.
3. `lint` answers 1 for any finding at all. The green check this brief asks for
   needs the exit to weigh severity, so a warning names itself and passes.
4. `spec/rationale/a-section-is-measured-in-words` stands nowhere in this tree.
   The ruling it names still holds. `spansIn` in `lib/judge.js` skips a line
   opening `<!--` already, so mint writes each description as one line and
   `lib/judge.js` stays as it is.

Two dead ends:

1. A second `--glob` flag for Vale works, and one nested pattern says the same
   thing in one place. `--glob=!{{.se,node_modules,.git}/**,**/_*}` stands.
2. Clearing `BasedOnStyles` in `.vale.ini` skips a draft for the language
   server, and the CLI glob alone leaves the editor drawing. Both land, because
   the two readers take different doors.

The hook change waits for the next session: a cloud box loads the hooks module
once, at the start. So the tests prove the write door skip, and Vale over a
parked name proves it again.

Three scripts stand under `.se/scripts`, which git ignores:

| the script | what it answers |
|---|---|
| `probe.mjs` | the schemas as they read, and what mint writes |
| `probe2.mjs` | every finding, and the departures per kind |
| `cost.mjs` | what the checker costs beside the tree rules |
