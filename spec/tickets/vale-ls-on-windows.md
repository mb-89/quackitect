---
kind: [[ticket]]
state: open
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/question]]
process_hash: 1f3006ec4b044a89
step: answer
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->

Does vale-ls find Vale on a Windows desk, and draw its findings in the editor?

[[spec/tickets/the-small-faults-land]] makes the settings rule take `.se/.runtime/bin/vale.exe`. The tracked `.vscode/settings.json` still names `.se/.runtime/bin/vale`. vale-ls finds Vale there only where its spawn resolves `vale` to `vale.exe`, and no box here runs Windows. A person on a Windows desk runs this, in Git Bash at the tree's root:

1. Run `./RUNME.sh tools`, or `./RUNME.sh` where the tree has no install yet.
2. Run `ls -la .se/.runtime/bin`, and note what it holds.
3. Run `./RUNME.sh doctor`, and note the `vale` and `vale-ls` rows.
4. Open the tree in the editor with `code .`, and open `spec/guidance/working.md`.
5. Add a line such as `This is VERY LOUD TEXT HERE, yes.` without saving it.
6. Read the Problems panel, and the Vale channel of the Output panel.

Report back under `## answer`:

- what `.se/.runtime/bin` holds, and whether `vale.exe` stands there
- the `vale` and `vale-ls` rows of the doctor
- whether the Problems panel draws a Vale finding on the loud line
- any error the Vale channel prints, word for word

<!-- waits, as list: one line each, naming what stands still until the answer lands -->

- the tracked `vale.valeCLI.path`, which stays at `.se/.runtime/bin/vale` until the answer lands
- nothing else, because the settings rule takes both names already

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- a person writes the answer under `## answer`, and `./RUNME.sh ticket pull` hands the step behind it on
- `./RUNME.sh lint spec/tickets/vale-ls-on-windows.md` passes
- `./RUNME.sh check` exits 0 on the commit

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
