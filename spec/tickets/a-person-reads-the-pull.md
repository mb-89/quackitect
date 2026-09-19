---
kind: [[ticket]]
state: closed
group: the-person-step-holds
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/trivial]]
process_hash: 568f402efe3adab7
record:
  - step: do
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 790afc889ec01a03be6c24d8955737401001649f
    hash_after: 790afc889ec01a03be6c24d8955737401001649f
    answered:
      - name: tests
        exit: 0
        said: green, 45 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: 87 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

A person reads the pull as the owner meets it in a live session: the take, the hand-back, the refusal and the parked step. The engine checks stand green. What the tests leave out is how the words land on a person. Without this the owner learns the pull by tripping over it, and every trip costs a session. Done is four things:

- the owner runs `./RUNME.sh branch take` on a group with an open child. The message names the step and the files.
- the owner hands a thin leaf back with `./RUNME.sh branch done`. The refusal says what to write, and where.
- the owner reads a parked person step on a ticket and knows what it asks, from the ticket alone
- the owner writes one line under Discussion per trip. The do step takes each into a change, or a ticket of its own.

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test

<!-- the form is command -->

## check

    ./RUNME.sh check

<!-- the form is command -->

## says

A reader meeting the pull now reads why, in the three places the trips named.

| the trip | what stands now |
|---|---|
| the take blamed a race for every rejected push | the refusal names both roads, and points at the lines the push door wrote |
| a parked person step held its question in the frontmatter | the chapter under the step reads the question |
| a command field the shell found nothing for came back as an exit code | the refusal names the shape a command field takes |

The take's push comes back refused on two roads. Another hand pushes first, or a door turns the push away. The old words named the race alone, so a reader cleared the wrong thing.

A step the engine parks carries its question in `asks`. The chapter under it read the line the route writes for every such step, so a reader opening the ticket met no question.

The engine hands each command field to a shell. A line wrapped in a code span sends that shell hunting for a command of that name.

- the shell answers the code saying it found none
- the refusal names the shape a command field takes, bare and indented
- the next line the reader writes runs

<!-- the form is text -->

## checked

- the ask names the words a person meets, and each change lands in one of the places it names
- the change reveals no cleanup beside it, so none rides along
- each fact stands in the code writing it, and this ticket points at the change

<!-- the form is checklist -->

# Discussion

- the take said somebody took the group first, and the push had come back off a door. The change names both roads.
- a parked person step read as the line every such step carries, and its question stood in the frontmatter alone. The change puts the question in the chapter.
- a command field written as a code span came back as an exit code the reader had to look up. The change names the shape a command field takes.
