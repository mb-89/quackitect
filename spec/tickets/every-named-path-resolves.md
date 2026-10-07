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
process_hash: 22b42ea1501e8967
group: engine-verbs-hold
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 1a9c14f7cd128ef3ef3cbfc621762867dc801139
    hash_after: 1a9c14f7cd128ef3ef3cbfc621762867dc801139
    inputs:
      - name: ask
        hash: 36f3cb64b0e2abfc
        size: 436
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 6bfcde52863af7a719520ab7a415ce873f93fa3d
    hash_after: 6bfcde52863af7a719520ab7a415ce873f93fa3d
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/check fails
    inputs:
      - name: design/draft
        hash: 22bc942abf02b0f9
        size: 3924
    def: 08e16d07b0de477c
  - step: gate
    hand: box 57a5a484096e · claude-code-remote · helper-4
    hash_before: acd24139bba779dbbcf4be81a983a19e68be73a2
    hash_after: acd24139bba779dbbcf4be81a983a19e68be73a2
    inputs:
      - name: design/draft
        hash: 22bc942abf02b0f9
        size: 3924
      - name: design/tests-red
        hash: aec90133ee67a7eb
        size: 822
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 443cff5b58d86e0ed9af2a7aa9bbba801b705f9d
    hash_after: 443cff5b58d86e0ed9af2a7aa9bbba801b705f9d
    answered:
      - name: lint
        exit: 0
        said: "  113.3  in all"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 57a5a484096e · claude-code-remote
    hash_before: b37b8248cc6b511d300c8271fc5c08dc9690e803
    hash_after: b37b8248cc6b511d300c8271fc5c08dc9690e803
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes; green, src/branches passes
      - name: check
        exit: 0
        said: "    1.8  test/contract/paragraph.test.js a character outside the set is refused, and a code span passes"
    inputs:
      - name: design/tests-red
        hash: aec90133ee67a7eb
        size: 822
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

A note or a comment that names a path names one that stands, and each config default lives in one place.

Deleted paths linger in notes and comments, and the two defaults of one key drift apart.

- `go test ./src/modules/check/` passes a case where the check refuses a note that names a deleted file.
- `go test ./src/branches/` passes with `staleSpan` cut and the stale span read from the settings default.
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

Two changes, one a done_when line.

The path rule. A new file src/modules/check/named.go holds `EveryNamedPathStands` and `namedPathFaultsIn(tree, held, path)`. It reads a note's code spans outside fences and front matter, and the comments of a code file, through the same row walk `pointersIn` uses. A span or comment word reads as a path where it matches `pathShape`: a tracked root (`src/`, `spec/`, `test/`, `.claude/`), plain path letters, and a file ending. A word carrying `*`, `<`, `{` or `$` reads as a shape, so a glob or a placeholder passes. `placesIn(tree).fileOf` decides whether the path stands, so a folder or a file both pass. A miss draws an error naming the path and telling the reader to name a file the tree holds. The rule joins `Rules` in src/modules/check/checker.go, and `Checker.Over` calls it beside `pointerFaultsIn`. It skips every note under spec/tickets, since an open ticket names files its own change writes. `pastHistory` already lets a closed ticket pass.

The default. In src/branches/group.go, the constant `staleSpan` leaves. `(*Doors).staleSpan` in src/branches/free.go answers `spanOf(d.config(staleKey))`, and a span of zero reads as no claim standing stale. Production stays as it stands: src/quack/branch.go hands `config.Value`, which answers the schema default in spec/config/level0.schema.json where no layer sets the key. The tests' `newTree` in src/branches/tree_test.go sets `Config` to a fake reading `config.Value` over the repo root, so the tests read the same settings default. Cases that set `Config = nil` and lean on the old 12h span set the span they need.

