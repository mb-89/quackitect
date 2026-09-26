---
kind: [[ticket]]
state: closed
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
step: implement/tests-green
record:
  - step: design/draft
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 5e13001f343ccd0b002e77f69e6f092e459a1fc1
    hash_after: 5e13001f343ccd0b002e77f69e6f092e459a1fc1
  - step: design/review
    hand: box b8ae1b45d463 · claude-code-remote · helper-2
    hash_before: f2330c34b75330c43f20d68f9cc0270974b351a8
    hash_after: f2330c34b75330c43f20d68f9cc0270974b351a8
  - step: implement/tests-red
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 3e0ed594d0ef54180b7f3bdae2fddc06ea52987c
    hash_after: 3e0ed594d0ef54180b7f3bdae2fddc06ea52987c
    answered:
      - name: tests
        exit: 1
        said: assertion, 11 test(s) fail on their own assertion
  - step: implement/change
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: e6070d194f03c36f02256806579b7d8b7978412e
    hash_after: 166b842e16e9606b6f97832f265cd950056d9f79
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-small-faults-land.md:279:5: Characters: The character ] stands outside the set a paragraph admits: lett"
  - step: implement/tests-green
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 7bae3ee3459ef5d7434a3d8c4be106f305843dc0
    hash_after: 6e2ac94fed15ae45b8816ddb31827dc5cb9b56ea
    answered:
      - name: tests
        exit: 0
        said: green, 168 test(s) pass in 8 file(s); green, src/lsp passes
      - name: check
        exit: 0
        said: "spec/tickets/the-small-faults-land.md:341:5: Characters: The character ] stands outside the set a paragraph admits: lett"
reason: done
---

# Ask

Every small fault a hand parks as a note lands fixed at once. The next hand then meets verbs and messages that say what the code does.

`fix` runs over the whole tree on an unknown flag. The name cap and the take state rules the code does not hold. A verdict table splits into list items, and vale-ls finds no binary on Windows. The review's worktree fails on the webview packages, and a funnel note names a removed key.

- `fix` in `src/scripts/cli-check.js` refuses an unknown flag and writes nothing. It answers `--help` with its usage, and a case under `test/level0` decides both
- the name cap refusals in `src/scripts/ticket.js`, `src/scripts/pull-chapter.js` and `.claude/skills/level0/lib/bash.js` say a name holds at most the cap. The cases over each file decide it
- the take in `src/scripts/work.js` names the dependency a child waits on. It names a person for a step `by: person` alone, and a case under `test/level0` decides both
- `verdictIn` in `src/scripts/pull-chapter.js` keeps a verdict's rows as rows. `branch unblock` writes a findings table as that table, and a case in `test/level0/unblock.test.js` decides both
- `settingsNameBinaries` in `src/lsp/tree.go` takes the Vale binary `src/scripts/install.sh` writes on each platform, which a case in `src/lsp/tree_test.go` decides
- `BORROWED` in `src/scripts/work-review.js` links `src/extension/webview/node_modules` into the review's worktree, which a case in `test/level0/review.test.js` decides
- `git grep writeAt -- spec/funnel` answers nothing
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Each ask line takes the smallest change in the file it names:

| the fault the code shows | the change | the file and function |
|---|---|---|
| `cli.js` hands `fix` the paths alone, so a flag drops out and `vale fix --apply` runs over `.` | the `fix` row hands `rest` in. A new `fixFlags` answers `--help` with `FIX_USAGE`, and an unknown flag refuses before `bin` is read | `fix` and `fixFlags` in `src/scripts/cli-check.js`, the `fix` row of `verbs` in `src/scripts/cli.js` |
| `overLong` refuses a name past the cap, and the messages say a name holds exactly `it.words` words | each message says a name holds at most the cap | `note` in `src/scripts/ticket.js`, `findingFaults` in `src/scripts/pull-chapter.js`, `findings` in `.claude/skills/level0/lib/bash.js` |
| `take` says every open step waits for a person, and `waitsAt` prints `leaf.by`, so a dependency reads as `a anyone` | `waitsAt` reads the reasons in the order `takeable` holds them. It names the open dependency first, and a person for `by: person` alone. Any other step names the need or the hand it waits for. The headline says no hand here takes an open step | `take` and `waitsAt` in `src/scripts/work.js` |
| `verdictIn` joins every row after the opener with `; `, and `asked` in `unblock` cuts on `; `, so each table row lands as a list item | `verdictIn` joins the rows opening with a pipe by the `\n` escape `asked` reads, and keeps them out of `findings` | `verdictIn` in `src/scripts/pull-chapter.js`, read by `asked` in `src/scripts/work-unblock.js` |
| `namesTheBinaries` passes `vale.valeCLI.path` at `Bin + "/vale"` alone, and `get_vale` writes `vale.exe` on Windows | a new `valeWrites` reads the `$bin/vale${exe}` target and each `exe` suffix off `install.sh`. `namesTheBinaries` passes a path naming any name it answers | `settingsNameBinaries`, `namesTheBinaries` and `valeWrites` in `src/lsp/tree.go` |
| `BORROWED` holds `node_modules` and the compiler, so the worktree's check meets `src/extension/webview` with no packages | `BORROWED` takes `src/extension/webview/node_modules`, and `checkOn` links it and takes it back as it does the others | `BORROWED` and `checkOn` in `src/scripts/work-review.js` |
| the window row of the setups table names `context.writeAt`, which `spec/config/level0.json` holds nowhere | the row and the red team's ruling name `context.handoverAt` alone | `spec/funnel/the-bench-reruns-design-inputs.md` and its `.html` twin |

