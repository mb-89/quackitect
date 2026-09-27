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
process_hash: 94d924fb96257431
step: retro/cloud
record:
  - step: sync
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: 984bd196b6e8ea30cdee2af4676fe82dce58e10b
    hash_after: b2d198f39e9c8debfc3e979eadd109f18d1017e5
  - step: sync
    hand: box dd9134526ba5 · claude-code-remote
    hash_before: 0e5425ad203956c241f9ad358efc34fc59ea8097
    hash_after: f2efe23b2a9439631e7d8f8b9a42de854d8876f6
  - step: sync
    hand: box f8b3c4661e5b · claude-code-remote
    hash_before: 7ecfdd9766ef7306c46b0c99286c8f1280de74b5
    hash_after: 969eff64860b316b6c0fa423eb7f717f85abb7f0
  - step: sync
    hand: box d7a55188b9103 · claude-code-remote
    hash_before: a88b0a9551a06759dc89c070a1c2ea5c897824d8
    hash_after: 2cfe3552e8a501f9e4f14dc5b91cb10372c504e2
  - step: sync
    hand: box d7a71af6d6103 · claude-code-remote
    hash_before: 13f72df9735ebc35d2f19d25cd8b4da3cc22f9dd
    hash_after: b881bdd5b897f8276f495833a3e95931fefd4b43
  - step: sync
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: 505e8c4d28fb204a1aaad18e9a179c1faaaf686a
    hash_after: 98463a7678ea85c2a1f595501f029c358b826fca
  - step: sync
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: c45ed6fe8a260bd5075f4ddd0238eb8e17ee01dc
    hash_after: c45ed6fe8a260bd5075f4ddd0238eb8e17ee01dc
    answered:
      - name: sync
        exit: 0
        said: work/the-verbs-land-whole already carries every commit on main.
  - step: split
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: 8b2b3e54c5e55e46a8737a7beaf96efb3ec7928e
    hash_after: 8b2b3e54c5e55e46a8737a7beaf96efb3ec7928e
  - step: children
    hand: the engine
    hash_before: 47b5ae1314ffc67dacb65323b4075dfc23d30f29
    hash_after: 47b5ae1314ffc67dacb65323b4075dfc23d30f29
  - step: retro/notes
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: e6bac52b2d3497340e4da48c6a404e5de6ce4b9d
    hash_after: e6bac52b2d3497340e4da48c6a404e5de6ce4b9d
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: 96685d9cfacca7ad6c10e223c4bd557da37cbf35
    hash_after: 96685d9cfacca7ad6c10e223c4bd557da37cbf35
  - step: retro/cloud
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: 4883921f5473381a0df7f6efdd07115e70b7382b
    hash_after: 4883921f5473381a0df7f6efdd07115e70b7382b
reason: done
---

# Ask

Every mechanical step runs through a verb that lands it whole, and the agent reaches git through the engine alone. The doors read what a command does, prose lands on the first try, and the battery proves each case on a fixture.

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

