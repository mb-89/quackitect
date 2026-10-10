---
kind: [[ticket]]
state: closed
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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
          - name: size
            form: list
            says: every file the approach touches, one a line
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
process_hash: c671f20a6ae2a4a6
group: tests-and-ci-hold
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box af15433560d6 · claude-code-remote
    hash_before: 78cf27a700f0b159739f0353c3176fc04fc836f1
    hash_after: 78cf27a700f0b159739f0353c3176fc04fc836f1
    inputs:
      - name: ask
        hash: 441e4aac68af37b6
        size: 1142
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box af15433560d6 · claude-code-remote
    hash_before: 2861efab8c7edcb0beae66343deeb8a38db34ea4
    hash_after: 2861efab8c7edcb0beae66343deeb8a38db34ea4
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: a0570abbc0d0408b
        size: 1881
    def: 08e16d07b0de477c
  - step: gate
    hand: box af15433560d6 · claude-code-remote · gate-helper
    hash_before: 1f9818fd93ca413514fcbe539933bb3f05720209
    hash_after: 1f9818fd93ca413514fcbe539933bb3f05720209
    inputs:
      - name: design/draft
        hash: a0570abbc0d0408b
        size: 1881
      - name: design/tests-red
        hash: 2c7612fc04dadb2e
        size: 831
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 54da26a4513f · claude-code-remote
    hash_before: 69d751bc66014157761bd61dee166d8391746d72
    hash_after: 69d751bc66014157761bd61dee166d8391746d72
    answered:
      - name: lint
        exit: 0
        said: "src/quack/setup_verb.go:121:1 ExampleCovers: ./RUNME.sh setup stands in no example's interface. Write an example under s"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 54da26a4513f · claude-code-remote
    hash_before: b0e94b203db9498642def0600625f72869d749e9
    hash_after: b0e94b203db9498642def0600625f72869d749e9
    answered:
      - name: tests
        exit: 0
        said: green, src/q passes; green, src/quack passes; green, src/tui/registry passes; green, src/tui/tree passes; green, src/tui
      - name: check
        exit: 0
        said: "   62.1  in all"
    inputs:
      - name: design/tests-red
        hash: 2c7612fc04dadb2e
        size: 831
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

`RUNME.sh` runs the whole `install.sh` before every verb, and the install always ends in the setup verb. The Stop hook runs `RUNME.sh branch beat` at every turn's end, so each turn pays the want checks and the setup, and a box missing a want fetches it again inside the hook. RUNME runs the install only where a cheap check finds the binary missing or its stamp stale, the install speaks on stderr, and the browser fetch names the pinned playwright-core.

The gain is a turn end that costs the beat alone, and verb output that carries the verb's answer alone.

Without it a slow or failing fetch repeats every turn, the beat that keeps a group's hold alive can time out, and install chatter lands ahead of `--json` output.

- `RUNME.sh` skips `install.sh` where the binary stands and its stamp holds, under a test in `go -C src/quack test ./...`
- `RUNME.sh` runs `install.sh` where the binary is missing or its stamp is stale, under the same test
- `install.sh` writes its lines to stderr, under a test reading stdout empty
- the browser fetch names `playwright-core@` with the version the webview's package.json pins

view: none

from: none

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

