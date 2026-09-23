---
kind: [[ticket]]
state: open
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
group: the-review-lands-overnight
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 95724fc23e4ca789bf744dccd9d28f956e95966a
    hash_after: 95724fc23e4ca789bf744dccd9d28f956e95966a
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 168f447477bd2282f632ec77632e6d6cb7f70d45
    hash_after: 168f447477bd2282f632ec77632e6d6cb7f70d45
    returns: 1
    why: "Design: `hunksIn` keeps the added lines alone, so a hunk trading a code line for a comment passes.; That hunk holds a line of code, and the ask says it meets the door as before.; Fix: read the removed lines too, and let a removed line of code ask for a test.; A pointer fix trades a comment for a comment, so it still passes.; Add that trade to the mixed case: one code line out, one comment in, and the door refuses.; The rest stands: the added reading, the comment-only case, and the note in `tree.md`."
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 6e737488edfb394f3e27868180fd5d8ec135d80c
    hash_after: 6e737488edfb394f3e27868180fd5d8ec135d80c
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-4
    hash_before: 6ab3a6675a50a6beb5c06c2abb1320a3d0ae3d20
    hash_after: 6ab3a6675a50a6beb5c06c2abb1320a3d0ae3d20
    returns: 2
    why: "Design: `hunksIn` reads each `--- a/` header as a removed line of the file above it.; Both doors pipe `git diff --cached --unified=0`, so that header comes before each next `+++ b/`.; The header reads as code, so each file but the last asks a test.; A comment-only fix across seven modules then refuses, and the ask says it passes.; Fix: name in the `hunksIn` row that it skips a `---` header, as it skips `+++`.; Fix: add a comment-only case with two files, and assert it passes.; The rest stands: the removed lines, the trade case, the callers and the note."
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 03e9d1042d535e828ddc3a285d98a4b278a3013f
    hash_after: 03e9d1042d535e828ddc3a285d98a4b278a3013f
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-6
    hash_before: eaf13f7b84341b014b6f36e6c2e4be4a6754f19c
    hash_after: eaf13f7b84341b014b6f36e6c2e4be4a6754f19c
    returns: 3
    why: "Design: `hunksIn` keeps the last `+++ b/` file through a deleted file's hunk.; A deleted file ends its header with `+++ /dev/null`, and that line sets no file.; Its removed code then lands under the file above it, and that file asks a test.; A comment fix beside a deleted module then refuses, and the ask says it passes.; Fix: name in the `hunksIn` row that each `diff --git` line resets the file.; Fix: add a case with a comment fix and a deleted module, and assert the fix passes.; Craft: skip `--- a/` and `--- /dev/null` alone, so a removed `--x` line still reads.; The earlier findings stand answered: the removed lines, the trade case and the `---` header.; The rest stands: the callers, the note, and `names` over the added lines."
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: e2529c35c999debb19ef048793fd6e168f951879
    hash_after: e2529c35c999debb19ef048793fd6e168f951879
---

# Ask

A door reading the shape of a change refuses a change it has no rule over. So
the commit door reads the hunk it refuses.

The commit door asks for a test beside every source file a delta changes. It
reads the path alone. So a hunk holding comment lines alone meets the refusal
a change to code meets. A pointer fix in seven modules landed past the door by
hand.

- The commit door reads a hunk holding comment lines alone as prose, and asks no test for it.
- A hunk holding one line of code beside a comment meets the door as before.
- A case feeds the door a comment-only delta and a mixed one. The first passes, and the second refuses.
- `./RUNME.sh check` exits 0.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The door reads each file's hunk through `codeIn` in
`.claude/skills/level0/lib/tested.js`, and today it reads the added lines
alone. So a hunk trading a line of code for a comment passes. The change reads
the removed lines too.

| part | what changes |
|---|---|
| `hunksIn` | keeps each file's removed lines beside its added ones, as `{ added, removed }` |
| the file | each `diff --git a/<x> b/<y>` line opens a file, named `<y>`, or `<x>` where the header says `deleted file` |
| the content | a `+` or `-` line counts only past an `@@` line of that file, so no header line reads as content |
| `codeIn` | a hunk asks for a test where a line either side is code, or where it adds nothing and takes code away |
| `names` | reads the added lines of a test, as before |
| the comment-only case | a comment traded for a comment passes, the way a pointer fix trades one |
| the mixed cases | a code line added beside a comment refuses, and a code line traded for a comment refuses |
| the header case | a comment-only delta over two files passes, so the second file's `--- a/` line reads for neither |
| the deleted case | a comment-only fix staged beside a deleted module asks a test for the module alone |
| the content case | a removed line reading `--x` inside a hunk counts as code |
| the note | `spec/design_output/tree#the-rules-over-two-files` names the removed lines beside the added |

The callers of `untestedIn` read its list of files alone, so they change nothing:

- `src/scripts/precommit.js`, the commit door
- `src/bridge/bash.js`, the door over a commit the agent runs

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- Design: `hunksIn` keeps the last `+++ b/` file through a deleted file's hunk.
- A deleted file ends its header with `+++ /dev/null`, and that line sets no file.
- Its removed code then lands under the file above it, and that file asks a test.
- A comment fix beside a deleted module then refuses, and the ask says it passes.
- Fix: name in the `hunksIn` row that each `diff --git` line resets the file.
- Fix: add a case with a comment fix and a deleted module, and assert the fix passes.
- Craft: skip `--- a/` and `--- /dev/null` alone, so a removed `--x` line still reads.
- The earlier findings stand answered: the removed lines, the trade case and the `---` header.
- The rest stands: the callers, the note, and `names` over the added lines.

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
