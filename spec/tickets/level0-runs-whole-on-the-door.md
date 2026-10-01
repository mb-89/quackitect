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
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Main carries a level zero that loads and reaches its door, yet the rules and the canary never reach the model. The cold probe fails its canary on main since the cage moved to new. The hook drops the named blocks the door hands the prompt context. It also posts every event the door leaves to the bridge, which left the tree. So each box reads LEVEL ZERO ANSWERS NOTHING on every step.

- `node --test test/level0/caged-door.test.js` holds two cases: the prompt context takes the door's named blocks, and no event of a session reaches anything but the hooks door
- `./RUNME.sh probe cold` passes every check, and a new quiet check fails where a row says the server answers nothing past the rules
- `./RUNME.sh check` exits 0