RUNME.sh runs install.sh in three cases alone: a bare call, a binary missing, and a stamp the binary reads stale. A verb on a fresh binary skips the install. The stale check runs the binary's own `stamp fresh se-index` from the root, the same check `index_here` in install.sh runs, and it holds where go stands, since a box with no go builds nothing. It costs one hash of the index sources, a third of a second on a cloud box, in place of the want checks, the setup verb, the survey, the Copilot setup and the brand. RUNME.sh sends the install's stdout to stderr, so a verb's stdout carries the verb's answer alone, `--json` among them. The browser want in src/quack/setup_verb.go runs `npx --yes playwright-core@<pin>`, the pin read off the webview's package.json, so npx fetches the version the tree tests against. The hooks keep calling RUNME.sh, since a fresh binary now costs the stamp check alone.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .claude/settings.json: the Stop hook and the SessionEnd hook, `RUNME.sh branch beat`
- .github/workflows/check.yml, dispatch.yml, update.yml: each `./RUNME.sh` step
- every agent and person command naming `./RUNME.sh <verb>`
- src/quack/setup_verb.go: setupVerb, through the browser item's get

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/runme_test.go: TestAVerbOnAFreshBinarySkipsTheInstall
- src/quack/runme_test.go: TestAMissingOrStaleBinaryRunsTheInstallOnStderr
- src/quack/setup_verb_test.go: the browser line names playwright-core at the webview pin

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- RUNME.sh
- src/quack/setup_verb.go
- src/quack/runme_test.go
- src/quack/setup_verb_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- RUNME.sh, install.sh index_here and stamp, setup_verb.go and the settings hooks stand opened, and each claim checked there
- the callers list names the hooks, the workflows and setupVerb
- each done_when line names a test above
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/runme_test.go
- src/quack/setup_verb_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The fresh case installs and prints installing on stdout ahead of the verb line, so today every verb pays the install and its chatter reaches stdout. The stale and missing cases install as they should, and fail on the install line standing on stdout in place of stderr. The browser line runs playwright-core with no version. The planted PATH of the RUNME cases holds sh and mkdir alone, so the fakes read their folder off ${0%/*} and their code through read, with no dirname or cat.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a failing case: the skip, the run on stale and missing, stderr, and the pin
- the RUNME cases plant a go, an install and a binary of their own, and the setup case runs over the fake doors

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the approach answers the ask: RUNME.sh gates install.sh on a missing binary or a stale `stamp fresh se-index`, the same check index_here runs, and sends the install stdout to stderr
- the redirect sits in RUNME.sh, not install.sh, which keeps the boot word printing on stdout for the SessionStart hook
- done_when 1 and 2 are decided by TestAVerbOnAFreshBinarySkipsTheInstall and TestAMissingOrStaleBinaryRunsTheInstallOnStderr, red on their own assertions
- done_when 3 is decided by the same test, which reads the install line on stderr and stdout carrying only the verb line
- done_when 4 is decided by TestTheSetupResolvesABrowserAsAWant, red on the unpinned npx line; the webview package.json pins playwright-core 1.63.0
- fixed in place: gofmt alignment of the exit field in TestAMissingOrStaleBinaryRunsTheInstallOnStderr
- for implement: TestOnWindowsTheSetupReachesNpmNpxAndCodeThroughCmd seeds no webview package and expects the unpinned line, so the change either falls back to unpinned or updates that row

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

    ./RUNME.sh lint RUNME.sh src/quack/setup_verb.go src/quack/setup_verb_test.go src/quack/runme_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches RUNME.sh and src/quack/setup_verb.go, both named in the size list
- the change reaches the disk door alone, whose fake stands in box_doors_test.go
- a comment beside the stamp check, the install gate and the pin reader names the ticket it implements
- the stamp check stands once in RUNME.sh, and the pin stands once in the webview package.json, which the setup reads

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

    ./RUNME.sh branch test

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

RUNME.sh ran the whole install before every verb, so the Stop hook paid the want checks and the setup at each turn end, and install lines landed ahead of a verb answer on stdout. RUNME.sh now runs install.sh where the call is bare, the binary stands missing, or the binary reads its own stamp stale through stamp fresh se-index, the check index_here in install.sh runs; a box with no go keeps its binary. The install writes to stderr, so stdout carries the verb answer alone, --json among them. A verb on a fresh binary drops from a full install to the stamp check alone. The browser want fetches playwright-core at the version the webview package.json pins, and falls back to the bare package where no pin stands.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches RUNME.sh and src/quack/setup_verb.go alone
- the change reaches the disk door alone, whose fake stands in box_doors_test.go
- a comment beside the stamp check, the install gate and the pin reader names the ticket
- the stamp check stands once in RUNME.sh, and the pin stands once in the webview package.json

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
