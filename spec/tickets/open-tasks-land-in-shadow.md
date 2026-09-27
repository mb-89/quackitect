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
    does: reads the standing children, and mints more where the goal needs them, each naming this group
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
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing", "the chapter carries the run's owner prompts and errors off the transcript, each with its time", "the chapter says the role, and carries no name, address or path of the box"]
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not go well, each error of the run and each owner prompt turning it, with its time
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
step: retro/cloud
process: [[spec/processes/group]]
process_hash: 57b2cccd0445ea9a
depends_on: [the-foundation-lands-unchanged]
enabled_by: migration.phase2shadow
record:
  - step: sync
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: ef191748722031f7e521c65f9fb70c78629bde96
  - step: sync
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: 277c2c5207c7b788ff9aa47aeaeb7dfb8f0e06da
    hash_after: 370d487478c1ceefe54a3aa27dcf7034b3adb3a9
    answered:
      - name: sync
        exit: 0
        said: work/open-tasks-land-in-shadow already carries every commit on main.
  - step: split
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: d3391d99ec71947f9219d32a47819ddd90e1fed9
    hash_after: 7b6be703e04b72c3e7eec5fbba34b7e7e3edd1fd
  - step: children
    hand: the engine
    hash_before: f10a75f63c7a669a2af11294d6d87314a5e427c9
    hash_after: f10a75f63c7a669a2af11294d6d87314a5e427c9
  - step: retro/notes
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: 27839b589dad1a5910262f32c288258ed6e86dfa
    hash_after: a36c608b86cb373a634999aa9161e9ef5bd0f863
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: 5a0e9181b9cc5c4ab38c0dbd5bd543f849e4b9da
    hash_after: 5baba4b4ca8cf8cb580c38f23e17e7f51baba856
  - step: retro/cloud
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: 7c6d51947e13680341751823bb8b0b2b27d6b0e8
    hash_after: 955363ed3992cce95ee8217eb6867186bad2b409
reason: done
---

# Ask

Phase 2 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], in shadow: the pilot. The cloud marker, the tickets topic, the queue, and `work/open-tasks`, computed beside the chain that counts them today. The old path keeps answering, and every mismatch writes a `shadow` row to the session log.

Done when the new path runs in shadow on `main`, and `./RUNME.sh log --kind shadow` names each mismatch for the owner to read.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

    ./RUNME.sh branch sync

# split

<!-- reads the standing children, and mints more where the goal needs them, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/groups-carry-the-cloud-marker]], standard
- [[spec/tickets/the-tickets-topic-lands]], standard
- [[spec/tickets/ask-reading-names-its-differences]], trivial
- [[spec/tickets/close-force-guards-trunk-checkout]], trivial
- [[spec/tickets/go-test-names-the-root]], trivial
- [[spec/tickets/open-marker-outlives-refused-push]], trivial
- [[spec/tickets/open-marks-standing-branches]], trivial
- [[spec/tickets/private-tickets-reach-tickets-all]], trivial
- [[spec/tickets/the-golden-keys-group-hash]], trivial
- [[spec/tickets/tickets-register-in-the-catalog]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- Each child stands closed, and each trivial child reads whole in one diff.
- The children carry the cloud marker and the tickets topic. The queue port and `work/open-tasks` left the group at `branch done`, and a next group carries them: [[spec/tickets/the-queue-moves-to-plan]], [[spec/tickets/open-tasks-come-from-work]], [[spec/tickets/open-tasks-run-in-shadow]].
- No child here waits on another, so none names `depends_on`.

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

- [[spec/tickets/close-force-guards-trunk-checkout]]: a test for the dirty-tree refusal of `close`
- [[spec/tickets/open-marker-outlives-refused-push]]: closes on the code standing, under its test
- [[spec/tickets/open-marks-standing-branches]]: closes on the code standing, under its test
- [[spec/tickets/rationale-drops-release-row]]: the row leaves the rationale, and the step stays at do
- [[spec/tickets/queue-approach-sentence-split]]: a question for the owner
- [[spec/tickets/holds-leave-with-their-ticket]]: the successor of the stale-hold note

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- Two trivial asks close on a read of the code, because the parent's build already carries the change.
- The commit verb runs the check on each commit, so every push lands green.

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->

<!-- the form is list -->

- 03:33 UTC: a clear by level zero opens the run, and the first Bash call names no ticket.
- 03:37 UTC: a hand-back refuses two command fields written in backticks.
- 03:38 UTC and 03:52 UTC: a commit piped into `tail`, then a pull, meets `LandingFollowsItsGate`.
- 03:46 UTC: the pass of `rationale-drops-release-row` refuses on a warning under another ticket's approach.
- 03:47 UTC: the door refuses the split of that sentence, because the approach is the engine's.
- 03:49 UTC to 04:01 UTC: the queue hands the same step back after a fail, and the stop claim falls three times.
- 03:59 UTC: a group field on a question ticket reddens the check through `GroupAsksNobody`.
- 04:01 UTC: the stop hook turns the turn toward `branch done`.
- Through the run: a working todo in the plan blocks the pull, and each pull names two closed tickets as in hand.

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- The pass gate: a `tests` field on a change touching no code reads the lint over the files the step changes.
- [[spec/tickets/holds-leave-with-their-ticket]]: a hold leaves when its ticket closes.
- The plan: naming a ticket as working adds no todo that blocks the pull.
- [[spec/tickets/queue-approach-sentence-split]]: the owner splits the sentence, and the review goes on.

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The agent weighs a `--became` hand-back for the stuck step, and refuses it, because the change stands done and `became` names work moving elsewhere. It reads the stop reasons as unclaimable from a cloud box with a sibling blocked, and the hook's pointer at `branch done` resolves that.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- Each fact points at the ticket owning it.
- The chapter adds no number past the times of the run.
- The chapter writes no header.
- The run carries no owner prompt, and every error stands with its time in UTC.
- The chapter names the agent and the owner by role, and no path of the box.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- none: every tool and host this run needs answers on the box

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the hook `LandingFollowsItsGate`, twice, on a commit piped before a pull
- the ticket door, on a split under another ticket's approach
- the stop hook, which turns the turn toward `branch done`

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- [[spec/tickets/queue-approach-sentence-split]], a person step with no group
- [[spec/tickets/holds-leave-with-their-ticket]], minted with no group
- the queue port and the open-tasks children, out of the group at `branch done`
- the handover names the blocked step and the question

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