The name cap keeps `overLong` as it stands, since `wordsIn(part) > most` already holds the cap as a ceiling.
The rule name `BranchNameHoldsFive` stays, because the tests and the log key on it.
The table rows ride `why` and `asks` as one frontmatter line, so the escape keeps the frontmatter whole.
`flatOf` quotes the `asks` line and doubles the backslash, and the reader gives the `\n` escape back.
The tracked `.vscode/settings.json` holds one string for `vale.valeCLI.path`, and it stays at `Bin + "/vale"`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/cli.js`, the `fix` row of `verbs`
- `src/scripts/ticket.js`, `ticket`, through `note`
- `src/scripts/pull-chapter.js`, `formFault`, through `verdictIn` and `findingFaults`
- `src/scripts/pull.js`, `handBack`, through `verdictIn`
- `src/scripts/pull-writes.js`, `failed`, which writes the reason into `why` and `asks`
- `src/scripts/work-unblock.js`, `unblock`, through `questionRows` and `asked`
- `src/bridge/bash.js`, `commandRules`, through `findings`
- `src/scripts/work.js`, `work`, through `take` and `waitsAt`
- `src/lsp/check.go`, `readers` and `Rules`, through `settingsNameBinaries`
- `src/scripts/work-review.js`, `gather`, through `checkOn` and `BORROWED`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/fix.test.js`, "fix refuses an unknown flag, and runs nothing over the tree"
- `test/level0/fix.test.js`, "fix answers --help with its usage"
- `test/level0/ticket-verb.test.js`, "ticket note refuses a name past the cap, and says a name holds at most the cap"
- `test/level0/pull-findings.test.js`, "a finding named past the cap says a ticket name holds at most the cap"
- `test/level0/bash.test.js`, "the branch refusal says a name holds at most the cap"
- `test/level0/work-group.test.js`, "take names the dependency a child waits on"
- `test/level0/work-group.test.js`, "take names a person for a by: person step alone"
- `test/level0/unblock.test.js`, "a failed verdict keeps its table rows as rows"
- `test/level0/unblock.test.js`, "a findings table a verdict fails with lands under unblock as that table"
- `src/lsp/tree_test.go`, "TestSettingsTakeTheValeTheInstallWrites"
- `test/level0/review.test.js`, "the worktree borrows the webview's modules, and gives them back before git removes it"

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] every file, function and verb the approach names stands opened, and each claim checked there: every file in the table stands read. So do `names.js`, `pull-hand.js`, `pull-writes.js` and each test file.
- [x] the callers list names every caller of what the approach changes: a search over `src`, `.claude` and `test` backs it, one name the approach changes at a time.
- [x] every done_when line names the test that decides it: each ask line maps to rows under tests. The funnel line reads `git grep`, and the check line reads `./RUNME.sh check`.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass
- `fix` dispatch: the flag fault lives in the `fix` row of `verbs` in `src/scripts/cli.js`, which hands `where`, the arguments with every flag dropped. The implement step changes that one row to hand `rest`, and its checklist line names `cli.js` as the dispatch the ask's `fix` line needs. `fixFlags` splits `rest` into flags and paths, and answers `["."]` when no path stands.
- Vale on Windows: the tracked `.vscode/settings.json` holds one string, `.se/.runtime/bin/vale`, so a rule taking `vale.exe` changes nothing vale-ls meets. The implement step makes the rule take `Bin/vale` and `Bin/vale.exe`, keeps the tracked string, and a case pins it. The says field names the Windows run as open: vale-ls finds Vale there only where its spawn resolves `vale` to `vale.exe`.
- the twin rule: `namesTheBinaries` in `.claude/skills/level0/lib/servers.js`, run by `settingsNameBinaries` in `.claude/skills/level0/lib/tree.js`, holds the same `vale` test. The implement step changes it with the Go rule, and a case in `test/contract/tree.test.js` decides it, so `./RUNME.sh lint` and the panel agree.
- callers: the list takes `.claude/skills/level0/lib/tree.js`, `settingsNameBinaries`, through `namesTheBinaries` in `servers.js`.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/fix.test.js test/level0/ticket-verb.test.js test/level0/pull-findings.test.js test/level0/bash.test.js test/level0/work-group.test.js test/level0/unblock.test.js test/level0/review.test.js test/contract/tree.test.js src/lsp

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Eleven node cases and the Go case fail on their own assertion, and the rest stand green:

