---
kind: [[ticket]]
state: open
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
group: the-tree-names-its-things
process: [[spec/processes/question]]
process_hash: 1f3006ec4b044a89
step: answer
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->

[[spec/tickets/a-write-meets-its-hash]] asks the write door to refuse a write
built on a stale read. A hand with no stamp on a file the disk holds gets
refused, so it reads first.

The apply lane builds its own event and calls the write door with it. That event
names the tool and drops the hand, so every batch edit reads as unstamped:

- `src/bridge/apply.js`
- `src/bridge/tools.js`

So the rule as drafted refuses `mcp__level0__patch` and `mcp__level0__replace`
over a file the disk holds. That lane is what the working guidance names for a
change over many files.

The owner decides which way this lands:

| way | what it costs |
|---|---|
| the lane carries the hand, and stamps every file it writes | the two callers thread a token the event lacks today |
| the lane stands outside the rule | a batch lands whatever the disk holds, and reads each file at the call |
| the lane stamps as it reads | the rule holds over it, and the caller changes nothing |

The design step returned twice on this rule, and the engine parked a person step
on that ticket. [[spec/tickets/a-write-meets-its-hash]] carries the record.

<!-- waits, as list: one line each, naming what stands still until the answer lands -->

- [[spec/tickets/a-write-meets-its-hash]] stands at its design step until the answer lands
- the write door keeps no stamp, so a stale write still drops the other hand's change

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- the answer names one of the three ways, or a fourth the reader writes down
- `./RUNME.sh test test/level0/apply.test.js` answers green once the rule lands
- `./RUNME.sh check` answers 0 once the rule lands

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

The engine keeps the mark in the hook, and the hand carries nothing. The owner
rules that the hand knows nothing of this. It writes what it writes, and meets a
refusal where the file moves.

| step | who acts |
|---|---|
| content reaches the agent, through a read or through its own write landing | the door hashes the file and keeps it against that path |
| the agent writes to that path | the door hashes the disk now |
| the two agree | the write lands |
| the two differ | the door refuses, and says to read the file again |

Which read sets the mark is the whole of the mechanism. The door reads a file
for itself on every edit, so a mark off that read compares against itself and
buys nothing. The mark comes off the read reaching the agent.

So the lane wants no change and no token:

| way | why it stands aside |
|---|---|
| the lane carries the hand | two callers thread a token for a thing the hook answers alone |
| the lane stands outside the rule | a batch then drops another hand's change, which is the loss the ask names |

The lane reads each file at the moment it writes, so its read is both the
agent's read and the freshest one standing. The door marks it there, the way it
marks any other.

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

- [[spec/tickets/a-write-meets-its-hash]] hands this over at `design/person-1`, which waits for a person.
  - design/review failed back 2 times: The unstamped rule refuses `mcp__level0__patch` and `mcp__level0__replace` over a file the disk holds.
  - the apply lane calls `onWrite` with an event it builds itself, and that event carries no hand
  - so a batch edit reads as unstamped, and the door refuses the tree its own way to change many files
  - the batch reads each file at the call, so it stands stale nowhere. Pass it as a case the rule names
  - a batch that lands leaves the hand behind the disk, so stamp every file the batch writes
  - `mintsNote` refuses a path the disk holds, so the new file case already carries that lane
  - the door answers ahead of the write, and a write the engine drops leaves a stamp ahead of the disk
  - that next write refuses and asks for a read, which costs a read and loses nothing. Say so
  - every earlier finding stands answered, and the code bears out the claims on `hashText`, `refusal` and `codeDoor`
