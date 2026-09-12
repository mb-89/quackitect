---
kind: [[funnel]]
about: a schema saying what a paragraph may hold, projected into Vale, read by every door and grown by the retro
---

# Scope

Every paragraph the agent writes validates against one schema, in a file and in
the chat alike. The schema is a whitelist: it names what a paragraph may hold,
and a door refuses the rest. Nothing in it lists a bad word.

The measurement behind this note stands in `.se/scripts/measure.sh`. It reads
212 answers from four days. Three in four carry a finding under the rules the
tree holds today. The largest tell, the em dash, has no rule at all. The bound
sessions and the unbound sessions score within noise of each other. So the
standing guidance moves the chat by nothing a linter sees, and the doors move
files by everything.

This note settles four things, and the owner weighs the rest under the last
chapter:

- the shape of the schema, which stands as `spec/schemas/paragraph.schema.yaml`
- the projection that writes it into Vale
- the doors that read it
- the loop that grows it

# Three homes, one source

| the thing | where it lives | who writes it |
|---|---|---|
| the schema | `spec/schemas/paragraph.schema.yaml` | a person, and the retro |
| the vocabulary | `spec/vocabulary/words.yml` | a person, the session, and the retro |
| the Vale rules | `spec/config/styles/VoiceParagraph/*.yml` | the projection |
| the judged rules | `spec/config/styles/VoiceJudged/*.yml` | the projection |
| the register sections | `.vale.ini` | a person, for now |

The schema is the source, and Vale is its projection. The projection reaches
every paragraph, because the doors read Vale. The schema reaches every
paragraph too, and a later schema for a note kind reaches its kind alone. So
the two say the same thing, and the schema holds the values while the projector
holds the Tengo.

One entry in `spec/config/projections.json` names it:

    {
      "name": "the paragraph rules",
      "shape": "paragraph rules",
      "target": "spec/config/styles/VoiceParagraph",
      "from": "spec/schemas/paragraph.schema.yaml",
      "schema": "spec/schemas/paragraph.schema.schema.json",
      "wrap": "none"
    }

A `shape` the projector does not know costs one program, once. The write door
refuses a hand edit to a target, and `./RUNME.sh check` refuses a stale one,
so the rule files stay honest.

# What the schema admits

The schema holds seven layers. Five of them enumerate a set, and a door refuses
what stands outside it. Two of them name a set no pattern holds, and the judge
asks one question each.

| layer | admits | holder |
|---|---|---|
| characters | letters, digits, space, and `. , ? ! : ( ) ' " -` | Vale script |
| markup | a code span, a link, a fence, a table, a list item, a short heading, a strong lead on a bullet | Vale script |
| shape | six sentences a paragraph and three paragraphs a run, with three and two in an answer | Vale script |
| sentence | two to twenty-five words, twenty in a list item, a plain opening, `. ? !` last, four code spans at most | Vale script |
| grammar | one finite verb in a simple tense, no auxiliary chain, a modal from the register | Vale sequence |
| vocabulary | a word from `words.yml`, a code span, a link, a path, or a name | Vale script |
| meaning | one thing the reader acts on, in the shape it has | the judge |

A plain opening is a capital, a digit, a code span or a quote. The first row
kills the em dash, the semicolon, the ellipsis, the arrow and the emoji. No
list of them stands anywhere. A fence and a code span stand outside every
layer, because the formatter and the compiler hold those.

The grammar row carries the auxiliary rule the field agrees on. A sentence
holds one finite verb, and the tagger reads it:

| refused | the reason |
|---|---|
| `be` + past participle | the passive, and the actor goes missing |
| `have` + past participle | the perfect, and the time goes missing |
| `be` + `-ing` | the progressive, where the simple tense says the same |
| a modal + `be` + past participle | a stack, and nothing happens |

The tagger misreads a heading, a table cell and a quoted command, so this row
stays a blacklist inside the whitelist. `Passive` and `PastTense` already stand
in that form, and they move under the schema as they are.

# The vocabulary grows itself

A word whitelist holds where its seed covers the writer, and the numbers say
what the seed has to be. Against the OpenSTE list alone, 42 percent of the
words in the uploaded answers stand outside. So does 39 percent of the owner's
own prose in `spec/guidance`. This tree's voice runs on words of its own.

So the seed takes three sources, and `spec/vocabulary/words.yml` holds them:

