---
kind: [[ticket]]
state: open
urgency: now
step: verdict
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: settle-1
        does: decides between the step and the findings, and writes why
        by: anyone
        to: engine
        asks: "design/review failed back 2 times: One gap stands, and the rest of the approach answers the ask.; | the gap | the fix |; |---|---|; | the route runs `notes` ahead of `readers`, so the drain meets every chapter open | name the field the drain reads a chapter by, and passes |; | the earlier finding | what closes it |; |---|---|; | a chapter reads as an open note | the folder stands named, and the gap above holds the rest |; | the cut reads the log alone | the times come off both sources, and a box naming no transcript folder cuts off the log |; | what answers the ask | where |; |---|---|; | the window opens at the last retro's close, or at the first commit | the opens row |; | a chapter is six hours, and a span holding no row stands nowhere | the cuts row |; | the counts carry every kind the ask names, and a missing source reads zero | the counts table |; | a chapter mints off the chapter route, with its window and counts written first | the mints row |; `./RUNME.sh check` exits 0 on this branch."
        evidence:
          - name: answer
            form: text
            says: the decision, and why it stands
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
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 62e52ab6d57707898525a20853db2af6545e6e7f
    hash_after: 62e52ab6d57707898525a20853db2af6545e6e7f
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-21
    hash_before: 37ab51bd3baa40c4f2fa70c1989b2502440cdf86
    hash_after: 37ab51bd3baa40c4f2fa70c1989b2502440cdf86
    returns: 1
    why: Two gaps stand, and the rest of the approach answers the ask:; | the gap | the fix |; |---|---|; | a chapter opens under `.se/tickets`, where `retro notes` reads it as an open note | name the folder a chapter stands in, and say how the drain passes it |; | the cut reads the log alone | say how the transcripts' times reach the cut, which the design names beside the log |; | what answers the ask | where |; |---|---|; | the window opens at the last retro's close, or at the first commit | the opens row |; | a chapter is six hours, and a span holding no row stands nowhere | the cuts row |; | the counts carry every kind the ask names, and a missing source reads zero | the counts table |; | a chapter mints off the chapter route, with its window and counts written first | the mints row |; `./RUNME.sh check` exits 0 on this branch.
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 3260fe5072095b7970647e1dcd980ab8740e8116
    hash_after: 3260fe5072095b7970647e1dcd980ab8740e8116
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 3d95552732299a51787f22c4ea8eb5a03f9a8912
    hash_after: 3d95552732299a51787f22c4ea8eb5a03f9a8912
    returns: 1
    why: the hand takes it back
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 8b8d7a25f687e2f549d9fb01f750e803dade1a08
    hash_after: 8b8d7a25f687e2f549d9fb01f750e803dade1a08
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-24
    hash_before: 2d6ab7b0992eefb0891867cc00f3cf46de1ae73a
    hash_after: 2d6ab7b0992eefb0891867cc00f3cf46de1ae73a
    returns: 2
    why: One gap stands, and the rest of the approach answers the ask.; | the gap | the fix |; |---|---|; | the route runs `notes` ahead of `readers`, so the drain meets every chapter open | name the field the drain reads a chapter by, and passes |; | the earlier finding | what closes it |; |---|---|; | a chapter reads as an open note | the folder stands named, and the gap above holds the rest |; | the cut reads the log alone | the times come off both sources, and a box naming no transcript folder cuts off the log |; | what answers the ask | where |; |---|---|; | the window opens at the last retro's close, or at the first commit | the opens row |; | a chapter is six hours, and a span holding no row stands nowhere | the cuts row |; | the counts carry every kind the ask names, and a missing source reads zero | the counts table |; | a chapter mints off the chapter route, with its window and counts written first | the mints row |; `./RUNME.sh check` exits 0 on this branch.
  - step: design/settle-1
    hand: box d42624a67d18a8 · claude-code
    hash_before: b5afe14aac6e19e0cd0474251e4d04e78733765c
    hash_after: b5afe14aac6e19e0cd0474251e4d04e78733765c
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 5125500c620f403e7cf116cc503a9514d2071fd7
    hash_after: 5125500c620f403e7cf116cc503a9514d2071fd7
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-30
    hash_before: 20061264589594e9b2306b820420ff4f8b34ab9f
    hash_after: 20061264589594e9b2306b820420ff4f8b34ab9f
  - step: implement/tests-red
    hand: box d42624a67d18a8 · claude-code
    hash_before: 0156c24dcb95ee097f5db72208f207250ba28e26
    hash_after: 0156c24dcb95ee097f5db72208f207250ba28e26
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d42624a67d18a8 · claude-code
    hash_before: 383d0e55a4cee54ba36f68856e2704f18483f0da
    hash_after: 383d0e55a4cee54ba36f68856e2704f18483f0da
    answered:
      - name: lint
        exit: 0
        said: 75 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box d42624a67d18a8 · claude-code
    hash_before: a5efb70a84af2c58c8d78f58466ef186a1659fae
    hash_after: a5efb70a84af2c58c8d78f58466ef186a1659fae
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 75 stand at warning, which the panel draws and check allows.
group: the-retro-runs
depends_on: ["the-retro-takes-the-box"]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

