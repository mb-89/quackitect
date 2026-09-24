---
kind: [[ticket]]
state: open
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
group: the-drawing-draws-a-route
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
Install turns the drawing's modules into one script a webview loads, and names the browser a test drives. A person runs `./RUNME.sh` and meets a drawing with no build step of their own. The plan stands in [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]].

<!-- breaks, as text: what breaks if it is never done -->
A webview loads a script alone, and React Flow ships as modules. With no bundle the page loads nothing, and with no browser the check proves no page.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `./RUNME.sh` installs the dependencies the design input names under `src/extension/webview`, which `npm ls --prefix src/extension/webview` decides
- install writes the bundle the page loads, which `ls src/extension/webview/dist` decides
- git ignores the bundle, which `git check-ignore src/extension/webview/dist/route.js` decides
- install resolves a browser in the order the design input names, and `./RUNME.sh doctor` names it
- `./RUNME.sh branch test` is green over the tests covering the resolution

# do

<!-- makes the change, with the test that covers it -->

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
