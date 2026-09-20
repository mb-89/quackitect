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
urgent: true
process: [[spec/processes/group]]
process_hash: 3c35c048932fd579
step: retro/cloud
record:
  - step: sync
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 5b35bd6821d54beabfee1f62d06d7949f6a976de
  - step: sync
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 1abe6b4c1c842ba1a0f679d1dee3dd5bb09274ab
    hash_after: 0576ad002bcc6af00c745358298f9315814ba6e4
    answered:
      - name: sync
        exit: 0
        said: work/the-rules-hold-themselves already carries every commit on main.
  - step: split
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: c3ba8d9eeae47807912fa6261236885b40c1c659
    hash_after: 7829ca90d33aa8c189e9817722b9d4d894588373
  - step: children
    hand: the engine
    hash_before: d25d7ba765f7c7d60bdec235141438879eea96ef
    hash_after: d25d7ba765f7c7d60bdec235141438879eea96ef
  - step: retro/notes
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: f2d490bfab1dec16f43734536a93f476b2a601b8
    hash_after: 3d7f59d54d61074f5e01a220128c3682dce1b5cd
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: abbe6e5427ee71d000090e552e2c3ef961a225ec
    hash_after: abbe6e5427ee71d000090e552e2c3ef961a225ec
  - step: retro/cloud
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: d0c6b0fbafc5b0fd1cc8cde552f5fe430d6cb30c
    hash_after: d0c6b0fbafc5b0fd1cc8cde552f5fe430d6cb30c
reason: done
---

# Ask

Every rule this tree writes gets a program that holds it.

The retro found rules standing in the guidance while the record breaks them
again and again. The write door passes a script's write. The door rule reads no
environment.

The test-first rule carries no check. A fact stands twice, and the note rules
break across the guidance itself. Each ticket here builds the check, so no rule
rests on a reader's memory.

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

- [[spec/tickets/the-question-process-gets-tests]], trivial, which holds the successor road open
- [[spec/tickets/the-rule-shares-one-slug]], question, which gives the slug one owner
- [[spec/tickets/voice-rules-skip-the-record]], trivial, which guards the fields the engine writes
- [[spec/tickets/group-key-takes-one-spelling]], trivial, which refuses a group named as a branch
- [[spec/tickets/runtime-half-takes-the-rest]], trivial, which stands the register under the runtime half
- [[spec/tickets/a-project-adds-vale-rules]], standard, which assembles the styles of both roots
- [[spec/tickets/a-check-finds-every-writer]], standard, which binds the escape to its line
- [[spec/tickets/a-check-finds-restated-facts]], standard, which finds one fact written twice
- [[spec/tickets/a-lint-holds-note-rules]], standard, which reads a marked rule against its rationale
- [[spec/tickets/the-check-holds-test-first]], standard, which refuses a change standing with no test
- [[spec/tickets/the-door-reads-script-writes]], standard, which reads the script a command runs
- [[spec/tickets/the-door-rule-reads-env]], standard, which holds the outside inside a door

## checked

<!-- one line per item of the checklist, on how you take it into account -->

- every child is small enough to review whole, or is a group itself: each carries one rule and its check
- the children add up to the goal, and nothing stands outside them: the file calls ride a minted ask
- a child that waits on another names it under depends_on: none waits, because each holds its own rule

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

- `the-question-process-gets-tests`: a contract case holds the successor road open
- `the-rule-shares-one-slug`: one module owns the slug, and a source holds its cases
- `voice-rules-skip-the-record`: a case guards the fields the engine writes
- `group-key-takes-one-spelling`: the ticket door refuses a group named as a branch
- `runtime-half-takes-the-rest`: the register stands under the runtime half
- `a-project-adds-vale-rules`: the styles of both roots assemble, and the door reads them
- `a-check-finds-every-writer`: the escape binds to its line, and the installer meets its lists
- `a-check-finds-restated-facts`: three rules find one fact written twice, in one pass
- `a-lint-holds-note-rules`: the check reads a marked rule against the rationale it links
- `the-check-holds-test-first`: both commit doors refuse a change standing with no test
- `the-door-reads-script-writes`: the shell door reads the script a command runs
- `the-door-rule-reads-env`: a rule holds the environment and the platform inside a door
- six private notes decide, and five become tickets standing in the tree