- [[spec/tickets/a-nested-git-still-lands]] trivial
- [[spec/tickets/a-reorder-asks-a-test]] trivial
- [[spec/tickets/battery-ask-names-the-bundle]] trivial
- [[spec/tickets/doors-read-what-commands-do]] standard
- [[spec/tickets/every-landing-takes-a-verb]] standard
- [[spec/tickets/git-write-tests-outside-ask]] trivial
- [[spec/tickets/git-writes-lacking-a-verb]] trivial
- [[spec/tickets/journal-the-rename-verb]] trivial
- [[spec/tickets/judge-cases-turn-it-on]] trivial
- [[spec/tickets/judge-quote-proves-its-call]] trivial
- [[spec/tickets/merge-deletes-after-the-push]] trivial
- [[spec/tickets/one-row-for-git-mv]] trivial
- [[spec/tickets/only-a-read-gates-nothing]] trivial
- [[spec/tickets/prose-verbs-land-first-try]] standard
- [[spec/tickets/pull-env-meets-the-engine]] trivial
- [[spec/tickets/red-verb-meets-new-sources]] trivial
- [[spec/tickets/rename-detection-misses-rewrites]] trivial
- [[spec/tickets/the-battery-runs-on-fixtures]] standard
- [[spec/tickets/the-scratchpad-reads-absolute]] trivial
- [[spec/tickets/the-verbs-need-no-wrapper]] standard
- [[spec/tickets/verb-line-names-new-refusals]] trivial
- [[spec/tickets/wrapper-ask-names-its-files]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- Each child is a trivial fix or one standard change, small enough to review whole.
- The five standard children carry the goal: the verbs, the doors, the prose, the battery and the wrapper. The trivial ones close their review findings.
- Every child stands closed, so none waits on another.

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

- battery-ask-names-the-bundle: passed its standing do leaf.
- the-battery-runs-on-fixtures: four slow cases run on fixtures, and `bundle` takes an entry and out.
- the-verbs-need-no-wrapper: reviewed, then built. The verbs name their red cases, and the tools block names the verbs.
- wrapper-ask-names-its-files: the wrapper ask names the three files its approach changes.
- verb-line-names-new-refusals: the `verbLine` case holds the git-write clause.
- The ticket and merge cases split by topic, under the file ceiling.
- A TODO case reads as no red case in the battery and the test verb.

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- The pull handed each leaf with its checklist, so no step waited on a guess.
- `check --errors` found the TODO case on its first real run, which proves the verb earns its place.
- The split verb moved the cases whole, so no case went missing.

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- The first shell call named no ticket, and the door refused it.
- The vehicle identity case failed on some runs. Two ids made in one millisecond with one pid match.
- The review's hand-back with `--pass` came back refused, because the verdict field decides.
- The child's pass came back refused while its parent stood in hand.
- The wrapper approach put `errorsSaid` in `cli.js`, which exits at import, so no case reaches it.
- `check --errors` named a TODO case as red, because the reporter's row carried no mark.
- The door refused a git write set beside a test run, and a pull chained after a pipe.
- The commit hook refused `cli.js` and `cli-check.js` with no test beside them.
- The push waited on two file ceilings, which the new cases pushed over.

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- The session's first hook block names the ticket rule beside the shell tool.
- `test/contract/vehicle.test.js` makes the source's identity under another pid.
- The review leaf's prompt says a verdict field hands back with no flag.
- `spec/processes/group.yaml` lets a review's child pass while its parent stands in hand.
- The design review checklist asks whether each new function stands where a case imports it.
- `src/scripts/battery-reporter.js` marks a TODO case, and `redIn` passes over it.
- The shell door's refusal names a read-only road, as `git diff` against `HEAD`.
- The implement checklist asks for a case beside each source file the change touches.
- The draft's size list names each test file near the ceiling, with its split.

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The tests-red leaf asks each test to fail on its assertion, and a pure test refactor passes at once. The bundle case alone carried the red for the battery ticket. The wrapper review weighed failing on the `cli.js` placement, and passed because the builder fixes it in place.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- Each line points at the file owning its fix, and repeats no rule.
- The retro adds no number.
- The retro writes no file header, and the new test files' heads say what each file proves.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- Nothing: the take installed the index, the language server and the client, and no host came back refused.

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- The sync met no conflict, because the take had taken main in already.
- The shell hook refused a call naming no ticket, a git write, and a pull chained after a pipe.
- The commit hook refused two source files with no test beside them.
- The push refused the branch while two file ceilings stood at warning.
- The vehicle identity case failed on some runs, on any box that makes two ids in one millisecond.

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- No person step stands parked, and no ticket stands minted outside this group.
- The handover says every child stands closed and the branch waits on the owner's merge. It stands in the private folder, which this box takes with it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

Where the branch stands, for the next box:

| child | where it stands |
|---|---|
| [[spec/tickets/the-battery-runs-on-fixtures]] | the review verdict stands written. A fresh take hands it back as it stands |
| [[spec/tickets/the-verbs-need-no-wrapper]] | waits at its design review |
| [[spec/tickets/verb-line-names-new-refusals]] | a trivial draft, waiting at do |
| every other child | closed |

Three faults the sync met, each fixed on this branch:

- The cold probe's session met a refused `git log`, then pulled a ticket and ran to the cap. Its prompt now ends the session at a refused call.
- The commit verb's refusal ran a bare `git reset -q`, which cleared `MERGE_HEAD`. It now resets the paths it staged, so a refused merge stays a merge.
- The check writes a slash command for each new config key. The commit door takes only the ticket in hand. That commit then names a review ticket, and the verdict guard reads it as the reviewer's work. A generated file lands with the change that adds its key, before the next take.
