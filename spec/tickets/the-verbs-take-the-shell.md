---
kind: [[ticket]]
state: open
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
step: retro/write
record:
  - step: sync
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: ac43596cf61de7866ab65798c2fd14233ad653b1
    hash_after: 0ccc4ebbbc077029fc7b29322a69cf6637c06319
  - step: sync
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: e2e31c933cd4f59e7fc75f72928e624a86017c3c
  - step: sync
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 45e1297b9fbf04a0f207f99cc5bd6bcc2ae28ebb
    hash_after: 45e1297b9fbf04a0f207f99cc5bd6bcc2ae28ebb
    answered:
      - name: sync
        exit: 0
        said: work/the-verbs-take-the-shell already carries every commit on main.
  - step: split
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 8e88395e94168f09e5ed78aa602dd101a3d71cf5
    hash_after: 8e88395e94168f09e5ed78aa602dd101a3d71cf5
  - step: children
    hand: the engine
    hash_before: 69bc52d4760e080c10d6aa3676b669fcdcd917fd
    hash_after: 69bc52d4760e080c10d6aa3676b669fcdcd917fd
  - step: retro/notes
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: c383c36b5f8aa8b6bd68ebdeed89f7fcc9279af3
    hash_after: c383c36b5f8aa8b6bd68ebdeed89f7fcc9279af3
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
---

# Ask

A hand stops spelling out in the shell what a verb answers. The retro counted
hundreds of shell reads in one window. A commit message meets the voice rules
one round at a time. One-off scripts split a file and read the log. A check
chained to a push meets a stale stamp. Each ticket here lands one verb, so the
work runs through the engine.

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

- [[spec/tickets/a-log-verb-reads-sessions]], standard
- [[spec/tickets/a-return-asks-another-hand]], standard
- [[spec/tickets/a-split-verb-cuts-files]], standard
- [[spec/tickets/check-prose-reads-a-draft]], standard
- [[spec/tickets/release-keeps-local-commits]], standard
- [[spec/tickets/the-brief-verbs-go]], standard
- [[spec/tickets/the-commit-verb-lints-messages]], standard
- [[spec/tickets/the-pull-names-the-unblock]], standard
- [[spec/tickets/the-read-tools-answer-first]], standard
- [[spec/tickets/the-spawn-answers-a-helper]], standard
- [[spec/tickets/the-take-skips-an-orphan]], standard
- [[spec/tickets/the-unblock-keeps-its-shape]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child lands one verb or one door, which a reviewer reads whole in one pass
- the ask names a hand spelling out in the shell, and each child takes one of those
- no child waits on another, so none names a `depends_on`

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

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

A cloud box worked this branch and hands it back. The handover stands here, and no tracked `HANDOVER.md` lands. A brief on a group branch makes the listing read it as a brief branch, and `standingAll` then masks the group's own standing.

| the child | where it stands |
|---|---|
| [[spec/tickets/the-unblock-keeps-its-shape]] | closed done |
| [[spec/tickets/the-spawn-answers-a-helper]] | closed done |
| [[spec/tickets/the-take-skips-an-orphan]] | closed done |
| [[spec/tickets/release-keeps-local-commits]] | closed done |
| [[spec/tickets/a-return-asks-another-hand]] | closed became, on the successor below |
| [[spec/tickets/the-pull-names-the-unblock]] | closed became, its row landed, its route parked |
| [[spec/tickets/the-brief-verbs-go]] | open at `implement/tests-red`, its approach reviewed and passed |
| the five others | open at `design/review`, each with its approach written |

The next box takes `the-brief-verbs-go` first, because a parked leaf scores ahead of the rest. Its approach names every reader, note and case, and the change spans the code, the cases, the Go cases and the notes.

The five at `design/review` each want one spawned hand. The pull reaches them once the ticket above moves.

What this box met:

- the write door refuses a shell write, so every field rides `ticket pull --fields`
- a field of form `files` trips `Sentence` as bare lines, and takes markdown list items
- the ticket door refuses a hand's fix to a field it passes, and `ticket pull --back` is the road
- `./RUNME.sh check` wants the server, which `./RUNME.sh serve` starts

What this box leaves for a person:

- [[spec/tickets/a-route-closes-answered-asks]] stands minted and open, naming no group
- the refs sharing no ancestor with trunk stay standing, because the take passes over them
- a private note under the box names a take-back sweeping a sibling's work into one commit

The read tools stood absent until the server came up, which [[spec/tickets/the-read-tools-answer-first]] names. So the early reads ran through the shell, which is the fault this group opens on.

A second box hands it on. Ten of the twelve children close, and two stand open:

| the child | where it stands | what it wants |
|---|---|---|
| [[spec/tickets/the-commit-verb-lints-messages]] | `implement/tests-red` | its approach passes, so the cases come next |
| [[spec/tickets/the-read-tools-answer-first]] | `design/review` | a hand other than this box reads the approach |

What this box learns, for the hand after it:

- a `verdict` and a `design/review` each want a hand of their own, which the pull's spawn answer names
- a helper reads its findings against the tree, and every round of that catches a real fault
- a fake agreeing with the code hides what a contract case catches, so drive the real thing
- a refused payload reaches no disk, so a field breaking a rule leaves the old text standing
- `./RUNME.sh ticket pull --drop` frees a hand, and `--back <leaf>` then moves a ticket to a leaf it answers
- `./RUNME.sh check` wants the server, which `./RUNME.sh serve` starts, and a long run outlives it

Two private notes stand under the box for the retro: one on a take-back, and one on the split verb's source reading.
