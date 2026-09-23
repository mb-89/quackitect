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
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: the-panel-reads-every-change
step: do
record:
  - step: do
    hand: box 5fb6c1c050cd · claude-code-remote
    hash_before: f06cf79a0b6b2213fe20c54d98478914dd20d05c
    hash_after: f06cf79a0b6b2213fe20c54d98478914dd20d05c
    answered:
      - name: tests
        exit: 0
        said: green, 13 test(s) pass in 1 file(s); green, src/lsp passes
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A rename or a delete on disk redraws both the old path and the new one, off the watcher's own change types. So a moved file leaves no row behind and gains its own.

<!-- breaks, as text: what breaks if it is never done -->
A file moved outside the editor keeps its rows on the old path until a sweep. A person then opens a problem that names no file.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the watcher's delete and create types each redraw their path, which `src/lsp/watch_test.go` covers
- a rename in the editor leaves no row on the old path, read in the problems panel

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Before this change the watcher reads every change alike. A deleted path goes through the rules and the bridge like a changed one, and a folder names nothing under it. `changedIn` in `src/lsp/watch.go` now reads the type each change carries.

| the change | what `refreshes` does |
|---|---|
| a new or a changed file | redraws it off the disk, and asks the bridge again |
| a deleted file | clears its row through `shows`, and no rule reads it |
| a deleted folder | clears every row under it, off `panel.under` |
| a new folder | redraws every file under it, off `filesUnder` |

`panel.paths` holds the union of rows `showsAll` gathers inline before, so both callers read one place. The chapter the code points at carries the table. [[spec/design_output/lsp#the-panel-follows-the-index]]

The check trips on the stub and the vehicle contract tests, outside this ask. The commit ahead of this branch takes both plugin manifests out of git, and the stamp in `src/scripts/brand.js` writes a manifest only where one stands. So a fresh clone carries neither, and the marker every vehicle reads stands nowhere. The stamp now mints a missing manifest from the shape it holds, and the plugin's version reads off `package.json`. The chapter on the brand says so. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]

What I weigh: the done line reading the panel asks a person at an editor, and a cloud box carries none. The rename test drives the frames the editor sends on a rename, and stands in for that reading.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask. The watcher reads its own types, and both paths redraw. The stamp fix stands beside it, because the check refuses the branch without it.
- the cleanup the change reveals is in the change. `panel.paths` takes the union `showsAll` holds inline, and the manifest shapes stand in the change.
- every fact the change adds stands in one place, and a note points at the file. The change types stand in `watch.go`, the manifest shapes in `brand.js`, and each design chapter points at its file.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
