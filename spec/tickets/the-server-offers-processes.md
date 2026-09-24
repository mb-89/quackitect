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
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
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
process_hash: 7a1a6e274b56e7ee
group: the-ticket-answers-the-editor
step: verdict
record:
  - step: design/draft
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: c9ec8dd0ffd9dfaab4527a92822749d2665db2af
    hash_after: c9ec8dd0ffd9dfaab4527a92822749d2665db2af
  - step: design/review
    hand: box 2bc65ec92430 · claude-code-remote · helper-2
    hash_before: 0a4f5ae1d07648df8ba54363c4674d87d3771bc3
    hash_after: 0a4f5ae1d07648df8ba54363c4674d87d3771bc3
    returns: 1
    why: "`frontFaults` in `src/lsp/schema.go` raises missing steps and state on its own, before the bridge answers.; Teach `frontFaults` the `x-filled-by` skip too, and cover it with a Go test under `src/lsp`.; Add `src/lsp/schema.go` `frontFaults` to the callers list."
  - step: design/draft
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 38c3922a1fc5a8624deba614d7f7fe6bf5bfcc80
    hash_after: 38c3922a1fc5a8624deba614d7f7fe6bf5bfcc80
  - step: design/review
    hand: box 2bc65ec92430 · claude-code-remote · helper-4
    hash_before: 835ea1451bc557f72dae2b2974ce43784124b638
    hash_after: 835ea1451bc557f72dae2b2974ce43784124b638
  - step: implement/tests-red
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: f670ac8814e94fc24d5e11d768e0356e00d37295
    hash_after: f670ac8814e94fc24d5e11d768e0356e00d37295
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 76d5a456c958be029f40e4a510eb2e73214a0c2e
    hash_after: 76d5a456c958be029f40e4a510eb2e73214a0c2e
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 647ae701559b2b35fabe94833328bd68dc4bbfa9
    hash_after: 647ae701559b2b35fabe94833328bd68dc4bbfa9
    answered:
      - name: tests
        exit: 0
        said: green, 29 test(s) pass in 1 file(s); green, src/lsp passes
      - name: check
        exit: 0
        said: "spec/tickets/the-server-offers-processes.md:291:3: Sentence: A sentence holds 25 words. Cut this one in two."
  - step: verdict
    hand: box 2bc65ec92430 · claude-code-remote · helper-9
    hash_before: a3a1f22ae10bb6173429abf09554c988f636eecd
    hash_after: a3a1f22ae10bb6173429abf09554c988f636eecd
    returns: 1
    why: "`foldsOf` in `src/lsp/fold.go` repeats the fence scan `frontOf` in `src/lsp/note.go` owns. Reuse `frontOf`.; The new `fence` constant in `src/lsp/fold.go` serves one file while four others write the literal.; The `spec/design_output/schema.md` keyword table names neither `x-filled-by` nor `x-values`. Add both rows there.; Four comments restate what `x-filled-by` means. Point each at the `spec/design_output/schema.md` row.; `./RUNME.sh check` exits 0, and every ask line carries a test that fires.; The handback carries no retro."
  - step: implement/reflect
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 9614e040bae84f9f3c96c0927bfd46a69e74525f
    hash_after: 9614e040bae84f9f3c96c0927bfd46a69e74525f
  - step: implement/change
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 40206765ce1bfd3dc84774f6c556a0eca7c42ad4
    hash_after: 40206765ce1bfd3dc84774f6c556a0eca7c42ad4
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 9927239c7ddf43dc74e4feea249293f5e3fd7d63
    hash_after: 9927239c7ddf43dc74e4feea249293f5e3fd7d63
    answered:
      - name: tests
        exit: 0
        said: green, 29 test(s) pass in 1 file(s); green, src/lsp passes
      - name: check
        exit: 0
        said: "spec/tickets/the-server-offers-processes.md:405:2: Sentence: A sentence holds 25 words. Cut this one in two."
  - step: verdict
    hand: box 2bc65ec92430 · claude-code-remote · helper-13
    hash_before: 70fc1dcd992ecdb651821e898dd880ffde1d58a9
    hash_after: 70fc1dcd992ecdb651821e898dd880ffde1d58a9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A person writing a ticket picks its process from a list, folds the frontmatter away, and meets no false finding before the process stands.

A person types a process name from memory, and the server raises missing steps on every fresh draft.

- `se-lsp` offers every process under spec/processes as a completion on the process key
- `se-lsp` answers a folding range over the frontmatter
- a ticket whose process stands empty raises no missing steps finding
- the Go tests under src/lsp pass

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Three changes, each read off the schema or the note, so the server learns no ticket rule by name:

| the need | the change |
|---|---|
| a process to pick | `process` in `spec/schemas/ticket.schema.yaml` carries `x-values: spec/processes`. `propertyValues` in `src/lsp/complete.go` offers every tracked file under that folder as a link, such as `[[spec/processes/standard]]` |
| the frontmatter folds | the server announces `foldingRangeProvider`, and answers `textDocument/foldingRange` with one range from the opening fence to the closing one. A note with no frontmatter answers an empty list |
| no false finding | `steps` and `state` carry `x-filled-by: process`. Both checkers skip such a required key while the note writes `process` and it holds nothing |

