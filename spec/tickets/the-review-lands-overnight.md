---
kind: [[ticket]]
state: closed
steps:
  - name: sync
    does: takes trunk into the branch, so the box works on the latest
    when: cloud
    by: agent
    needs: ["branch sync"]
    evidence:
      - name: sync
        form: command
        expects: 0
        says: branch sync, so the branch carries trunk
  - name: split
    does: mints the children, or assigns standing tickets, each naming this group
    from: anyone
    by: anyone
    input: ask
    reads: [[spec/guidance/working]]
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on"]
    evidence:
      - name: children
        form: list
        says: every child as a link, one a line, with its process
  - name: children
    by: children
    on_fail: split
  - name: retro
    reads: [[spec/guidance/working]]
    to: retro
    steps:
      - name: notes
        does: decides every private note on the box, and works what it mints into this group
        needs: ["retro"]
        evidence:
          - name: drained
            form: command
            expects: 0
            says: retro notes, which passes when the private folder is empty
      - name: write
        does: writes the retro over the box's own window
        input: ["children", "notes"]
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing"]
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not, each with its moment in the log or the transcript
          - name: improve
            form: list
            says: how each bad line stops happening, named by its home
          - name: thoughts
            form: text
            says: what the thoughts say that the actions do not, off the transcript
      - name: cloud
        does: names what the box lacked, met and leaves for a person
        when: cloud
        input: write
        evidence:
          - name: lacked
            form: list
            says: a tool, a host the proxy refused, a right the platform refused, an install, each with its moment
          - name: met
            form: list
            says: the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone
          - name: left
            form: list
            says: every person step parked, every ticket minted with no group, and what the handover says
process: [[spec/processes/group]]
process_hash: 3c35c048932fd579
step: retro/cloud
record:
  - step: sync
    hand: box dcd73916add7 · claude-code-remote
    hash_before: ad8bc2d01456fc08d074ff89d2f143a27072b53e
    hash_after: 133c8d3ae4d293823bc6add5bc9bef1f3fe2682f
  - step: sync
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 4202ecb12b70abfb5d6d5913a0140555e4c3ef2c
    hash_after: 4202ecb12b70abfb5d6d5913a0140555e4c3ef2c
    answered:
      - name: sync
        exit: 0
        said: work/the-review-lands-overnight already carries every commit on main.
  - step: split
    hand: box dcd73916add7 · claude-code-remote
    hash_before: f8428866ac2040495370aa7363cd567a3bc350dc
    hash_after: f8428866ac2040495370aa7363cd567a3bc350dc
  - step: children
    hand: the engine
    hash_before: 4a1a76215ac89420333fea02d937e250947a6ef9
    hash_after: 4a1a76215ac89420333fea02d937e250947a6ef9
  - step: retro/notes
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 6114a3e3bfc5bcf9ece36c1f545aedbc22789f57
    hash_after: 6114a3e3bfc5bcf9ece36c1f545aedbc22789f57
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box dcd73916add7 · claude-code-remote
    hash_before: e22e739ef57cc1cbf77ed43047ee5e5f53eba467
    hash_after: e22e739ef57cc1cbf77ed43047ee5e5f53eba467
  - step: retro/cloud
    hand: box dcd73916add7 · claude-code-remote
    hash_before: cdcef4dd535ae6258a6d2ee19d71370542bfd086
    hash_after: cdcef4dd535ae6258a6d2ee19d71370542bfd086
reason: done
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
The review this tree ran lands whole. A hand-back reads its prose the way the
lint reads it, so no hand-back leaves a warning on trunk. A write to a field the
engine owns lands with that field put back, and names it. A change adding
comments alone asks for no test, and the config section in the sidebar opens
and shuts every group at once. So a hand meets one reader, one rule over the
fields, and no refusal a person has to clear by hand.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

    ./RUNME.sh branch sync

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/a-claim-reads-its-source]], on the standard route
- [[spec/tickets/a-comment-hunk-is-prose]], on the standard route
- [[spec/tickets/a-count-meets-the-lint]], on the standard route
- [[spec/tickets/a-landing-follows-its-gate]], on the standard route
- [[spec/tickets/each-check-reads-its-signal]], on the standard route
- [[spec/tickets/each-helper-lands-one-commit]], on the standard route
- [[spec/tickets/one-reader-judges-a-verdict]], on the standard route
- [[spec/tickets/the-binding-reads-the-session]], on the standard route
- [[spec/tickets/the-config-folds-at-once]], on the trivial route
- [[spec/tickets/the-door-keeps-its-marks]], on the standard route
- [[spec/tickets/the-door-refuses-a-revert]], on the standard route
- [[spec/tickets/the-engine-restores-its-fields]], on the trivial route
- [[spec/tickets/the-owner-hears-first]], on the standard route
- [[spec/tickets/the-pull-pushes-its-close]], on the standard route
- [[spec/tickets/the-verbs-reach-the-question]], on the standard route
- [[spec/tickets/the-verbs-read-prose-whole]], on the standard route

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each child took one design review and one verdict over its own diff
- the children cover the one reader, the fields the engine owns, the comment hunk and the sidebar's folds
- the children depend on none of the others, so none names a `depends_on`

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->

