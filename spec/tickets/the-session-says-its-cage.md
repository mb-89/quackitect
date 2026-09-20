---
kind: [[ticket]]
state: closed
urgent: true
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
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
group: the-bridge-keeps-transport
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 654afc861adf427224bf179c19436ca55b8479a0
    hash_after: 1d1c883e7258a3070597a22de7bc1f307f1a678a
    answered:
      - name: tests
        exit: 0
        said: green, 16 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

A session whose server stayed down reads exactly like one whose server stands.
The bridgehead writes one `warn` line into `.se/log/session.jsonl` and carries
on. Nothing else marks it.

The agent then reads no rules and writes past every door. It says nothing about
either, because an agent outside the cage is the one reader who cannot see it.

The design already names the tell: *the canary is absent from every answer*
means the standing layer reached no session.
[[spec/design_output/level0#a-session-misses-its-install]] An absent line is a
poor alarm:

| what a reader does | what it costs |
|---|---|
| counts canaries every turn | remembering what should stand there |
| reads `.se/log/session.jsonl` | opening a file nobody opens |
| asks why a session ran uncaged | the turn it already cost |

The gain is one sentence where a reader stands. A session losing its cage says
so in its first answer. A person then tells two sessions apart at a glance.

The fault behind this ticket ran a whole session before anybody asked. The one
`warn` line naming it sat in a file no reader opens.

- a box with no modules answers its first prompt with a line naming what is missing
- that line names the code the start road answered, and what a person runs to fix it
- a box whose server stands says the canary as it does today, and no second line
- `node --test "test/level0/*.test.js"` is green
- `./RUNME.sh check` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A session outside the cage says so in the block it reads first, so a reader
tells it from a session holding its rules.

| what the bridgehead does | when |
|---|---|
| holds the code the start road answers | the road stands down at a warning |
| hands one `level0-cage` block to the prompt | the server answers nothing under it |
| drops what it holds | the server answers |

`cageText` builds the block off the code alone, so the table of codes stays the
one place naming what each means. The block carries the code, what that code
means, what the road itself says, and the two commands a person runs.

A code carrying no warning holds nothing. So a desk box, where a person starts
the server, reads the same as it does today.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change answers each line of the ask, and the Discussion names the one road it leaves
- the hook held what the road answered nowhere, and the change gives that one name
- the chapter A session says its cage owns the block, and `cageText` reads the codes off `reasonOf`

# Discussion

The ask says the line lands in the first answer, and the change hands a block
to the first prompt instead. A block is what the bridgehead can hand with no
server standing.

- the block asks the agent for that opening line, which is the nearest a hook reaches
- an agent writing past the block leaves a reader the `warn` line in the log, which stands as it does
- a session whose server starts late reads no block, because the server's answer drops what the road held

The line comes from the bridgehead, because the server is the missing piece.
The bridgehead already reads the code and already holds the sentence.
`reasonOf` in `.claude/skills/level0/hooks/level0.js` maps each code to a level
and a sentence, and today that pair reaches the log alone.

So the change is where the sentence goes. A code leaving the session uncaged
puts its sentence in front of the agent, and in the log as it does today:

| the code | what stands | does the agent hear it |
|---|---|---|
| 3 | a person starts the server here | no, and a person is watching |
| 4 | the method root stands nowhere | yes |
| 5 | the box carries no node | yes |
| 6 | the setup brings no modules | yes |

Two things settle at the build:

- Whether the line rides `session.start` or the first `prompt.context`. The
  canary rides the second, so a reader already sees that one.
- Whether the agent hears a fix or a stop. A box nobody watches fixing its own
  cage is the better answer where one command does it.

This ticket stands whatever `the-cloud-setup-installs` decides. An install
landing at code 6 leaves codes 4 and 5 standing, and a box carrying no node
fixes nothing by itself.