Two checkers raise a missing required key, and each takes the skip:

| the checker | the function |
|---|---|
| the server's own, on every open and change | `frontFaults` in `src/lsp/schema.go` |
| the JS one, which the bridge and the lint ask | `mapFaults` in `.claude/skills/level0/lib/schema.js` |

A ticket naming no `process` key at all still meets the finding.

Go tests under `src/lsp` cover the offer, the fold and the Go skip. A case in `test/level0/schema.test.js` covers the JS skip.


### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/lsp/complete.go` `propertyValues`, which reads the new key
- `src/lsp/lsp.go` `took`, which announces and answers the fold
- `.claude/skills/level0/lib/schema.js` `mapFaults`, which reads `x-filled-by`
- `src/lsp/schema.go` `frontFaults`, which reads `x-filled-by` on every open and change
- `spec/schemas/ticket.schema.yaml` `process`, `steps` and `state`, which carry the two keys


### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- `frontFaults` raises the finding before the bridge answers: it reads `x-filled-by` too, under a Go test


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- `frontFaults` and `mapFaults` both take the `x-filled-by` skip, so the earlier finding stands answered.
- `propertyValues` offers `spec/processes` links, and `took` answers the fold, so every line of the ask stands covered.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh test src/lsp test/level0/schema.test.js


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Each new case fails on its own assertion:

- the process offer, in `src/lsp/complete_test.go`
- the fold and its announcement, in a new `src/lsp/fold_test.go`
- the Go skip, in `src/lsp/schema_test.go`
- the JS skip, in `test/level0/schema.test.js`

The announcement reads `capabilitiesOf`, which `took` now calls, so a test reads the capabilities without a wire. `foldsOf` stands as a stub in `src/lsp/fold.go` so the package builds.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It touches the server's completion, its capabilities and its checker, the JS checker, and their tests.
- every door the change reaches has a fake. The Go cases read a fixture tree in a temporary folder, as their neighbours do.
- a comment names the approach the change implements. Each new case and file points at the design input.


## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

The findings share one class: the change stated a fact where no owner stood, and then stated it again. The fence scan had an owner in `frontOf`, and the two keywords had none. The fix for the class is to give each fact one home and point at it:

- `frontOf` records the closing fence, and `foldsOf` reads it
- a table in the schema design output owns both keywords, and every comment points there


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The fix touches the fold, the note reader, the comments, and the design output that owns the keywords.
- every door the change reaches has a fake. The fold cases read text alone.
- a comment names the approach the change implements. Each comment now points at the owning note.


## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

./RUNME.sh lint src/lsp/complete.go src/lsp/fold.go src/lsp/lsp.go src/lsp/schema.go src/lsp/complete_test.go src/lsp/fold_test.go src/lsp/schema_test.go .claude/skills/level0/lib/schema.js spec/schemas/ticket.schema.yaml test/level0/schema.test.js


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It touches the server's completion, fold, capabilities and checker, the JS checker, the ticket schema, and their tests.
- every door the change reaches has a fake. The fold reads the buffer the tree holds, and the cases read a fixture tree.
- a comment names the approach the change implements. Each new function and schema key points at the design input or says what it does.


## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh test src/lsp test/level0/schema.test.js


### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check


### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The language server helps a person pick a process:

| the need | the change |
|---|---|
| a process to pick | `process` carries `x-values: spec/processes`, and `propertyValues` offers every file standing there as a link |
| the frontmatter folds | the server announces `foldingRangeProvider`, and `foldsOf` in `src/lsp/fold.go` answers one range from fence to fence |
| no false finding | `state` and `steps` carry `x-filled-by: process`, and both checkers hold them back while `process` stands written and empty |

The two checkers each read the key: `frontFaults` in `src/lsp/schema.go` on every open and change, and `mapFaults` in `.claude/skills/level0/lib/schema.js` for the bridge and the lint. A ticket naming no `process` key still meets the finding.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It touches the server, the JS checker, the ticket schema, and their tests.
- every door the change reaches has a fake. The Go cases read a fixture tree, and the JS cases read text.
- a comment names the approach the change implements. Each new function and schema key points at its note or says what it does.


# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

.claude/skills/level0/lib/schema.js
spec/design_output/schema.md
spec/schemas/ticket.schema.yaml
spec/tickets/the-server-offers-processes.md
src/lsp/complete.go
src/lsp/complete_test.go
src/lsp/fold.go
src/lsp/fold_test.go
src/lsp/lsp.go
src/lsp/note.go
src/lsp/schema.go
src/lsp/schema_test.go
test/level0/schema.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass

- `foldsOf` now reads `frontOf`, which records the closing fence in `Close`.
- The `fence` constant stands gone, so `frontOf` alone scans the fence.
- The `spec/design_output/schema.md` table now owns `x-filled-by` and `x-values`.
- Every `x-filled-by` and `x-values` comment now points at that table.
- Each ask line carries a Go or JS test that fires.
- `./RUNME.sh check` exits 0, and the named tests pass.
- The handback carries no retro yet, and the retro step follows this verdict.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact the change adds stands in one place. The fence scan lives in `frontOf`, and the keywords live in one design table.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
