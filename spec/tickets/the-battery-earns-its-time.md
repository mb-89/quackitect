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
    hand: box 14d41de46d55 · claude-code-remote
    hash_before: 31676ae5da7ea90ff1619f293b12642b80958af4
    hash_after: 5bbada4dd7b885dfe0f7fdbaa01ed928db09359c
  - step: sync
    hand: box 14d41de46d55 · claude-code-remote
    hash_before: 7bb7a863c8a2f4a7dce3a3ad2648640ea937dd6f
    hash_after: a94e4d0e35428c2797ccd768e60af0fec1c08cdf
    answered:
      - name: sync
        exit: 0
        said: work/the-battery-earns-its-time already carries every commit on main.
  - step: split
    hand: box 14d41de46d55 · claude-code-remote
    hash_before: 9f050c6e1f94f1ff72ecdc638ffb17daa18d5105
    hash_after: 9f050c6e1f94f1ff72ecdc638ffb17daa18d5105
  - step: children
    hand: the engine
    hash_before: 0db2ea19db50871e4c2918712aef5bd958ce1045
    hash_after: 0db2ea19db50871e4c2918712aef5bd958ce1045
  - step: retro/notes
    hand: box 14d41de46d55 · claude-code-remote
    hash_before: 9a82e91efbb242c1126a42d944c8850cb330e694
    hash_after: 9a82e91efbb242c1126a42d944c8850cb330e694
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 14d41de46d55 · claude-code-remote
    hash_before: 505c0a2820e865d4c1b566484bb68af68341d4a7
    hash_after: 505c0a2820e865d4c1b566484bb68af68341d4a7
  - step: retro/cloud
    hand: box 14d41de46d55 · claude-code-remote
    hash_before: 71aae6024f0cf55233724c93b7f40b0e91553efb
    hash_after: 71aae6024f0cf55233724c93b7f40b0e91553efb
reason: done
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
The battery proves each door once against the real program, and every other case runs against the fake. So a run takes seconds, and a red names its cause. The reading behind this stands in `spec/rationales/effect.md`, and the stamp's report says what grew.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

    ./RUNME.sh branch sync

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

- [[spec/tickets/a-door-proves-once]], trivial
- [[spec/tickets/a-vale-case-spawns-once]], trivial
- [[spec/tickets/one-reading-proves-one-file]], trivial
- [[spec/tickets/the-roots-case-reads-globs]], trivial
- [[spec/tickets/the-stamp-counts-every-spawn]], trivial
- [[spec/tickets/the-vehicle-case-fakes-install]], trivial

## checked

- each child is one file or one field of the stamp, and a reader holds it whole
- the six add up to the goal: each door once, the rules off one run, the stamp naming what grew
- the children stood minted before the take, and none waits on another

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

    ./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

- a-door-proves-once: the rule helper, the two door files with one real case each, and the manifest stamp
- a-vale-case-spawns-once: the twins stand once, in the paragraph file
- one-reading-proves-one-file: one file, and the language server once for both fronts
- the-roots-case-reads-globs: the roots read off the config's sections in memory
- the-stamp-counts-every-spawn: the reporter, the tally, the unrun parts, the red words, and the report
- the-vehicle-case-fakes-install: the fake install, the one-script vehicle, and one spawn a case
- the push door reads through the tense reader, off a hold trunk's rule level raised
- two drafts stand with no group: disk-door-copies-a-folder and the-install-fetches-go-modules

### well

- one helper cut the Vale spawns to a handful, because a file declares its texts before any case runs
- the stamp's new fields showed each drift the same minute, so no reading waited for a retro
- every step ran its own commands before it closed, so no claim of green stood on belief
- the merge with trunk's rename went through the tests, and they named each old name at once

### badly

- the first check ran red on this fresh box, because the stamp wrote no manifest a clone lacks
- the fourth stamp named the helper as every rule case's file, because the runner names the caller's file
- a private note named binaries standing nowhere in the tree: a claim from recall, and the measure said so
- the first resolution of the sync conflict took my whole vehicle note over trunk's, and lost the rename
- the push after the sync met a hold on false past tenses. The door linted raw Vale, and the check reads through the tense reader.
- the pull hands no private note to the hand at retro/notes under a queue binding. The retro hand closed both by hand.
- the formatter over a folder touched six files outside the change, and taking them back cost a turn
- the one-reading change landed under a-door-proves-once, because that ticket's third line needed it first

### improve

- the brand stamp reads every target's source, so a clone gets its manifests: `src/scripts/brand.js`, done here
- the reporter names each case's file, so a helper hides no file: `src/scripts/battery-reporter.js`, done here
- check a claim before it goes into a note: the voice check on recall, on this hand
- resolve a conflict off trunk's file, and read the diff against trunk before staging: the working guidance
- the push door reads through the tense reader: `src/scripts/prepush.js`, done here
- the pull hands a private note to the hand at retro/notes: `src/scripts/pull-hand.js`, a ticket to mint
- run the formatter over named files, and read the status before a commit: this hand
- a sibling's line that a ticket needs lands under the sibling, and the record says so: the working guidance

### thoughts

Two lines of the asks read as proxies. The grep over the contract folder names a word, and a fixture or a function name carries the word with no spawn behind it. The slowest ten is a floor that moves as the battery gets faster. So a case stands in it at a fifth of a second. The stamp's spawn count and a time a case answer both better than the words do.

| the battery on this box | before | after |
|---|---|---|
| Vale spawns a run | about two hundred | 18 |
| the tests part | 14.5 s | 10.3 s |
| the slowest case | 2.2 s | 1.3 s |

The ask says every case past the door case takes the fake. No fake evaluates a rule, and the rationale says a rule asserted against a stub is a rule nobody runs. What the helper holds instead is the one run a file, with every case reading its findings off it in memory. That is what the ask reaches for, and the words could say it.

### checked

- each fact the change adds stands in one note, and every file points at its chapter
- each number stands in the stamp or in one table, and the design notes carry none in prose
- each header names what its file is for, and counts nothing

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

- nothing: every tool the install names stood, the proxy refused no host, and the platform refused no right

### met

- a test failing on the box alone: three vehicle cases at the first check, off the manifest a clone lacks
- a conflict at sync: trunk's rename of the copy to the vehicle, over the note and two contract files
- a hook: the push door held the push on false past tenses after the sync, and the fix landed here
- the commit door refused the reporter without a test beside it, and the test landed

### left

- no person step stands parked
- disk-door-copies-a-folder stands as a draft with no group, off the private note on the copy
- the-install-fetches-go-modules stands as a draft with no group, off the private note on the Go part
- a ticket to mint: the pull hands a private note to the hand at a group's retro/notes step
- the handover says the branch stands done, and `branch done` runs when this step closes

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
