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
- install writes the bundle the page loads, which `ls .se/.runtime/drawing` decides
- git ignores the bundle, which `git check-ignore .se/.runtime/drawing/route.js` decides
- install resolves a browser in the order the design input names, and `./RUNME.sh doctor` names it
- `./RUNME.sh branch test` is green over the tests covering the resolution

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

Install carries two wants more, and each stops no verb where it fails:

| want | here | get |
|---|---|---|
| `drawing` | the bundler stands beside the webview, and `node src/scripts/bundle.js here` answers zero | `npm install` under `src/extension/webview`, then `node src/scripts/bundle.js` |
| `browser` | `node src/scripts/browser.js` answers zero | `npx playwright-core install chromium` |

`src/extension/webview/package.json` pins the drawing's modules, the bundler, and `playwright-core` for the test the page child writes. `src/scripts/bundle.js` writes `route.js` and `route.css` off `src/extension/webview/route/drawing.js`, and a source newer than the bundle asks for the step again. `src/scripts/browser.js` walks the order the design input names, and the doctor prints its answer on the `browser` row. The tests:

| test | holds |
|---|---|
| `test/level0/browser.test.js` | each step of the order, off a fake disk |
| `test/contract/drawing-bundle.test.js` | the step bundles the entry for real |
| `test/contract/doctor-browser.test.js` | the doctor's row carries the resolver's answer |
| `test/contract/install.test.js` | both wants stand in the loop, and stop no verb |
| `test/contract/tree.test.js` | a webview file imports what the webview's own manifest declares |

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and the discussion names the two departures
- the cleanup it reveals is in the change: `.vale.ini` names both scripts beside `brand.js`, as install roots
- the order stands in the design input alone, and each function points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The bundle lands in `.se/.runtime/drawing`, not under `src/extension/webview`. The lint walk and Biome read every folder but a short skip list, and a bundle inside the source tree meets both as code. The runtime folder stands on every skip list and in the ignore file already, so the ask's two lines naming the place follow it.

The last step of the order runs `playwright-core`, the package the webview pins, in place of `playwright`. It carries the same install command, and the download matches the version the test drives.