<!-- the form is command -->

    ./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->

<!-- the form is list -->

- `one-reader-judges-a-verdict`: the pull and the lint read a hand-back one way
- `a-comment-hunk-is-prose`: the commit door reads each hunk both ways
- `a-claim-reads-its-source`: a place digit reads the queue, and the draft leaf asks for callers
- `a-count-meets-the-lint`: `CountedList` and `CodeHeader` hold counts off notes and headers
- `a-landing-follows-its-gate`: a landing after a `;` refuses, and the commit verb tests first
- `each-check-reads-its-signal`: the test door, the shell door, the battery and the fakes read what they claim
- `each-helper-lands-one-commit`: a held file takes one hand, and main takes the commit verb
- `the-binding-reads-the-session`: a refusal names the binding, and a helper's wait ends the turn
- `the-config-folds-at-once`: the config section opens and shuts every group in one press
- `the-door-keeps-its-marks`: the marks survive a restart and learn line spans
- `the-door-refuses-a-revert`: a `git revert` over a pull commit names the take-back verb
- `the-engine-restores-its-fields`: a write to an engine field lands with the field put back
- `the-owner-hears-first`: the first call after a prompt meets the gate
- `the-pull-pushes-its-close`: a hand-back on trunk runs one check and lands pushed
- `the-verbs-reach-the-question`: the test, log, lint, wait and find verbs answer the shell habits
- `the-verbs-read-prose-whole`: the open, the note and the retro read their prose through `voiceOver`

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the design review caught a real fault in most drafts, each before a line of code
- an implementing hand per ticket kept the box's own context small across the whole group
- the commit door's test rule caught a module with no staged test on several change leaves
- each verdict read the diff against the approach, and none came back red

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- drafts went to review with claims unchecked against the code: `a-comment-hunk-is-prose` failed review three times
- reviewers fixed a refused line by its number and rewrote the wrong line, on `a-landing-follows-its-gate`
- the tests-red commit lands the tests, so the change leaf meets the commit door with no staged test
- `./RUNME.sh fix --help` ignores the flag and rewrites the whole tree, met on `the-verbs-reach-the-question`
- files near the ceiling pushed each change into a new module: `stop.js`, `server.js`, `pull.js` and `lib/bash.js`

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- the draft leaf's `callers` and `answers` fields, now in `spec/processes/standard.yaml`, ask a draft to read its callers
- the spawn prompt in `pull-spawn.js` names a text replace over a line number for a refused line
- the carried tests of `each-check-reads-its-signal` count a test the tests-red leaf lands
- a note under `.se/tickets` for the fix verb to refuse an unknown flag, off the next box
- a split ticket for the files near the ceiling, named in the next group's ask

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The group ran as one loop: pull, draft or spawn, hand back. The loop carried
the work because each refusal named its fix, and a hand read it and moved.
The reviews earned their rounds, where a draft claimed a road the code lacks.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each fact the change adds stands in the design chapter its ticket names, and the code points there
- the new numbers carry names in `spec/config/level0.json` and the module blocks
- each new header says what its file is for, and `CodeHeader` refuses a count there

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- no tool, host or right fell short: the install, git and the proxy answered through the run

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the commit door's test rule, on the change leaves of several tickets
- the file ceiling, on the stop door, the server, the pull, the Bash rules and the pull's cases
- no conflict at sync, because the branch carried every commit on main

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- no person step stands parked, and every child closes done
- no ticket stands minted outside a group
- the fix verb's unread flag and the files near the ceiling stand as findings in the retro above

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