- `fix` reads no flag, so `fixFlags` stands nowhere and the refusal and the usage cases fail
- the cap refusals in `ticket.js`, `pull-chapter.js` and `bash.js` say a name holds the cap, with no `at most`
- the take prints `waits for a anyone`, and its headline says every open step waits for a person
- `waitsAt` stands unexported, so the person half reads it through `import * as`
- `verdictIn` joins each table row with `; `, so `unblock` writes each row as a list item
- `BORROWED` holds no `src/extension/webview/node_modules`, so the worktree's check meets none
- `namesTheBinaries` in Go and in `servers.js` refuse `.se/.runtime/bin/vale.exe`
- the surprise: the fail's frontmatter keeps the `\n` escape whole, so `verdictIn` alone needs the change

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change touches no file the ask leaves out: the tests touch the files the design names. `cli.js` stands as the dispatch the ask's `fix` line needs.
- [x] every door the change reaches has a fake: the cases run on `fakeGit` and `fakeDisk`. The `fix` cases hold the process door's `run`.
- [x] a comment names the approach the change implements: each new case carries `[[spec/tickets/the-small-faults-land]]`.
- [x] every fact the change adds stands in one place, and a note points at the file instead of repeating it: the cases read the cap off the fixture.
- [x] every row the design review passes with stands fixed in the change: the `fix` cases read `fixFlags`. A call naming no path reads the tree. The Vale cases stand in `tree_test.go` and `test/contract/tree.test.js`. The contract case pins the tracked string.

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change touches no file the ask leaves out: `cli.js` stands as the dispatch the ask's `fix` line needs. `cli-fix.js` holds `fixFlags` under the file ceiling.
- [x] every door the change reaches has a fake: the take, the unblock and the review read `fakeGit` and `fakeDisk`. The `fix` cases hold `run`.
- [x] a comment names the approach the change implements: each new function carries `[[spec/tickets/the-small-faults-land]]`.
- [x] every fact the change adds stands in one place, and a note points at the file instead of repeating it: `FIX_USAGE` stands in `cli-fix.js` alone.
- [x] every row the design review passes with stands fixed in the change: the `fix` row hands `rest`. `fixFlags` falls back to the tree. Both Vale rules take `vale.exe`.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/fix.test.js test/level0/ticket-verb.test.js test/level0/pull-findings.test.js test/level0/bash.test.js test/level0/work-group.test.js test/level0/unblock.test.js test/level0/review.test.js test/contract/tree.test.js src/lsp

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Each small fault a hand parked as a note now lands fixed:

- the `fix` row in `cli.js` hands `rest`, so the verb reads its own flags
- `fixFlags` in `cli-fix.js` splits flags from paths, and a call naming no path reads the tree
- `fix` answers `--help` with `FIX_USAGE`, and refuses an unknown flag before it runs anything
- the cap refusals in `ticket.js`, `pull-chapter.js` and `bash.js` say a name holds at most the cap
- the take's headline says no hand here takes an open step
- `waitsAt` names an open dependency first, then the hand rule's reason, then a missing need
- `verdictIn` joins a table's rows by the `\n` escape, and keeps them out of the findings
- `asked` in `work-unblock.js` also reads the doubled backslash `flatOf` writes, because the frontmatter reader unescapes nothing
- both Vale rules take `.se/.runtime/bin/vale` and `.se/.runtime/bin/vale.exe`, and the tracked settings keep the plain name
- `BORROWED` links `src/extension/webview/node_modules` into the review's worktree
- the funnel note names `context.handoverAt` alone

The Windows run stays unproven. vale-ls finds Vale there only where its spawn resolves `vale` to `vale.exe`. A question ticket asks a person on Windows to try it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change touches no file the ask leaves out: `cli.js` stands as the dispatch the ask's `fix` line needs. `cli-fix.js` keeps `cli-check.js` under the ceiling.
- [x] every door the change reaches has a fake: the cases read `fakeGit` and `fakeDisk`. The `fix` cases hold `run`.
- [x] a comment names the approach the change implements: each new function carries `[[spec/tickets/the-small-faults-land]]`.
- [x] every fact the change adds stands in one place, and a note points at the file instead of repeating it: `FIX_USAGE` stands once.
- [x] every row the design review passes with stands fixed in the change: the `fix` row hands `rest`. Both Vale rules take `vale.exe`, and says names Windows open.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
