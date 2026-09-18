---
kind: [[ticket]]
state: open
urgency: now
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
process: [[spec/processes/question]]
process_hash: 1f3006ec4b044a89
group: the-warnings-feed-a-refactorer
step: do
record:
  - step: answer
    hand: box dd2a59294365 · claude-code-remote · the owner says so
    hash_before: bf011f342ad11c5363a262f4d214e13c22f4de41
    hash_after: bf011f342ad11c5363a262f4d214e13c22f4de41
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->

[[spec/tickets/a-rule-carries-its-side]] asks each rule to say whether its break refuses a write or joins the warnings. Its gain asks for one list feeding the panel, the refactoring hand and the push door. Two reviews returned the approach on the same point, so the engine inserted a person step.

The question: what is the one list?

| way | what it holds | what it costs |
|---|---|---|
| a record the write door fills | what a write in this session meets | the panel draws findings the record misses, so two lists stand |
| the check's own answer | every warning over the tree | a push waits on a pass of the whole tree, and the tree carries many today |
| the record, with the check writing it too | both, in one file | the check gains a writer's job, and a stale record reads as truth |

The push door turns on the answer. A door reading the write record alone lets through every warning standing in the tree today. A door reading the tree refuses every push until the tree stands clean.

Two facts the reviews establish:

- every rule under `VoiceScript`, `VoiceShape` and `VoiceVale` reads `level: error` today, so that half of the ask stands done
- `size.js`, `ticket.js` and `schema.js` each build a finding carrying `severity`, beside the rules the approach names

<!-- waits, as list: one line each, naming what stands still until the answer lands -->

- [[spec/tickets/a-rule-carries-its-side]] closes became, and its implement waits on this
- [[spec/tickets/the-hook-spawns-a-refactorer]] reads the same list, so its ask waits too

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- the answer names the one list, and what each reader takes from it
- the answer says what the push door reads, and what it does with the warnings standing today
- `./RUNME.sh check` answers 0 on the commit carrying the change

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

The one list is the check's own answer, and nothing writes a second one.

| reader | what it takes |
|---|---|
| the panel | what the language server draws, which the check reads too |
| the push door | `./RUNME.sh lint`, run over the files the push carries |
| the refactoring hand | the same lint, run over the tree |

**Why the check and no record.** A record a write fills holds what a write met, and the panel draws what the tree holds. Two sources drift the moment a hand edits a file outside a session. The check reads the tree, so every reader sees one thing.

**What the push door reads.** The lint over the files the push carries. So the warnings standing today block no push, and a file this branch touches carries its own.

| what a push carries | what the door does |
|---|---|
| a file with a warning the push adds | refuses, and names the file and the rule |
| a file whose warnings all predate the branch point | passes |
| no file the lint reads | passes |

That answers the review's sharpest finding: a door reading the whole tree refuses every push the moment it lands.

**What carries the side.** Every rule, at the place a reader edits it. The Vale rules gain a projected `level`, and the code rules keep the `severity` they stamp today.

| what builds a finding | what changes |
|---|---|
| `spec/schemas/paragraph.schema.yaml`, through `paragraph.js` and `snippets.js` | a `rules` map holds a side a rule, and the projection writes it |
| the hand-written rules under the three other folders | nothing, because each carries `level: error` already |
| `lib/tree.js`, `size.js`, `ticket.js`, `schema.js` | nothing, because each stamps its own `severity` already |

So the change is smaller than the ask reads. The side already stands almost everywhere, and the work is the projection's map and the two push doors.

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

- [[spec/tickets/a-rule-carries-its-side]] hands this over at `design/person-1`, which waits for a person.
  - design/review failed back 2 times. Every rule under `VoiceScript`, `VoiceShape` and `VoiceVale` reads `level: error` today, so that work stands done.
  - The scope line says the Vale rules alone, and the table beside it names `tree.js` and the Go rules.
  - The gain asks for one list, and the record a write fills stands apart from the list the panel draws.
  - The push doors read that record alone, so every warning `./RUNME.sh check` names today passes them.
  - `size.js`, `ticket.js` and `schema.js` each build a finding carrying `severity`, and the table leaves all three out.
