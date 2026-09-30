---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-work-tab-reads-v1/gate
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: tui-shell-switches-over
parent: the-work-tab-reads-v1
record:
  - step: do
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: d0137a036e42392649f7edc08977b4e264c332a3
    hash_after: d0137a036e42392649f7edc08977b4e264c332a3
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/tickets passes
      - name: check
        exit: 0
        said: "spec/tickets/work-tab-waits-sends-changes.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 89f92187c4942d0e
        size: 248
    def: b10bf3e839860457
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

depends_on names v1-watch-streams-changes, which stands closed while registry.Watch, Stream and Next are still stubs; the approach waits on v1-watch-sends-changes, so depends_on names that ticket, or the pull hands implement before the watch stands

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/tickets

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The work tab and the log tab waited on the watch ticket that became its successor, so its close freed them before the watch stood. `ticket set` points both at `v1-watch-sends-changes`. The switch ticket waits on the three pieces the same way, which its approach carried in prose alone. The pull now hands each piece's implement only once the ticket before it closes.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and carries the same fix to the log tab and the switch ticket, which met the same wall
- no cleanup stands past it
- each wait stands once, in its ticket's front

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