The rule lands at error, and this change fixes every path it names in the tree, so the check stays green on the commit. The JavaScript STALE copy in src/engine/group.js waits on a note, since the ask names the Go default.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/modules/check/checker.go (*Checker).Over
src/modules/check/checker.go treeFaults (through Rules)
src/modules/check/checker.go (*Checker).Sweep
src/modules/check/export.go (exports beside EveryPointerResolvesOver)
src/branches/free.go (*Doors).staleClaim
src/branches/free_test.go TestAClaimGoesStalePastTheSpan
src/branches/port_c_held_test.go pcTakingPast
src/branches/port_a_take_test.go TestPATakeHandsStaleByTheClock
src/branches/dispatch_test.go TestDispatchReadsAStaleHoldReadyAndAFreshHoldHeld
src/branches/dispatch_test.go TestDispatchReadsADoneGroupPastTheStaleSpanAsAStuckHandOver
src/branches/tree_test.go newTree

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/modules/check/named_test.go TestTheCheckRefusesANoteNamingADeletedFile
src/modules/check/named_test.go TestACommentNamingADeletedFileDrawsTheRule
src/modules/check/named_test.go TestAGlobAPlaceholderAndAStandingPathPass
src/modules/check/named_test.go TestAnOpenTicketNamingANewFilePasses
src/branches/free_test.go TestTheStaleSpanReadsTheSettingsDefault

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/modules/check/named.go
src/modules/check/named_test.go
src/modules/check/checker.go
src/modules/check/export.go
src/modules/check/testdata/tree.golden.json
src/branches/free.go
src/branches/group.go
src/branches/free_test.go
src/branches/tree_test.go
src/branches/port_c_held_test.go
every tracked note or code file the new rule names, fixed in the same change

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

pointer.go pointersIn, placesIn, fileOf and unresolved, checker.go Over, Rules and Sweep, history.go isHistory and pastHistory, restated.go spanAt, branches free.go staleSpan, group.go staleSpan, doors.go config, quack branch.go Config, config.go Where and defaultIn, and the schema entry work.staleAfter stand opened and read.
A grep for staleSpan, staleKey, Rules and pointerFaultsIn over src gives the callers list, the branch tests leaning on the span among them.
The check line is TestTheCheckRefusesANoteNamingADeletedFile, the branches line is TestTheStaleSpanReadsTheSettingsDefault with the const gone, and ./RUNME.sh check runs both.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/check/named_test.go src/branches/free_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/modules/check/named_test.go
src/branches/free_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The sweep draws no rule on a note or a comment naming a missing file, and the stale span reads the 12h constant where the settings default holds 30m. The shape case and the open ticket case pass already, and they guard the new rule against false hits. The span case reads the default off the tracked schema, so a change to the default moves no test.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The check line meets TestTheCheckRefusesANoteNamingADeletedFile, the branches line meets TestTheStaleSpanReadsTheSettingsDefault, and the check line waits for tests-green.
The check cases run over the fake index in q/qtest, and the span case reads the doors with no git and no clock.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- stale-span-reads-schema-unset: the draft reads a zero span where no config door answers and sets Config in newTree, yet TestTheStaleSpanReadsTheSettingsDefault builds Doors with a nil Config and with one answering nil and wants 30m, so (*Doors).staleSpan in src/branches/free.go reads the schema default at d.Method where the door answers nothing
- js-stale-reads-settings-default: src/engine/group.js STALE keeps a 12h second default of work.staleAfter that src/scripts/work-free.js reads, against the ask's one default a key, so the script reads the settings default instead

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: the rule lands in src/modules/check, and every other file it touches drops a dead path the rule names, which the draft asks this change to fix.
every door the change reaches has a fake: the rule reads the tree through placesIn, and its cases plant notes over the fake tree.
a comment names the approach the change implements: named.go opens with the rule and points at this ticket.
every fact the change adds stands in one place: the row walk moves into rowsSaid in pointer.go, which both rules read, and the dry probe delta reads untracked files in deltaOf alone.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/check/named_test.go src/branches/free_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A note or a comment naming a path in the tree now names one that stands, and work.staleAfter keeps one default. EveryNamedPathStands in src/modules/check/named.go reads the code spans of notes and the comments of code, and refuses a path under src, spec, test or .claude that the tree holds nowhere. A glob or a placeholder passes, and tickets stay out. The change fixes every dead path the rule found across the design notes, rationales and comments. The stale span reads the config, then the schema default, through its two children. The dry probe now carries untracked files into its clone, since a check before the commit lost a new source file and failed the build.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: the rule, the dead paths it names, the stale span, and the probe fault the check met.
every door the change reaches has a fake: the rule cases plant notes, the span cases build Doors, and the delta case fakes the process door.
a comment names the approach the change implements: named.go, staleSpan and deltaOf each carry it.
every fact the change adds stands in one place: the schema holds the default, and rowsSaid holds the row walk both rules read.

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
