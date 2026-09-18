---
kind: [[ticket]]
state: closed
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
    hash_before: 215052ad47efea9a8c1e94671b3be778fb0cc2c6
    hash_after: 215052ad47efea9a8c1e94671b3be778fb0cc2c6
  - step: do
    hand: box dd2a59294365 · claude-code-remote
    hash_before: d54b092f6b9932a5e12a0ce438d78050421bbe18
    hash_after: d54b092f6b9932a5e12a0ce438d78050421bbe18
    answered:
      - name: tests
        exit: 0
        said: green, the check passes where the change touches no code
      - name: check
        exit: 0
        said: 82 stand at warning, which the panel draws and check allows.
reason: done
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

The split stands done. Close it, and run no third reading.

| what a third reading would add | what already holds it |
|---|---|
| a reader the move leaves behind | `PrivateFolderOwned`, which refuses a spelling naming no owner |
| a writer landing at the wrong place | a case a writer, in `test/level0/folders.test.js` |
| a note sending a reader to an old place | a grep over the moved names, which answers nothing |
| the walk covering the wrong half | two Go cases, over a tree each one writes |

Two readings already ran, and the second found every fault the first left. A third reads the same green tree, and the rule is what catches the next drift. A wrong answer here costs one reading, which the next hand runs on the merge.

The `do` step closes this ticket and carries the two lines the split leaves standing:

- `RETRO` stands named and covered, and the retro verb writes under it later
- the guard finding stands on [[spec/tickets/the-verdict-guard-reads-tips]], which this group now carries

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh check >/dev/null 2>&1 && echo "green, the check passes where the change touches no code"

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

This ticket touches no code. It carries one decision: the private folder split stands done, and no third reading runs.

| what a reader asks | where the answer stands |
|---|---|
| does a reader the move left behind still ship | `PrivateFolderOwned` refuses one, and a case drives it |
| does every writer land in the right half | one case a writer, in `test/level0/folders.test.js` |
| does the walk cover the private folder | two Go cases, over a tree each one writes |

The two lines the split leaves standing each have a home. `RETRO` waits on the retro verb, which a later ticket carries. The guard finding stands on [[spec/tickets/the-verdict-guard-reads-tips]], which this group now holds.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the answer: the answer says close, and this closes with no code change
- the cleanup the change reveals is in the change: it reveals none, and the guard stands on its own ticket
- every fact stands in one place: the split's own facts stand in the design note, and this points at it

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
