---
kind: [[handover]]
status: done
urgency: now
depends_on: [the-voice-verbs]
---

# Where it stands

The paragraph schema projects into Vale, and `./RUNME.sh check` reads green.
One entry in `spec/config/projections.json` names the shape `paragraph rules`,
and `lib/paragraph.js` reads the schema and writes sixteen rule files under
`spec/config/styles/VoiceParagraph`. The ten hand-written rules leave
`VoiceVale`, and `spec/schemas/paragraph.schema.schema.json` types every key
the schema holds.

| the piece | where | what proves it |
|---|---|---|
| the shape of the schema | `spec/schemas/paragraph.schema.schema.json` | a layer going missing fails the check |
| the shape `paragraph rules` | `lib/paragraph.js` | a fake tree gets sixteen rule files |
| the entry naming it | `spec/config/projections.json` | the session start writes the target |
| the rule files | `spec/config/styles/VoiceParagraph` | each refuses a fixture and passes another |
| the register sections | `.vale.ini` | prose and answer read their own caps |
| the ten hand rules | out of `VoiceVale` | the check stays green without them |

# What the projection writes

| layer | rule | reads |
|---|---|---|
| characters | `Characters.yml` | the punctuation set, by name |
| markup | `Markup.yml` | the heading cap, the one title, the strong lead |
| shape | `Shape.yml`, `ShapeAnswer.yml` | the paragraphs one run holds |
| shape | `Paragraph.yml`, `ParagraphAnswer.yml` | the sentences one paragraph holds |
| sentence | `Sentence.yml` | the words one sentence holds |
| sentence | `ListItem.yml`, `CodeSpans.yml` | the tighter cap, and the spans |
| grammar | `Auxiliary.yml`, `Progressive.yml` | the chains the schema refuses |
| grammar | `Modal.yml` | every modal the register leaves out |
| grammar | `Contraction.yml`, `Latin.yml`, `EtCetera.yml` | the short forms and their swaps |
| grammar | `PastTense.yml` | the tenses, with the exceptions the retro grows |

For details, see [[spec/design_output/projection#the-second-target]].

# The measurement

`./RUNME.sh voice measure spec` scores zero findings a thousand words on both
sides, because the verb reads the rules standing at the moment it runs:

| when | words | findings | a thousand words |
|---|---|---|---|
| before, under ten hand rules | 45613 | 0 | 0.0 |
| after, under sixteen projected rules | 46290 | 0 | 0.0 |

The number carrying the delta is a different one. Turning the new rules on
raises 166 findings over a tree the ten rules read as green:

| rule | findings | what it catches |
|---|---|---|
| `Characters` | 37 | the semicolon, the em dash, six emoji, a stray mark |
| `Modal` | 35 | `may`, `would`, `should`, `could` and `shall` in prose |
| `ListItem`, `CodeSpans` | 32 | a line listing five or more literal values |
| `Auxiliary`, `Progressive` | 21 | the perfect and the progressive |
| the rest | 41 | rule faults of mine, under the dead ends below |

This branch answers all 166. The prose moves where the rule reads right, and
the schema takes the two words the tagger misreads.

# What surprises me

- A Vale script match carries its own `message`. So one file says a different
  thing per finding, and no note here says so.
- A `scope: raw` rule over a code file reads the whole source, where the rule
  wants the comment. So a cap reaching a comment stays out of a script rule.
- The shape layer and the sentence layer split in two for that reason. A scoped
  rule takes the cap, and a script rule takes the rest.
- A Vale sequence exception reads the whole phrase. One word the tagger
  misreads stands in the file once per auxiliary in front of it.
- A YAML double-quoted scalar reads `\b` as a backspace. A swap key is a
  regular expression, so every one of them takes single quotes.
- A `.yml` file under `spec/config/styles` reaches no `BasedOnStyles` section.
  So the projected rule files lint nowhere, and they need no exemption.
- This tree's commit convention opens with the branch name, which carries a
  slash. A path stands outside every layer for that reason.

# The dead ends

- A first `blanked` rebuilds the text once per match. Vale kills it at its
  two-second bound, and it reads every match in one pass now.
- A Tengo map literal refuses a trailing comma. The parse error names a line of
  the generated file, where the fault sits in the template.
- The code-span cap counts per line at first, so it refuses a table row of five
  cells. It counts per sentence now, and a table row carries none.
- The run rule blanks an indented block ahead of the structure test, so a run
  stays open to the end. It reads the raw scope now.
- `fromJson` strips `VoiceVale.` alone, so a contract test naming a rule by its
  leaf fails against the new style. It strips either prose style now.
- The progressive fixture `is reading` passes, because the tagger reads
  `reading` as a noun. The test says `is holding`.

# What waits

| the thing | why it waits |
|---|---|
| the vocabulary layer | the next branch, and `words.yml` stands empty here |
| the meaning layer | `VoiceJudged` takes it with the judged rows branch |
| the requirement register | no `spec/requirements` folder stands yet |
| the sentence opening and closing | a colon opening a fence refuses half the tree |
| the two-word minimum | untried, and a one-word line is common in a table |
| `.vale.ini` as a target | the funnel note leaves it open, and it stays by hand |

The `misreads` count guarding the retro loop stands in the schema and reads
nowhere yet. `./RUNME.sh voice refused` ranks what the doors turn away, and the
warn row naming a rule refusing one phrase too often waits for its own branch.

This session writes two scripts under `.se/scripts`, and git carries neither.
One lists the characters standing outside the set once the markup goes, and one
pipes a fixture through the real binary. The contract test holds what both say.