Every chapter of the window gets a reader of its own, and the counts stand before anybody reads a word:

- the window runs from the last retro's close commit to now
- a first retro takes the tree's first commit, because no retro closes before it
- a chapter is six hours that hold activity, and a chapter with none stands nowhere

<!-- breaks, as text: what breaks if it is never done -->

One hand reads a window of any length. The reading thins as the window grows, and the thinning is the thing a retro exists to catch.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- `./RUNME.sh retro collect` cuts the window into chapters, off the times the record carries
- each chapter mints a private ticket off the chapter process, with its counts as the ask
- the counts hold the prompts, the tool calls, the shell commands and the refusals by kind
- they hold the tickets a hand moves, the notes it writes, the errors, and the median length of a thought
- a case drives a window with no retro behind it, and reads the tree's first commit
- `./RUNME.sh check` exits 0

# design

## settle-1

<!-- decides between the step and the findings, and writes why -->

### answer

The finding stands. The draft says the drain passes a chapter by, and names nothing it reads to tell one.

| what the drain reads today | what it reads after |
|---|---|
| every note under the private tickets folder whose state stands open | the same, past a note whose process is the chapter route |

The field is the `process` link the mint writes. A chapter carries the chapter route, and a note a hand parks carries the note route. So the drain tells them apart by the one field the mint fills.

A wrong answer here costs a commit inside this branch, so this hand settles it and hands nothing out.

<!-- the form is text -->

## draft

<!-- writes the approach the ask calls for -->

### approach

Collect cuts the window after it copies, because the cut reads the log it copies.

| the step | what it does |
|---|---|
| opens the window | the newest closed retro's last hash, or the tree's first commit |
| reads the times | every row the log and the transcripts carry under the retro folder |
| cuts | six hours a chapter, and a span holding no row stands nowhere |
| counts | one row a chapter, off the kinds the log writes |
| mints | one private ticket a chapter, off the chapter route, naming the retro |

The times come off both sources the design names. The log rows carry the moment each door answers, and a transcript line carries the moment a hand speaks. A box naming no transcript folder cuts off the log alone, and the chapter's ask says which sources it reads.

The window opens where the last retro closes. The verb reads the closed retro tickets, takes the newest, and reads the last hash its record holds. A tree with no closed retro opens at its first commit, because nothing stands before it.

| what the count reads | where it comes from |
|---|---|
| the prompts, the tool calls and the shell commands | the kind each log row carries |
| the refusals, by rule | the rows a door writes when it turns a write away |
| the tickets a hand moves, and the notes it writes | the same rows, by the verb that writes them |
| the errors | the level each row carries |
| the median length of a thought | the transcripts, which stand empty on a box naming none |

A count with no source reads zero, and the chapter's ask says so. A reader then knows the silence is the box's and no hand's.

Each chapter lands as a private ticket under the private folder, off the chapter route. It names the retro under `group`, so the retro's `readers` step finds its children. Its ask carries the window and the counts, written before anybody reads a word.

| what the chapter's name reads | `<retro>-chapter-<n>` |
|---|---|
| where it stands | the private tickets folder, because a chapter dies with the box |
| what opens it | the mint, and the retro's own `readers` step hands it out |

