---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
step: do
record:
  - step: do
    hand: box d891ee20d0d7 · claude-code-remote
    hash_before: 1b0c0be388cd9a42c14fec45061374076c0f6253
    hash_after: 1b0c0be388cd9a42c14fec45061374076c0f6253
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes; green, src/modules/git passes
      - name: check
        exit: 0
        said: "spec/tickets/check-sweep-reads-tracked.md:42:1: ListItem: A sentence in a list item holds 20 words, and this one holds 2"
    inputs:
      - name: ask
        hash: 8af59c19b26bcbe1
        size: 661
      - name: [[spec/design_output/lsp]]
        hash: 6c482c703d22f7c9
        size: 23036
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The check module's sweep reads the files git tracks, as the LSP's sweep does. See [[spec/design_output/lsp#a-pointer-reaches-a-heading]]. The two sweeps then answer the same tree, so the shadow log names a real mismatch alone, and the slice can leave shadow.

Left alone, every scratch note on a box draws a finding the check module holds alone. The shadow log then fills with rows nobody can fix.

- `./RUNME.sh test src/modules/check` passes, with a case seeding an untracked file carrying a fault
- after an untracked note with a fault and a run of `.se/.runtime/bin/se-lsp check`, `./RUNME.sh log --kind shadow` names no new row
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/check src/modules/git

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check sweep read every file the watch mirrors, so an untracked note drew a finding the LSP sweep never drew. The git module now writes git/tracked, the paths git ls-files lists, and the wiring binds it to check.tracked. The sweep walks the tracked paths and the buffers over them alone. The count layers still read the local config file git ignores. A trial with an untracked note carrying a dead pointer ran se-lsp check, and the shadow log named no row.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the sweep skips untracked files, and the git contract proves the list on the fake and on real git
- the cleanup it reveals: the two sweep helpers share one seeding function
- every fact stands once: git/tracked names the list, and the sweep points at the lsp design note

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
