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
    hash_before: ff19c17335d5feda50bd0907a23fe10b6e6da854
    hash_after: c233099a8f8b1b13d6e29e3d815e84d49a7b9e3c
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

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A box out of a fresh clone runs one command and reads every rule, so a cloud
session spends its first minutes on the work.

<!-- breaks, as text: what breaks if it is never done -->
The check probes the server and stops at the probe, so the rules over the tree
stay unread. A cloud box starts no server, so every cloud session meets the
same wall and answers it by hand.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `./RUNME.sh check` reaches the rules on a box running no server, and says what the probe found
- the check answers red where a standing server fails its health call, which a test over a fake door holds
- `./RUNME.sh doctor` keeps naming the server, because that verb is where a reader asks after it

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

The probe says what it meets and leaves the battery running, so a box out of a
fresh clone reads every rule on one command.

| what the probe meets | what the check answers |
|---|---|
| a server answering well | green, and where it stands |
| a server answering ill | red, and the health call it fails |
| no server at all | green, and how to start one |

`serverRead` reads the three apart, and `serverHolds` writes its line and hands
its code up. `serverSays` carries whether a server answers at all, beside what
it says of itself. One answer for both reads a dead wire and a broken server
alike.

`serverSays` takes the fetch as a door, so a case drives each of the three over
a fake. `./RUNME.sh doctor` reads the same probe and names the server still.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change answers each line of the ask, and the Discussion names the one word it leaves
- the probe's two answers standing as one is the cleanup the change reveals, and `serverSays` parts them
- the chapter The check reads the server owns what the change adds, and the code points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The name of this ticket says the check starts the server, and the done_when
list says the check reaches the rules without one. The change follows the list.

- a check starting a server leaves a process behind every run, which nobody asks for here
- the bridgehead starts the server on a cloud box already, and that is where a reader owns it
- `./RUNME.sh serve` and the sidebar button stay the two ways a person starts one