| source | entries carry | what it adds |
|---|---|---|
| OpenSTE, MIT | `from: openste`, and a part of speech | the 900 words the standard admits |
| the tree's own prose, words used twice or more | `from: tree` | the words this voice runs on |
| the pronouns | `from: pronoun` | the words OpenSTE leaves to the writer |

Against that seed, the answers stand 10 percent outside. The outside words are
contractions, past-tense forms and words used once, and the grammar layer
refuses the first two already. So the tail the vocabulary layer meets on its
own is a few percent, and the session adds those on the fly:

1. The door refuses a paragraph and names every word outside the list.
2. Where an entry carries `insteadOf`, the refusal hands the writer the better
   word, so a refusal teaches the swap.
3. The session adds the missing word to `words.yml` with a meaning, under
   `from: session`, and writes the paragraph again.
4. The retro reads every `from: session` entry and keeps it or cuts it.

The swaps seed from the standard's own list of the writer errors it meets most,
which the video kit paraphrases under MIT. An entry the session adds carries
its own `insteadOf` where it knows one.

The word rules with a closed set stay beside it: no contraction, no Latin short
form, and the modal set of the register.

# The registers

One schema, three registers. A register changes a limit and a set, and nothing
else, so the schema holds them as overrides:

| register | reaches | what changes |
|---|---|---|
| prose | every `.md` and every comment | the defaults above |
| answer | the chat, as `*answer.md` | three sentences a paragraph, two paragraphs a run, the question table and the TL;DR list first |
| requirement | `spec/requirements/*.md` | the modals `shall`, `should` and `must` join the set, each with the meaning RFC 2119 gives it |

The modal set of the prose register is `can`, `must` and `will`. A
requirement says `shall` where it binds and `should` where it advises, and no
other register reads either word.

`.vale.ini` names the register per path today, and the projection writes the
rule files under it. Whether `.vale.ini` becomes a target too stands open
below.

# The question comes first

A prompt carrying a question gets its answer before anything else. The
mechanism reads what the doors already read:

| step | who | what happens |
|---|---|---|
| the prompt arrives | `prompt.submit` | the door counts the sentences closing on `?`, outside a fence, and holds the count for the turn |
| the answer ends | the answer gate | the first block of the answer is a table with the header `question` and `answer`, one row per question |
| the count is zero | the answer gate | the table is not demanded |
| a question stays open | the agent | the row's answer says what blocks it, and the turn ends on that |

The table stands first because a reader skims an answer, and the question is
why they read. The rest of the answer follows under it. The door that holds
the owner's prompt first keeps its own rule, a readback before the first tool
call. The table lands at the turn's end when the answer takes research.

# The bottom line comes first

Under the question table, an answer opens with a TL;DR list and puts the detail
under it. Three rules hold that, two mechanical and one judged:

- The block after the question table is a list. Each item is one sentence,
  and each sentence is one bottom line. The shape rule holds it.
- No heading stands before that list. The markup rule holds it.
- The judge asks whether the list states the outcome, or whether the outcome
  arrives late, under a heading. The rule refuses `late`.

So an answer reads in three tiers: what you ask, what stands, and then the
detail for whoever reads on.

# A list is a list

Voice rule 3 says structure comes first and prose comes where none of the three
fits. The schema holds it in three rows, one per structure:

| the shape | the test | holder |
|---|---|---|
| a list | a sentence naming three or more parallel things in a row, joined by commas and `and` | Vale existence |
| a table | two or more sentences in a row giving the same fields for different things | the judge |
| a diagram | a paragraph saying what reaches what, or what happens after what, over three or more things | the judge |

The judge asks one question per paragraph, with the labels `prose`, `table`
and `diagram`, and it refuses a paragraph whose label is not `prose`. The
list row costs no call, so it goes to Vale.

# Every door reads it

| door | reads | on a breach |
|---|---|---|
| the write door | every Write and Edit of prose | refuses the write, naming the line and the rule |
| the Bash door | a shell write and a commit message | refuses the command |
| the answer gate | the chat answer, at `turn.complete` | re-prompts, under the bands below |
| the spawn | a helper's prompt | hands the helper the same standing text |

So the chat reads the same rules as a file, with one limit the harness sets.
The reply already stands on screen when `turn.complete` fires, and the hook
refuses nothing there. A rejection is therefore a re-prompt, and a re-prompt
puts a second answer under the first. Every project in the field meets this
and lands on bands, and so does this note:

