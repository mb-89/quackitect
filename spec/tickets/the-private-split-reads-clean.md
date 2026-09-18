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
step: answer
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->

[[spec/tickets/the-runtime-files-stand-apart]] splits the private folder into a runtime half, a retro half and the rest. Its verdict returned twice, so the engine inserted a person step, and the ticket closes became this one.

Every fix that verdict named lands on `work/the-warnings-feed-a-refactorer`:

| finding | what stands now |
|---|---|
| the stop hook reads the hold at the old place | it reads the hold and the private tickets out of the module |
| the rule passes a spelling of the old place | it refuses a name the runtime half holds |
| no case holds either hook's session spelling | a case holds each against the hand module |
| every note names a moved file at its old place | every note a reader uses as a map names the new one |

So the question the owner answers is narrow: does the split stand done, or does a third reading find more?

| way | what it costs |
|---|---|
| close it | a reader the rule misses ships, and the next hand meets it |
| read it once more | one hand's pass over a change already green |

Two things the split leaves standing, either way:

- `RETRO` stands named and covered, and nothing writes under it yet
- `.se/tickets/the-verdict-guard-reads-tips.md` holds a finding on the guard refusing a helper beside a committing sibling

<!-- waits, as list: one line each, naming what stands still until the answer lands -->

- the group [[spec/tickets/the-warnings-feed-a-refactorer]] holds this as its last open reading
- a later hand writing under the retro folder waits on the first way

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- the answer says close or read again, and names what a third reading covers
- `./RUNME.sh check` answers 0 on the commit carrying the change

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

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

- [[spec/tickets/the-runtime-files-stand-apart]] hands this over at `implement/person-1`, which waits for a person.
  - verdict failed back 2 times: The four fixes the last verdict named land, and `./RUNME.sh check` answers 0.
  - `./RUNME.sh branch test` answers green, and `./RUNME.sh branch review` answers nothing to fix.
  - The walk covers the private folder, and a word in a private note comes back from a find.
  - The runtime half stands outside the rows, so the box record comes back from no find.
  - `PrivateFolderOwned` refuses an unowned spelling of the new folder, which I fed it and watched refuse.
  - The commit tracks no built binary, and the rule hiding it stands beside the language server's own.
  - `src/bridge/stop.js` reads the hold under the old folder, so `holdStands` answers false on every box.
  - `PrivateFolderOwned` passes a spelling of the old folder, which I fed it and watched pass.
  - No case holds `src/bridge/stop.js` against the hold folder `folders.js` owns.
  - No note under `spec/design_output` names either new folder, so the placement rule stands in code alone.
  - Every design note naming a moved file names its old place.
  - `spec/design_output/private.md` owns the private half, and its table still sends a reader to the old log.
  - `spec/guidance/working.md` sends every agent to the tools file at its old place.
  - `level0.js` and `level1.js` name the owner beside the session path, and no case holds them against `hand.js`.
  - `RETRO` stands exported and tested, and the branch writes under it nowhere.
  - No retro stands in the handover, and the group writes one at its own hand-back.
  - The rest of the branch serves the group's other children, and redesigns nothing this ask holds.
  - The fixes:
  - Take the hold path in `src/bridge/stop.js` from `folders.js`, and cover it with a case.
  - Make `PrivateFolderOwned` refuse a spelling of the old folder, so the next such reader fails.
  - Hold the session spellings in `level0.js` and `level1.js` against `hand.js` in a case.
  - Name the two folders and the placement rule in `spec/design_output/private.md`, and point the other notes there.
  - Point every note naming a moved file at its new place. A grep for the old folder over `spec` names them.
  - Fix `spec/guidance/working.md` first, because every agent reads it at its start.
