---
kind: [[ticket]]
state: closed
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
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
        to: retro
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
step: implement/tests-green
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: open-tasks-land-in-shadow
record:
  - step: design/draft
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: da11ae9b47e9d173880efc7d04b8881e32144a75
    hash_after: da11ae9b47e9d173880efc7d04b8881e32144a75
  - step: design/review
    hand: box d7d70c069f441 · claude-code-remote · helper-2
    hash_before: 5e5d6e8c72b4ccd31ea1458bdb5799ae1d6c6550
    hash_after: 5e5d6e8c72b4ccd31ea1458bdb5799ae1d6c6550
  - step: implement/tests-red
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: 838a6c982089d74d7041c6d7d865603235f8737f
    hash_after: 838a6c982089d74d7041c6d7d865603235f8737f
    answered:
      - name: tests
        exit: 1
        said: assertion, 6 test(s) fail on their own assertion
  - step: implement/change
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: 90c7e9d8d62f2c588cc49a0a7d3166fa61b9237d
    hash_after: 90c7e9d8d62f2c588cc49a0a7d3166fa61b9237d
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: 57c2ae12b13e9fe5f974abbd208beb7d28f9e13b
    hash_after: 9fbacd4a6c2303d4b6502713b6abd876a1d55ff3
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:122:99: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

`branch open` writes `cloud: true` into the group's ticket on `main`, and the merge, the release and the close clear it. The ticket schema names the field. [[spec/rationales/git-stays-the-archive]] argues it.

The queue then reads files alone. Without the marker every count reads git on every call.

- a case under `test/level0` drives each of the four verbs and reads the marker
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The group ticket on `main` carries `cloud: true` while its branch stands in the cloud. Each verb writes it through the front door, `withField` and `withoutField` in `src/engine/group.js`, and commits on trunk.

| the verb | what it does to the marker on `main` |
|---|---|
| `open` | runs on trunk with a clean tree, as `merge` does. It sets `cloud: true`, commits `<group>: opens in the cloud` and pushes trunk. Then `markOff` cuts the branch off the new trunk tip. A refused trunk push opens no branch |
| `merge` | drops `cloud` on the merge commit, amended in beside `freeChildren`, before the check runs |
| `close` | drops `cloud` on trunk where it still stands, commits and pushes trunk, then deletes the branch. A merged group reads clear already, so the forced close of an unmerged one is where this bites |
| `release` | leaves the marker. The branch stays in the cloud at `todo`, and the queue hands it to the next box |

The schema names `cloud` as a boolean the verbs write, beside `enabled_by`, marked `x-engine`, so the door refuses a hand's edit.

The release row departs from the ask. The ask names the release among the clearing verbs, and [[spec/rationales/git-stays-the-archive]] says the same. `release` puts the branch back to `todo` in the cloud and deletes nothing. Clearing there marks a live branch as gone, and the queue then counts it on trunk. The drift the rationale's third chapter names is exactly that.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/work.js`, `openGroup`, through the `open` verb
- `src/scripts/work-merge.js`, `merge`, through the `merge` verb
- `src/scripts/work-merge.js`, `close`, through the `close` verb
- `src/scripts/work.js`, `release`, which stays as it stands
- `spec/schemas/ticket.schema.yaml`, the `properties` map

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/work-cloud-marker.test.js`, `branch open writes the marker on trunk before it pushes the branch`
- `test/level0/work-cloud-marker.test.js`, `branch open refuses off trunk, and pushes nothing`
- `test/level0/work-cloud-marker.test.js`, `branch merge drops the marker on the merge commit`
- `test/level0/work-cloud-marker.test.js`, `branch close drops the marker on trunk before the branch goes`
- `test/level0/work-cloud-marker.test.js`, `branch release leaves the marker, and the branch stands at todo`

The done lines and the test deciding each:

- the four verbs: `./RUNME.sh test test/level0/work-cloud-marker.test.js`
- the check: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: `openGroup`, `markOff`, `release` and `letGo` in `src/scripts/work.js`, and `merge` and `close` in `src/scripts/work-merge.js`
- the callers come off a search for `openGroup` and for each verb in the dispatch table of `work`
- each done line names its test file, and the check verb decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- open-marker-outlives-refused-push: `openGroup` pushes trunk with `cloud: true` before the branch push, so a refused branch push leaves the marker on trunk with no branch. Drop the marker on that refusal, or push the branch first, and add the case to the test file.
- rationale-drops-release-row: the `release` departure holds, because `release` writes `hash_after` and leaves the branch at `todo` in the cloud. Rewrite the row in `spec/rationales/git-stays-the-archive.md` to name the merge and the close alone, since the ask points at that note.
- close-force-guards-trunk-checkout: `close` reads neither `HEAD` nor a dirty tree today, and the forced close now commits on trunk. Add the trunk and `dirty` guards `merge` carries.
- open-marks-standing-branches: the `already stands in the cloud` return in `openGroup` writes nothing, so a branch opened before the change carries no marker. Write the marker on that road too.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/work-cloud-marker.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Six cases fail on their own assertion: open writes no marker and runs off trunk, the merge and the close leave the marker, and the close runs off trunk. The refused-push case and the release case pass already, because each asserts what stays as it stands. They hold the two roads the change must leave alone.

The fake git answers every command a case leaves unlisted with success, so each case reads the order of the pushes off `ran` and the marker off the fake disk.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the tests touch the four verbs and the marker alone
- every case drives the fake git, the fake disk and the fake front
- the file header points at this ticket
- the marker's name stands in the schema, and the cases read it through `fieldOf`
- the four review rows each hold a case: the refused push, the release, the close off trunk, and the standing branch

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

    ./RUNME.sh lint src/scripts/work.js src/scripts/work-merge.js test/level0/work-cloud-marker.test.js test/level0/work-open.test.js test/level0/work.test.js spec/schemas/ticket.schema.yaml spec/rationales/git-stays-the-archive.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the four verbs, the schema, the rationale, and the tests of open and close
- every write goes through the git, disk and front doors, and each has its fake
- `marks`, `marksTrunk` and `offTrunk` point at this ticket
- the key stands once, as `CLOUD_MARK` in `work-merge.js`, and the test reads it there
- the four review rows stand fixed, each with its case in the marker test

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/work-cloud-marker.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A group ticket on `main` carries `cloud: true` while its branch stands in the cloud, so the queue can read the marker off files and leave git alone.

| the verb | what it does to the marker |
|---|---|
| `open` | pushes the branch, then commits the marker on trunk and pushes trunk. A branch already standing takes the marker too |
| `merge` | drops it in the merge commit |
| `close` | drops it on trunk and pushes trunk before the branch goes |
| `release` | leaves it, because the branch stays in the cloud |

`open` and `close` now run on trunk alone, with a clean tree, because both commit there. The rationale's release row says the same.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the four verbs, the schema, the rationale, and the tests driving open and close
- every write goes through the git, disk and front doors, and each has its fake
- the three new functions point at this ticket
- the key stands once, as `CLOUD_MARK` in `work-merge.js`
- the four review rows stand fixed, each with its case

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