| findings in an answer | what happens |
|---|---|
| none | nothing |
| under the ceiling | the findings carry into the next prompt as one line |
| at the ceiling or over it | one re-prompt saying rewrite, once per turn |

`spec/config/level0.json` holds the ceiling beside the judge's knobs, and
`stop.mostInARow` caps the re-prompts the way it caps the tooth. A pre-send
tool closes the gap the gate leaves: `check_answer` takes a draft, runs it
through the answer register, and answers the findings. A draft checked before
it goes out meets the gate clean, and the guidance carries that one line.

# The retro grows the list

A whitelist refuses what it does not know, so it starts wrong and gets right.
The loop has four parts, and three of them stand already:

| part | stands | what it does |
|---|---|---|
| every refusal writes a row | yes | the door log carries the rule, the path, the line and the phrase |
| a verb ranks the rows | no | `./RUNME.sh voice refused` lists rule by phrase over the last sessions |
| the retro reads the ranking | the handover carries a retro already | a session names what the door refused wrongly |
| the schema carries the exception | no | an `exceptions` list per layer, one line and one reason each |

The projection carries an exception into the rule, so the schema stays the one
place a person edits. `PastTense` already holds eleven exceptions inside its
own file, and they move into the schema with it. The writes of this very note
meet five more. The tagger reads `bold`, `add`, `approved` and the word for
ten tens as the past tense. And the door lints an edit's fragment on its own,
so a lone table row reads as one too.

A count guards the loop. A rule refusing the same phrase past a set number in
one session writes a `warn` row naming itself. So a rule that misreads shows
up on the day, and the twelfth misread has a place to land.

# What it costs

| cost | size |
|---|---|
| the projector shape | one program, with the template per layer |
| the hand rules that move | nine files, replaced by the projection |
| the tests | one per rule, feeding it something bad and asserting the refusal |
| the answer gate | one duplicate answer per hard breach, on screen |
| the judge | one call per paragraph for the table and diagram questions, at the judge's own sampling |
| the first weeks | false refusals, and the retro loop is the answer to them |

The work splits into six branches, in this order, each with a delta the
measurement reports:

| branch | does | touches | proves it |
|---|---|---|---|
| the verbs | `voice measure` scores a folder, and `voice refused` ranks the log's refusals | `src/scripts`, `RUNME.sh` | a fixture folder scores a known number |
| the schema and the projector | one `shape` in `projection.js` reads the schema and writes a rule file per enumerable layer | `lib/projection.js`, `projections.json`, `VoiceParagraph` | each rule refuses a bad fixture, and the nine hand rules it replaces come out |
| the vocabulary | the projection inlines `words.yml` into one rule, the refusal names the outside words and the swaps, and the cage reloads on a write to the list | `lib/vale.js`, `lib/refuse.js`, `words.yml` | a paragraph with one outside word meets a refusal naming it |
| the answer gate | `turn.complete` re-prompts under the bands, `prompt.submit` carries a warning forward, and `check_answer` registers at the session's start | `hooks/level0.js`, `level0.json` | a fake session over the ceiling meets one re-prompt, and one alone |
| the question and the TL;DR | `prompt.submit` counts the questions, and the answer register demands the table and the list first | `lib/answer.js`, the schema | a prompt with two questions refuses an answer opening with prose |
| the judged rows and the register | `BottomLineFirst` and `ShapeFits` join `VoiceJudged`, and `spec/requirements` takes its modals | `VoiceJudged`, `.vale.ini` | a fake judge labels a fixture, and the door refuses the refused label |

Each branch lands alone, and the measurement after each one reports the delta.

# What stands open

| the question | what hangs on it |
|---|---|
| whether `.vale.ini` becomes a projection target | a register then lives in the schema alone, and one file fewer is hand-written |
| where the rule card sits mid-turn | `prompt.section` may fire per request, and a probe on the client says whether the card and the last score live there |
| the ceiling for the answer gate | how often the owner sees a second answer |
| the judge on every paragraph | the cost of the table and diagram questions, with or without sampling |
| when a word the session adds takes effect | the cage reloads the rule on the write, or the next session reads it |
| a strict register with the OpenSTE words alone | whether a procedure or an error message here ever wants it |
| the file name of a checked draft | `.se/answer.md` through the write door, or the tool alone |