### well

<!-- what went well, and what made it go well -->

- every rule this branch writes carries a case, so a later hand meets the rule
- the one-hand-a-step rule caught four designs the first draft got wrong
- the restated pass drops from minutes to about a second, because the tree holds it
- the write door named the fault and the line each time, so a fix took one round
- the engine's own doors refused three commits of mine, and each refusal was right

### badly

<!-- what did not, each with its moment in the log or the transcript -->

- four hands spawned at once took the same leaf, and three dropped their hold
- a write landed on a whole test file, and the text of a standing case went
- a reviewer hand ran a checkout and wiped an uncommitted fix, twice
- `the-door-rule-reads-env` failed design review seven times, each on a real finding
- a minted ticket's name held six words, and two contract cases came back red on it
- I read the retro's note step as a gap, and the `todo` tag was the road

### improve

<!-- how each bad line stops happening, named by its home -->

- spawn one hand at a time, because the queue binds one session to one ticket
- read a file before a write lands on it, and reach for the patch road
- tell each spawned hand to run no git command changing the working tree
- read the whole approach against the tree before the hand-back, the way a review does
- `./RUNME.sh mint` takes the name cap, so a long name stops at the mint
- read the verbs for a road before calling a step impossible

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

The branch's own rules refused my work more often than any reviewer. That reads
as the point of it: a rule a program holds costs the writer the same as it costs
every later hand.

The design rounds cost the most, and each finding was one the tree could answer
for itself. A hand reading `.vale.ini` and the tree before drafting would have
found the sections the draft missed. The one thing I misread was a step, calling
a gap what the verbs already carry.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

- every fact the change adds stands in one place: each note points at the file holding it
- every number carries a name in one place: no count stands in prose here
- every header says what its file is for: each new file opens on such a header

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

- the harness refused a python write into the tree, at the rename of a shared reader
- nothing else: every tool the branch wanted stood on the box

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

- the shell door refuses a write into a tracked file, so every write took a tool
- the test-first door refused three commits, each until a case stood beside the change
- the write door refused a line at a time on the voice rules, most on the sentence cap
- the file ceiling sent one module's growth into a file of its own
- the plugin died each time a lib module changed, and `./RUNME.sh serve` brought it back
- the branch took no conflict at sync, because trunk stood still under it

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

- no person step stands parked, because every question this branch met got an answer here
- [[spec/tickets/a-rule-names-its-failure]], minted off the guidance work
- [[spec/tickets/a-door-holds-file-calls]], minted off the Go door work
- [[spec/tickets/a-door-holds-three-reads]], off the note on the reads outside the rule
- [[spec/tickets/a-pointer-reaches-a-heading]], off the note on a rename
- [[spec/tickets/a-lone-mark-pairs-wrong]], off the note on the script rules
- [[spec/tickets/every-road-reads-one-config]], off the note on the config roads
- [[spec/tickets/one-door-joins-a-path]], off the note on the path join
- `HANDOVER.md` names each ticket, the queue's one-hand rule, and what this box leaves

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

Every note on this box carries its outcome and what the successor takes. Five
become tickets in the tree, and one drops because a wider note holds it:

| the note | what it becomes |
|---|---|
| `a-door-holds-the-pid` | dropped, because `a-door-holds-three-reads` names the pid |
| `a-door-holds-three-reads` | [[spec/tickets/a-door-holds-three-reads]] |
| `a-rename-breaks-its-pointers` | [[spec/tickets/a-pointer-reaches-a-heading]] |
| `an-odd-mark-breaks-pairing` | [[spec/tickets/a-lone-mark-pairs-wrong]] |
| `every-road-reads-one-config` | [[spec/tickets/every-road-reads-one-config]] |
| `path-join-stands-twice` | [[spec/tickets/one-door-joins-a-path]] |

A note closes through the pull, and on a work branch this group's leaves outrank
every note. `./RUNME.sh ticket todo <note>` hands one first, so each note above
comes into a hand and closes there.