A chapter stands where the pull finds it, which is the private tickets folder. So `retro notes` meets it there, and the retro's `notes` step runs before `readers`.

| what `retro notes` reads today | what it reads after this |
|---|---|
| every open note in the folder | every open note a hand parks there |
| a chapter among them | a chapter passed over, by the process its frontmatter links |

The field is the `process` link the mint writes. A chapter carries the chapter route, and a note a hand parks carries the note route. So the drain tells the two apart by the one field the mint fills, and no chapter holds the drain open.

The span stands as a constant beside the verb, because the design fixes it and no box moves it.

<!-- the form is text -->

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

pass

The approach answers every line of the ask, and the standing finding closes.

| the earlier finding | what closes it |
|---|---|
| the drain meets a chapter as an open note | the draft names the `process` link, which the mint fills |
| a chapter reads as an open note | the private tickets folder stands named |
| the cut reads the log alone | the times come off both sources, and a bare box cuts off the log |

| what answers the ask | where |
|---|---|
| the window opens at the last retro's close, or at the first commit | the opens row |
| a chapter is six hours, and a span holding no row stands nowhere | the cuts row |
| the counts carry every kind the ask names, and a missing source reads zero | the counts table |
| a chapter mints off the chapter route, with its window and counts written first | the mints row |
| a chapter names its retro under `group`, so `readers` finds its children | the mints row |

A parked note carries `process: [[spec/processes/note]]`, so the field tells the two kinds apart.

`./RUNME.sh check` exits 0 on this branch.

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

    ./RUNME.sh branch test test/level0/retro-window.test.js

<!-- the form is command -->

### seen

Four cases stand, and each one fails on its own assertion.

| the case | what it asks |
|---|---|
| the cut | two spans hold rows, the span between them holds none, and two chapters stand |
| the mint | a chapter carries the chapter route and names the retro as its group |
| the counts | the window and the counts stand in the ask before anybody reads |
| the first window | a tree with no closed retro opens at its first commit |

What surprises me is how the empty span proves the rule. A window of a day holds four spans, and two of them hold rows, so two chapters stand and no reader meets an empty one.

The counts read off the log's own kinds. A row names a prompt, a shell line, a tool call or a write, so one file answers every count the ask asks for.

### checked

- the change touches no file the ask leaves out. One case file lands, and nothing else moves.
- every door the change reaches has a fake. The cases drive the fake disk, the fake git and the fake clock.
- a comment names the approach the change implements. The fixture says why one span holds no rows.

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

    ./RUNME.sh lint

<!-- the form is command -->

### checked

- the change touches no file the ask leaves out. The window module and the one call inside collect.
- every door the change reaches has a fake. The module reads the disk and git through their doors alone.
- a comment names the approach the change implements. The span says the design fixes it, and no box moves it.

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

    ./RUNME.sh branch test test/level0/retro-window.test.js

<!-- the form is command -->

### check

    ./RUNME.sh check

<!-- the form is command -->

### says

Collect cuts the window after it copies, because the cut reads the log it copies.

| what lands | where |
|---|---|
| the cut, the counts and the chapter mint | `src/scripts/retro-window.js` |
| the one call, after the copy | `src/scripts/retro-collect.js` |
| the window itself, as a file the manifest names | `window.json` under the retro folder |

A window opens where the last closed retro leaves the tip, and at the tree's first commit where none stands. A span of six hours holding rows becomes a chapter, and a span holding none stands nowhere.

Each chapter mints a private ticket off the chapter route, naming the retro as its group. So the retro's `readers` step finds its children where the pull looks for them.

| what a count reads | the row that answers it |
|---|---|
| the prompts, the tools and the shell lines | the kind each log row carries |
| the refusals | a write row, which a door writes when it turns a write away |
| the errors | the level the row carries |

One thing the cases teach me. A chapter the mint refuses stood nowhere and said nothing, so the verb now names which chapter mints nowhere and why. My own fixture broke the route's own rule, and that silence hid it.

### checked

- the change touches no file the ask leaves out. The window module, the call inside collect, and the cases over both.
- every door the change reaches has a fake. The cases drive the fake disk, the fake git and the fake clock.
- a comment names the approach the change implements. The span says the design fixes it, and no box moves it.

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
