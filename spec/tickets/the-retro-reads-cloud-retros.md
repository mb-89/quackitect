---
kind: [[ticket]]
state: open
group: each-thing-stands-in-place
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
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
step: design/draft
---

# Ask

A retro reads what each cloud box writes of its own run, so the cloud's work in the window reaches the findings.

A cloud group writes its own retro into the group ticket, and no retro verb reads it. The box's transcript leaves with its branch, so the retro names the cloud's work as a limit.

- `retro collect` in `src/scripts/retro-collect.js` gathers the `retro` chapter of every group ticket that closes in the window. A case in `test/level0/retro-collect.test.js` decides it
- `spec/guidance/retro/read.md` hands each of those chapters to the reader whose hours hold the close
- the chapter readers read each cloud transcript beside the desk's own, over the hours it covers
- a cloud box's hand-back of a group keeps the session transcript where `retro collect` reads it once the branch leaves. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A cloud box keeps its transcript on a ref of the group's own, and the collect reads it back with the group's `retro` chapter:

| the part | the change | where |
|---|---|---|
| the box keeps its transcript | `leaves` calls `keep` ahead of the leave commit, where `cloudHere` answers true | `src/scripts/work.js` |
| the keep | `keep` builds an orphan commit of every transcript file, and pushes it to `refs/transcripts/<group>` | `src/scripts/retro-cloud.js`, a new file |
| the transcript files | `transcriptsHere` lists each file of every transcripts folder `belongs` names, past `memory` | `src/scripts/retro-outside.js` |
| the groups of the window | `cloudInto` lists the group tickets a commit since `since` closes | `src/scripts/retro-cloud.js` |
| the chapter | `cloudInto` writes the `# retro` section to `input/groups/<group>.md`, and the close to `input/groups/closed.json` | `src/scripts/retro-cloud.js` |
| the cloud transcript | `cloudInto` writes each file of the ref under `input/transcripts/cloud-<group>` | `src/scripts/retro-cloud.js` |
| the collect | `collect` calls `cloudInto` after `outsideInto`, and merges its refusals and folders | `src/scripts/retro-collect.js` |
| the count | `sourceOf` names `groups` as a source, so the count prints the chapters | `src/scripts/retro-collect.js` |
| the reader | a rule reads each chapter `closed.json` places in the reader's hours, and the cloud lines its chapter file names | `spec/guidance/retro/read.md` |

The keep runs through `it.proc` over a throwaway index:

- `git hash-object -w` writes each file as a blob
- `git update-index --add --cacheinfo` places it, with `GIT_INDEX_FILE` set under `.se/.runtime`
- `git write-tree` and `git commit-tree` make the commit, which runs no commit hook
- `git push origin <sha>:refs/transcripts/<group>` keeps it past `branch close`
- a refused push answers `1`, and the group stays held, so the box retries `branch done`

The collect reads the window off git:

- `git log --since` over `spec/tickets` with `-G "^state: closed"` names the candidates
- a candidate counts where `isGroup` holds and `fieldOf` reads `state` as `closed`
- the close is the committer time of the last commit touching that line
- `git fetch origin` takes `refs/transcripts/*`, and `git show` reads each file of a group's ref
- a group under `input/groups` already stays out of a second pass, so `--again` takes each group once
- a group with no ref gives its chapter alone, and the print names it

The chapter readers need no new verb. `walk` in `src/engine/retro/timeline.js` reads every `.jsonl` under `transcripts`, `cloud-<group>` among them. So `retro timeline` draws the box's hours, and `retro chapters` hands their lines to the chapter they fall in.

This composes with `the-retro-finishes-its-asks`:

- that ticket cuts desk transcript lines stamped before the last collect, inside the copy `outsideInto` makes
- `cloudInto` runs after `outsideInto` and copies a group's transcript whole, since the close gates it
- a box's hours before `since` reach this retro alone, because the group closes in this window
- that ticket keeps `.se/scripts` in `movedInto` on `--again`, and this change leaves `movedInto` as it stands
- both change `collect`, each at its own line, so the merge meets separate hunks

Assumptions:

- the cloud proxy lets a box push a ref under `refs/transcripts`, as it lets it push `work/<group>`
- a transcript stays off every tracked tree, because the commit door refuses a delta carrying the box's name or email
- the transcript stands under `~/.claude/projects/<slug>`, which `it.home` reaches on a box setting `CLAUDE_CODE_REMOTE`

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/retro.js`, `retro`, through `collect`
- `src/scripts/retro-collect.js`, `collect`, through `cloudInto` and `sourceOf`
- `src/scripts/retro-collect.js`, `linesOf`, through `sourceOf`
- `src/scripts/work.js`, `finish`, through `leaves`
- `src/scripts/work.js`, `work`, through `finish` under `done`
- `src/scripts/work.js`, `leaves`, through `keep`
- `src/scripts/retro-cloud.js`, `keep`, through `transcriptsHere`
- `src/engine/retro/timeline.js`, `timedFiles`, over the files under `transcripts/cloud-<group>`
- `src/engine/retro/chapters.js`, `chapters`, through `timedFiles`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/retro-collect.test.js`, "collect gathers the retro chapter of every group closing in the window, with its close"
- `test/level0/retro-collect.test.js`, "collect copies a cloud group's kept transcript whole under transcripts, and the timeline reads it"
- `test/level0/retro-collect.test.js`, "a group closing before the window stays out, and a second pass takes each group once"
- `test/level0/work-group.test.js`, "done on a cloud box pushes the session transcript to the group's own ref"
- `test/level0/work-group.test.js`, "done on a desk pushes no transcript ref"
- `test/level0/work-group.test.js`, "done answers one where the transcript push comes back refused, and the group stays held"

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] every file, function and verb the approach names stands opened, and each claim checked there: `retro-collect.js`, `retro-outside.js`, `work.js`, `work-merge.js`, `group.js`, `cloud.js`, `timeline.js`, `chapters.js`, `private.js`, `proc.js`, `git.js`, `group.yaml` and the retro notes stand read
- [x] the callers list names every caller of what the approach changes: a search for `collect(`, `sourceOf`, `leaves(`, `finish`, `belongs(` and `walk` over `src`, `.claude` and `test` backs it
- [x] every done_when line names the test that decides it: the collect line maps to the `retro-collect.test.js` cases, and the hand-back line to the `done` cases in `work-group.test.js`. The `read.md` line stands in the note, and the reader line meets the case where the timeline reads the kept transcript. The check line maps to `./RUNME.sh check`

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
