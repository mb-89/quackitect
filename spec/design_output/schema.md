---
kind: [[design_output]]
---

# Scope

`spec/schemas` holds one file per kind of note. This note says how a program
reads one, how it weighs a note against one, and what it answers.

| the piece | where |
|---|---|
| the reader and the checker | `.claude/skills/level0/lib/schema.js` |
| the sweep, beside the tree rules | `src/scripts/cli.js` |
| the underscore skip | `lib/paths.js`, and every caller of it |
| the `mint` verb | `src/scripts/cli.js` |
| the `mint_note` tool | `.claude/skills/level0/hooks/level0.js` |

# The reader and the checker

Two halves stand in one module:

| it takes | it answers |
|---|---|
| `readYaml(text)` | the schema, as a map |
| `readNote(text)` | the frontmatter and the chapters, each with its line |
| `checkNote(text, schema, where)` | the findings, one per departure |
| `schemaFaults(tree)` | the findings over every note git holds |
| `mintNote(schema, fields)` | the text of a note the checker passes |
| `governorOf(schemas, path)` | the schema holding that path, or nothing |
| `placeholderFaults(text, schema, where)` | every placeholder the note still carries |

The caller hands the disk in through the tree, so a test drives all seven over
`fakeDisk` and touches memory alone.

# The yaml a schema reads

A schema is YAML, and this tree carries no YAML library. The reader holds the
subset the six files use, and nothing past it:

1. a map, by indent
2. a list of scalars, and a list of maps
3. a flow list, written `[todo, held, done]`
4. a quoted scalar, a bare scalar, an integer and a boolean
5. a comment line, which the reader skips
6. a link, written `[[name]]`

A link reads as one string, before a flow list ever does. `[[guidance]]` opens
and closes with a bracket, so the order of those two cases decides it.

# What a note reads as

A note reads as a frontmatter half and a body half.

| it answers | what it gives |
|---|---|
| `front.stands` | whether the note opens with frontmatter |
| `front.said` | the fields, through the same YAML reader |
| `front.lines` | the line each field stands on |
| `sections` | every heading, its level, its line, and the lines under it |

A fenced block holds no heading, so the reader counts the fences and passes
over what stands between them.

# The schemas read once

`schemasIn(tree)` reads `spec/schemas/*.schema.yaml` and answers a map from
kind to schema. A note names its kind as a link, `kindOf` unwraps it, and the
map answers the schema for that kind.

# A schema names its chapters

`spec/schemas` holds two shapes. A note schema names the chapters a note of
that kind carries, and `isNoteSchema` is what tells one from the other.

| the shape | what it names | who reads it |
|---|---|---|
| a note schema | `body.sections`, one chapter an entry | the write door, `./RUNME.sh mint` |
| a model schema | the values a projector writes into a rule | a projector, and a person |

`spec/schemas/paragraph.schema.yaml` is the second shape. It names no chapter,
so `schemasIn` leaves it out, the write door asks it nothing, and `mint` offers
the note kinds alone. For details, see [[spec/funnel/a-paragraph-has-a-schema]].

# A folder names its kind

