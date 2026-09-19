---
kind: [[ticket]]
state: closed
urgent: true
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
group: the-rules-hold-themselves
process: [[spec/processes/question]]
process_hash: 1f3006ec4b044a89
step: do
record:
  - step: answer
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: cfaf0627d9824c0a31ebcd50d63e961895f83819
    hash_after: cfaf0627d9824c0a31ebcd50d63e961895f83819
  - step: do
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 31496d7f45e2841cce2c963fce15efd9e6402d3c
    hash_after: 0527dbe1850d334ad9e96831d7f58b2c2cdf0239
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->

The slug turning a heading into an anchor stands in four places today, all of
them JavaScript:

- `src/extension/lib/panel.js`
- `.claude/skills/level0/lib/projection.js`
- `.claude/skills/level0/lib/schema.js`
- `test/contract/vocabulary.test.js`

[[spec/tickets/a-pointer-names-its-heading]] asks for a rule in the language
server, which is Go. That module imports none of the four, so the rule carries a
fifth copy.

One place owns a thing, and a copy a technical reason forces says so beside it.
So the owner decides which way this lands:

| way | what it costs |
|---|---|
| a fifth copy in Go, with its reason beside it | a rule drifting from the four, and one more place to fix |
| the checker asks the index over its door | a call per note, and a second module in the rule's path |
| one owner in Go, and the four read it | every JavaScript caller reaching a binary to slug a heading |

The design step returned twice on this rule, and the engine parked a person step
on that ticket. [[spec/tickets/a-pointer-names-its-heading]] carries the record.

<!-- waits, as list: one line each, naming what stands still until the answer lands -->

- [[spec/tickets/a-pointer-names-its-heading]] stands at its design step until the answer lands
- ten notes keep a pointer naming a heading standing nowhere, and the scan under the private folder lists them

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- the answer names one of the three ways, or a fourth the reader writes down
- `./RUNME.sh check` answers 0 once the rule and the notes land

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

One source owns the slug, and a projection writes it into both tool chains. The
owner rules that two languages mean two tool chains, and that a rule reaching
both belongs in one source projected into each. The tree projects that way
already: `spec/schemas/paragraph.schema.yaml` writes the Vale rules, and
`spec/config/projections.json` names every such pair.

| way | why it stands aside |
|---|---|
| a copy in each language, held by a contract test | nothing owns the answer, and a drift waits for a test to catch it |
| the checker asks the index | a call a note, and a second module in the rule's path |
| one owner in Go | every reader in JavaScript then runs a process to slug a heading |

Two shapes carry a projection, and this takes the second:

| shape | what the source owns | what each language holds |
|---|---|---|
| the function projects | the body | generated code, in both languages |
| the cases project | a table of heading and anchor pairs | its own function, driven by the shared table |

Three lines carry the reasoning:

- a slug is a handful of transformations, and a generated body ages badly where a language wants its own feature
- a table of pairs is data, it projects cleanly, and a drift turns both suites red off one source
- the check reads a stale projection already, so a drift fails there and no contract test stands in for it

The ask gains one line beside this answer: the cases fail on a copy nobody drives
from the table, and on a drift alike. Otherwise the next hand writes another
copy and both suites stay green.

The four places hold two rules, and the table drives one of them:

| where it stands | what it slugs |
|---|---|
| `slugOf` in `.claude/skills/level0/lib/schema.js` | a heading and a field key, for the schema door |
| the slug in `test/contract/vocabulary.test.js` | a heading, for the anchor a pointer names |
| `slug` in `.claude/skills/level0/lib/projection.js` | a config group, into a folder stem |
| `commandsOf` in `src/extension/lib/panel.js` | a config group, into a command name |

So the table drives the first pair and the Go rule, and the second pair stands
outside it. A config group holds no quote, and a heading does.

What this hand weighs, and what it assumes:

- a markdown renderer writes the anchor, so the rule drops a quote before it dashes the rest
- the tree writes `the-owners-prompt-comes-first` today, and the contract test holds that rule
- `slugOf` answers `the-owner-s-prompt-comes-first` there, so it takes the drop and reads one key
- no schema header and no field key holds a quote, so the schema door reads what it read before

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/vocabulary.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The slug takes a module of its own, and one source holds the cases it answers:

| what moves | where it lands |
|---|---|
| the function | `.claude/skills/level0/lib/slug.js`, which the schema reader imports |
| the cases | `spec/config/slug.yaml` |
| the case driving the function over them | `test/contract/vocabulary.test.js` |
| the chapter naming the moves | [[spec/design_output/vocabulary#the-slug-reads-one-source]] |

The two shapes disagree on a quote. The schema reader answers
`the-owner-s-prompt-comes-first`, and every pointer in the tree names
`the-owners-prompt-comes-first`. The one that stands drops the quote, so the
function takes that move. No schema header and no field key holds a quote, so
the schema door reads what it read before.

The other two places slug a config group into a name a person types, which is a
rule of its own. They stand as they are, and the answer's table says why.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the answer on one source, and the discussion says where it departs
- the cleanup it reveals: the two shapes fold into one, and a note carries what the door refuses
- each fact stands once: the cases own the rule, and the chapter names the moves

# Discussion

- [[spec/tickets/a-pointer-names-its-heading]] hands this over at `design/person-1`, which waits for a person.
  - design/review failed back 2 times: The three moves turn `owner's` into `owner-s`, so they answer the anchor `the-owner-s-prompt-comes-first`.
  - Say instead that the slug matches the one that stands, which turns `owner's` into `owners` before it dashes the rest.
  - A slug stands already in `test/contract/vocabulary.test.js`. Name it as the one the rule matches, so the copy carries its reason.
  - The list names [[spec/design_input/a-stub-takes-its-vehicle]], whose heading `The stub's files` answers the anchor its pointer names.
  - Drop that note, because the slug that stands resolves it. Ten notes stay.
  - The check answers 0 on this commit.
- The answer names a projection writing the cases into each tool chain. This change stops at the source both read.
- A projected copy adds a shape and a stale check, and both suites read the tree already. So a drift fails in a suite.
- The Go rule reads `spec/config/slug.yaml` the same way when it lands, and it carries its copy of the function.
- The write door refuses a write to a design output whose other lines the tree lint passes. `.se/tickets` holds the note.
