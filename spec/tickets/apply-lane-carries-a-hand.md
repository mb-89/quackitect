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
group: the-tree-names-its-things
process: [[spec/processes/question]]
process_hash: 1f3006ec4b044a89
step: do
record:
  - step: answer
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: fb291f12846afeb900313fdd3e11e001296a4859
    hash_after: fb291f12846afeb900313fdd3e11e001296a4859
  - step: do
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 8f5088077a7db1d61437ef5e1a63ec60b14e30b5
    hash_after: 8f5088077a7db1d61437ef5e1a63ec60b14e30b5
    answered:
      - name: tests
        exit: 0
        said: green, 26 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
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

The lane stamps as it reads, and the rule holds over it.

`readsFiles` reads every file off the disk inside the call that writes it, so a
batch stands stale nowhere. The rule refuses a hand carrying no stamp, and the
lane earns one by that read.

| where the lane stands | what it stamps |
|---|---|
| the read it makes at the call | the text the disk holds, under the hand |
| the write it lands | the text it wrote, under the same hand |

The second row keeps the hand current behind its own batch. A lane stamping the
read alone would meet its next write against a disk it moved itself.

What the other two ways cost:

- the lane carrying the hand threads a token through two callers, and buys what the read gives already
- the lane standing outside the rule lands a batch over whatever the disk holds

A write the engine drops after the door passes it leaves the stamp ahead of the
disk. The next write refuses and asks for a read. That costs a read and loses
nothing, because the unstamped rule already asks for one.

What this call weighs, on a box nobody sits beside:

- the read at the call is what makes this way sound, and `readsFiles` carries it today
- the stamp keys on the hand and the path, as [[spec/tickets/a-write-meets-its-hash]] drafts it
- the owner rules at the merge, and the tree loses nothing by taking this way first

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

    ./RUNME.sh branch test

## check

    ./RUNME.sh check

## says

The write door keeps a mark against each path, and a write meets it. A read
sets the mark, a write over a disk the mark disagrees with comes back refused,
and the refusal asks for a read. So one hand writing a file drops nothing
another hand put there.

| where | what it does |
|---|---|
| `lib/marks.js` | hashes a text, answers whether a mark agrees, and writes the refusal |
| the `Read` tool | sets the mark, because that read reaches the agent |
| the write door | meets the mark first, and sets it again on what the write leaves |
| the batch lane | sets the mark at the read it makes inside the call that writes |
| the undo | sets the mark on each file it puts back |

The lane takes no token, which is what the answer rules. It reads every file
inside the call that writes it, so that read is the agent's own and the door
marks it there. A preview keeps the marks it meets, because it moves no disk.

A path the disk holds nowhere writes with no mark, so a new file lands as it
did. The door answers ahead of the write, so a dropped write leaves the mark
ahead of the disk. The next write over that path asks for a read.

## checked

- the change follows the answer: the lane takes no token, and the mark comes off the read reaching the agent
- the cleanup it reveals: none, and the door order stands as it stood
- the mechanism stands in one chapter, and every file touching it points there

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
- The `answer` chapter opens on a second wording of the owner's ruling. A box wrote it ahead of reading the chapter whole. The two agree, and the owner cuts the first at the merge.
