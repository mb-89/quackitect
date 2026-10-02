---
kind: [[ticket]]
state: open
step: design/tests-red
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
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
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
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
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: node-leaves-the-boxes
depends_on: ["go-prose-checks-stand-alone", "the-webview-ships-prebuilt"]
record:
  - step: design/draft
    hand: box 10b884eb9cae · claude-code-remote
    hash_before: 60e53ce990e3048082207c957c7b7345b638c738
    hash_after: 60e53ce990e3048082207c957c7b7345b638c738
    inputs:
      - name: ask
        hash: 83575bda3f482f6c
        size: 216
    def: 71651f49796eeda4
---

# Ask

`src/scripts/install.sh` installs no Node, and nothing past the extension and the hook module needs it.

A box then carries one runtime.

- `grep -c node src/scripts/install.sh` answers 0
- `./RUNME.sh check` exits 0

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The ask rests on a premise the code breaks: the verbs still run as Node programs. `programOf` in `src/quack/verbs.go` hands every verb without a Go twin to `node`, and three verbs carry a twin. So the box keeps Node after this ticket, as the verbs' runtime, and the second line of the ask stands false until the verbs port. Porting them sits outside this group.

What this ticket lands: the installer neither installs Node nor runs it. Node becomes a prerequisite the verb road names, the way `sh` and `git` stand.

- The `node` item leaves the loop, with `get_node` and its rows under `here`, `why` and `get`.
- `get_vale_ls` spells the asset table in sh, with a comment naming `servers.js` as the owner. A contract case holds the two tables equal.
- `src/scripts/go-stamp.sh` takes the source stamp over: `go list -deps` names the files each build reads, and `cksum` hashes them with the root `go.mod` and `go.sum`. `front_here`, `get_front`, `index_here` and `get_index` call it.
- `go-source.js` keeps `BUILDS` alone, which `work-review.js` reads.
- `rebuilt` in `lib/tools.js` reads `go-stamp.sh fresh` where it read `go-source.js fresh`.
- The steps that run JavaScript leave the installer for a `setup` verb at `src/scripts/verbs/setup.js`: the language client, the browser, the editor link, the editor extensions, the survey, the Copilot setup and the brand.
- `setup.js` keeps each item's here, why, get and missed lines, and honours `SE_INSTALL_SKIP` as the loop does.
- The installer's last step runs that verb through the index binary: `"$bin/se-index" verb "$root/src/scripts" setup`. A box with no index binary skips it with one line.
- `src/modules/verbs/tree.go` lists `setup`, so the verb table and the programs agree.

Weighed: a second script beside the installer, which every caller runs. Six callers run the installer, and each would learn a second call. One hand-off inside the installer keeps every caller as it stands.
Weighed: porting the JavaScript steps to Go. That is the verb port this group leaves, so the setup verb gathers them in one file, which leaves when its verb gets a Go twin.
Assumed: a box running the verbs carries Node already. A cloud box carries it under Claude Code, and the owner's desk carries it from earlier installs. A fresh desk now installs Node by hand once, and the doctor names it missing.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `RUNME.sh`: runs the installer before every verb
- `.claude/skills/level0/hooks/start.js`: `START` runs the installer under `SE_INSTALL_SKIP`
- `src/scripts/boot.js`: `install` runs the installer
- `src/scripts/probe-cold.js`: the cold probe runs the installer in its tree
- `src/scripts/work-merge.js`: the merge runs the installer
- `.github/workflows/copilot-setup-steps.yml`: the Copilot setup runs the installer
- `.claude/skills/level0/lib/tools.js`: `rebuilt` and `installedTools` read the installer's text
- `src/scripts/work-review.js`: reads `BUILDS` from `go-source.js`
- `src/modules/verbs/tree.go`: `Commands` lists the verbs

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/contract/install.test.js`: the install names no node
- `test/contract/install.test.js`: the vale-ls assets the install spells match the ones servers.js names
- `test/contract/install.test.js`: the source stamp reads fresh after a stamp, and stale once a source the build reads changes
- `test/level0/setup.test.js`: the setup gets each missing item, and skips the ones SE_INSTALL_SKIP names
- `test/level0/setup.test.js`: the setup writes the survey, then runs the Copilot setup and the brand

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I open `install.sh`, `verbs.go`, `go-source.js`, `servers.js`, `lib/tools.js` and `work-review.js`, and each name stands where the draft says
- a search for `install.sh` and `go-source` over `src`, `test`, `.claude` and `.github` gives the callers list
- the first done line rides the no-node case, and the check decides the second

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->

<!-- the form is list -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# implement

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

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
