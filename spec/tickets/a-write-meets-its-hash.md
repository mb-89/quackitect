---
kind: [[ticket]]
state: open
urgency: now
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
group: the-warnings-feed-a-refactorer
step: design/review
record:
  - step: design/draft
    hand: box a5e189c39e1d · claude-code-remote
    hash_before: fbf290dec7c5a1237d581ad2f9425659877475b7
    hash_after: fbf290dec7c5a1237d581ad2f9425659877475b7
  - step: design/review
    hand: box a5e189c39e1d · claude-code-remote · helper-2
    hash_before: 8e69a0d6b0cf5a9e2d1a753357dd32e722cf20b8
    hash_after: 8e69a0d6b0cf5a9e2d1a753357dd32e722cf20b8
    returns: 1
    why: The stamp table one box shares reads the same for every hand, so a stale write still lands.; the shared table holds one stamp a path, so one hand writing refreshes the stamp the other hand reads; the second hand then agrees with the disk and lands its stale write, which is the loss the ask names; key the stamp by hand and by path, and name the token a hand carries. The bridge reads `e.agentId` alone; a path holding no stamp passes, so refuse an unstamped write where the disk holds the file; the door runs ahead of the write, so a stamp written there outlives a write `codeDoor` refuses; the formatter rewrites a `Write` inside `codeDoor`, so a stamp of the raw text refuses the next edit; `refusal` opens on the voice rules, so this door owes its own wording beside `refusedTicket` and `refusedPrivate`; the box holds the table in memory, and a server restart empties it. Say what the door does there; `hashText` serves the process hash in the schema lane, and the projection lane compares whole texts
  - step: design/draft
    hand: box a5e189c39e1d · claude-code-remote
    hash_before: 7270e19ac2b4d1c28e2997d11b82081459bbdd4c
    hash_after: 7270e19ac2b4d1c28e2997d11b82081459bbdd4c
---

# Ask

**The gain.** Two hands write one tree, and neither one loses the other's work.

**What breaks otherwise.** A write built on a stale read drops the other hand's change, and nothing reports it. The loss then reads as a bug in whatever the change was for.

Version three rules it in one line, under its file lane: a write lands only against the hash of the latest read. The write door reads a file before it applies an edit already, so it holds that hash.

- the write door keeps the hash it reads and refuses a write where the file has moved
- the refusal names the file and asks the hand to read it again
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Each hand carries its own stamp of each file it reads. The write door refuses a
write where the disk disagrees with that hand's own stamp. A stamp one hand
refreshes reaches no other hand, so a stale write finds nothing to agree with.

| key | what the box holds |
|---|---|
| the hand and the path | the hash that hand last saw on that file |
| the hand | the session id the hook reads out of its own session file, with `agentId` beside it |

The hook posts the token today on no event. It carries `agentId` alone, which
parts a subagent from its session. So the hook adds the session id, and the door
keys on the pair.

| the door | what it does |
|---|---|
| the read door | hashes the file the hand reads, and stamps it under that hand |
| the write door | hashes the file on the disk, and refuses where the hand's stamp disagrees |
| the write door | refuses an unstamped write where the disk holds the file, so a hand reads first |
| the write door | stamps the text the write leaves, once every door ahead of it passes |

The stamp lands last, after `codeDoor`. That door formats a write and answers
the formatted text, so the stamp reads that text.

Three cases the door answers with no stamp in hand:

- a path the disk holds nowhere, which needs none, so a new file passes
- a write `codeDoor` refuses, which leaves the stamp the hand already carries
- a table a restart emptied, where every hand reads again before it writes

A restart costs a read and loses nothing, because the unstamped rule already
asks for that read.

`hashText` answers the hash. It serves the process hash in the schema lane
today, and one hash over a text serves this the same way.

This door writes its own refusal beside `refusedTicket` and `refusedPrivate`.
`refusal` opens on the voice rules, so it says the wrong thing here. The new
wording names the file and asks the hand to read it again.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail. The stamp table one box shares reads the same for every hand, so a stale write still lands.

- the shared table holds one stamp a path, so one hand writing refreshes the stamp the other hand reads
- the second hand then agrees with the disk and lands its stale write, which is the loss the ask names
- key the stamp by hand and by path, and name the token a hand carries. The bridge reads `e.agentId` alone
- a path holding no stamp passes, so refuse an unstamped write where the disk holds the file
- the door runs ahead of the write, so a stamp written there outlives a write `codeDoor` refuses
- the formatter rewrites a `Write` inside `codeDoor`, so a stamp of the raw text refuses the next edit
- `refusal` opens on the voice rules, so this door owes its own wording beside `refusedTicket` and `refusedPrivate`
- the box holds the table in memory, and a server restart empties it. Say what the door does there
- `hashText` serves the process hash in the schema lane, and the projection lane compares whole texts

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
