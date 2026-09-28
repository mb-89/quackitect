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
process_hash: d1a6e26348695e24
step: answer
---

# Ask

Does the owner pass `design/tests-red` of [[spec/tickets/sessions-boot-from-the-repo]] as owner, or does that ticket wait on [[spec/tickets/a-rewind-spares-landed-tests]]?

The boot change stands landed, and the check runs green over it. Its note section staled the draft, and the route walked back to `design/tests-red`. That step expects a failing assertion, and the cases pass now. So no agent passes it, and the engine refuses an edit to its frontmatter.

The road to pass it as owner, from the root of a clone on `work/the-cloud-works-its-queue`:

    ./RUNME.sh ticket pull sessions-boot-from-the-repo --owner-says --pass --fields '{"tests":"./RUNME.sh test test/level0/hooks.test.js","red":["test/level0/hooks.test.js"],"seen":"The change landed before the restale, so the cases pass.","checked":"the cases stood red at the earlier tests-red\nthe cases reach the disk and the process through the fakes alone"}'
    ./RUNME.sh push

- `sessions-boot-from-the-repo`, at `design/tests-red`
- the group `the-cloud-works-its-queue`, whose retro the queue hands out behind that ticket
- `branch done` on `work/the-cloud-works-its-queue`

- `sessions-boot-from-the-repo` stands past `design/tests-red`, which `./RUNME.sh ticket route sessions-boot-from-the-repo` shows
- `./RUNME.sh check` exits 0

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