Each schema takes a `governs` list, one glob a line:

    governs:
      - spec/guidance/**

`governorOf(schemas, path)` answers which schema holds a path, and a path no
schema governs stands as it stands today. In a governed folder the door holds
three things:

| the write | what happens |
|---|---|
| a note of the governed kind | the checker weighs it, as today |
| a note of another kind | refused, naming the kind the folder holds |
| a file with no `kind` | refused, naming the schema and `mint_note` as the road |

The sweep reads the same three rows, so `./RUNME.sh check` turns red on a
stranger already standing in the tree. A draft under an underscore stays
outside every rule, because `tree.paths()` and the door both drop it first.

The handover schema governs `HANDOVER.md` at the root and `.se/HANDOVER.md`, so
its `governs` names two paths and no folder. Two folder names differ from the
kind they hold, `spec/rationales` for `rationale` and `spec/design_input` for
`design_input`. A glob says the folder outright, so no rule about names holds.

# A finding names the section

A finding carries the shape every rule in this tree answers:

    { file, rule, line, column, message, severity }

The rule names the schema and the place inside it, so a reader sees both:

    spec/guidance/voice.md:7:1: Schema.Actionables: A note holds 15 items.

| where it departs | the rule reads |
|---|---|
| a frontmatter field | `Schema.<field>` |
| a chapter | `Schema.<Header>`, run together |
| a kind no schema holds | `Schema.Kind` |

These keywords answer a finding today:

| keyword | what a departure looks like |
|---|---|
| `required` | a field, or a chapter, that stands nowhere |
| `additionalProperties` | a field outside the properties the schema names |
| `const` | a kind naming another kind |
| `enum` | a status off the list |
| `type` | a list written as one line |
| `x-link` | a link written bare |
| `order: strict` | a chapter before the one the schema puts first |
| `position: last` | a chapter after the one that closes the note |
| `extraSections` | a chapter outside the ones the schema names |
| `list`, `ordered` | prose where a numbered list belongs |
| `maxItems` | one item past the cap |
| `subsections` | a chapter opening with no number, or numbers running back |

`tense`, `detailMarker`, `description` and `matches` answer none. Vale holds
the tense, a person reads the marker, and `matches` reaches a second file.

# A comment counts toward nothing

`mint` writes each description as a one-line HTML comment. Two readers pass
over it:

1. `itemsIn` strips a comment before it counts an item, so a template costs
   nothing against `maxItems`.
2. `spansIn` in `lib/judge.js` skips a line opening `<!--`, so the judge reads
   the prose alone.

# The sweep over the tree

`schemaFaults(tree)` walks every path git holds, keeps the markdown carrying a
kind, and checks each one. `./RUNME.sh lint` runs it beside the rules over two
files, so a departure reaches the problems panel where a person reads it.

A file carrying no `kind` reaches no schema, unless a schema governs its path.
There the sweep names it, as the door does.

# Mint writes a valid note

`./RUNME.sh mint <kind> <path>` reads the schema for that kind and writes the
note it names:

| what mint writes | from |
|---|---|
| the fields the schema requires | `frontmatter.required` |
| a link, an enum value, or the description | `const`, `enum`, `description` |
| one heading per chapter | `body.sections[].header` |
| the description under each, as a comment | `description` |
| one item, where a chapter holds a list | `list`, `ordered` |

The checker passes every note mint writes, and a contract test asserts that
over every kind a schema describes.

# The tool writes the note

`mint_note({ kind, path, fields })` reads the schema for the kind and writes the
note. `fields` carries the frontmatter values and the text under each chapter,
by header. `mintedNote` builds the text and runs the checker over it, and the
hook writes what passes.

| what the tool meets | what it answers |
|---|---|
| a kind no schema describes | the kinds `spec/schemas` holds |
| a path another schema governs | the kind that folder holds |
| a path standing already | the path, and a word to name another |
| a note the checker refuses | the findings, and no file lands |
| a note the checker passes | the path, and every placeholder still standing |

The tool writes through `$.fs`, past the write door. The checker runs over the
text first instead, and the two read the same schema.

# The fields a caller names

`fieldsIn(argv, schema)` reads `--name=value` off the command line and answers
the same map the tool takes. `slugOf` matches a name against a frontmatter key
and against a chapter header, so `--what-stands-open=...` reaches the chapter
`What stands open`. The reader refuses a name outside the schema, and names
every field it takes.

A person and a session read one shape:

    ./RUNME.sh mint funnel spec/funnel/a-name.md --about="the question"

# A placeholder stands at warning

A field the caller leaves out takes the placeholder `mint` writes, the
description the schema gives. So the note lands whole in shape, and nothing
half-written reaches the tree.

`placeholderFaults` names each one that still stands. It reads the raw line, so
a value equal to what `mint` writes is the one thing it names. A field taking a
`const` or an `enum` carries a real value, and answers no finding.

# Warning now and error later

A departure from the shape stands at `SEVERITY`, which reads `error`, and
`./RUNME.sh check` turns red on it. A placeholder stands at `LEFT`, which reads
`warning`: the panel draws it, and check stays green. So a minted note lands
and the tree stays passable while a session fills it in.

# The underscore parks a draft

`isDraft(path)` in `lib/paths.js` answers whether any part of a path opens with
an underscore. Park a draft as `_note.md`, and the tree stays green while a
kind settles.

| the reader | how it skips |
|---|---|
| Vale, over the tree | `--glob=!{...,**/_*}` |
| Vale, over one file | the last section of `.vale.ini` |
| the language server | that same section |
| the write door | `isDraft` before the code door and the prose door |
| the rules over two files | `tree.paths()` drops one |
| the standing layer | `readFolder` drops one |
| Biome | the sweep drops the row |

A parked guidance note hands the agent no rule, because the same skip takes it
out of the standing layer.

# The door refuses a departure

Every note stands at its shape, so every finding stands at `severity: error`,
which `SEVERITY` names in one place. `./RUNME.sh check` turns red on a
departure.

The write door weighs every markdown write against the schema its `kind` names.
The schemas load once, at `session.start`. An `Edit` hands the door the edited
lines alone, so `wholeAfter` reads the file and applies the edit first. The door
then weighs the whole note it leaves behind.

A departure stands refused, and the refusal names each finding and two ways on:

- `./RUNME.sh mint <kind> <path>` writes the shape the schema names.
- A draft named `_name.md` stands outside every rule while it settles.

A stranger in a governed folder takes its own refusal, `refusedKind`, which
names the schema file, the finding and `mint_note` as the road.
