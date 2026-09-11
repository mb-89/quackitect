---
kind: [[handover]]
status: todo
urgency: now
---

# Where it stands

The funnel note `spec/funnel/a-paragraph-has-a-schema.md` names six branches,
and this is the second. Read that note first. It stands on the branch
`claude/friendly-brown-k6kohy` until the owner merges it, so take that branch
in where `work sync` leaves the note absent.

`spec/schemas/paragraph.schema.yaml` stands on the same branch. It names seven
layers and three registers, and `readYaml` in `lib/schema.js` reads it. The
projector in `lib/projection.js` holds one shape today, the config commands.
Ten hand-written rules under `spec/config/styles/VoiceVale` say what the
schema's enumerable layers say.

# What waits

| the piece | where | proves it |
|---|---|---|
| the type of each schema key | `spec/schemas/paragraph.schema.schema.json` | a schema missing a layer fails the check |
| the shape `paragraph rules` | `lib/projection.js` | a fake tree gets one rule file per layer |
| the entry naming it | `spec/config/projections.json` | the session start writes the target |
| the rule files | `spec/config/styles/VoiceParagraph` | each one refuses a bad fixture |
| the sections naming the style | `.vale.ini` | the prose and answer registers read it |
| the ten hand rules, which go | `spec/config/styles/VoiceVale` | the check stays green without them |

# What the projection writes

One rule file per enumerable layer, and the projector holds the Tengo template
while the schema hands it the values:

| layer | rule | the template |
|---|---|---|
| characters | `Characters.yml` | a script over the raw scope refusing any character outside the set, past a fence and a code span |
| markup | `Markup.yml` | a script admitting the markup the layer lists, with the heading cap and the strong-lead cap |
| shape | `Shape.yml` | the paragraph and run caps, in the shape `PreferStructure` holds today |
| sentence | `Sentence.yml` | the word caps, the opening, the closing and the code-span cap |
| grammar | `Auxiliary.yml`, `Modal.yml`, `Contraction.yml`, `Latin.yml`, `PastTense.yml` | the sequence and substitution rules, with the exceptions from the schema |

The punctuation stands by name in the schema, `full stop` and its kind, because
the YAML reader splits a scalar on a colon. The projector maps each name to its
character.

The answer register changes two caps, so the projector writes the answer
variant of `Shape.yml` beside the prose one, the way `PreferStructureAnswer`
stands beside `PreferStructure` today. The requirement register waits for a
later branch, so write nothing for it here.

# What comes out

These ten files say what the projection now says, so remove them and let the
targets stand in their place:

- `LongSentence`, `LongParagraph`, `PreferStructure`, `PreferStructureAnswer`
- `Contraction`, `LatinAbbreviation`, `EtCetera`
- `ShortHeading`, `OneTitle`
- `PastTense`, whose eleven exceptions already stand in the schema

`Passive`, `Antithesis`, `ShoutedLead` and the code rules stay as they are.

# How to build it

Every projected rule takes a test that feeds it something bad and asserts the
refusal, and one that feeds it something clean. Run the tests over the fake
disk. Keep the write door refusing a hand edit to a target, and keep
`./RUNME.sh check` refusing a stale one, both of which `projection.js` does
today. Run `./RUNME.sh voice measure` over `spec` before and after, where the
first branch has landed, and write the two numbers into the handback.

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
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
