---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: branch-done-opens-the-pr/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: engine-verbs-hold
parent: branch-done-opens-the-pr
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 5d7b27fee20d059aba3df40c06560a71b8cf8cf0
    hash_after: 10262488b545ae984aba27894fe1cc3f6052c9cb
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "    1.9  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: f4c6f8868e41f60c
        size: 332
    def: aeb558b18945ff5c
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

a cloud box holds GH_TOKEN and GITHUB_TOKEN but no PULL_TOKEN and no GITHUB_REPOSITORY, so done on a box always takes the no-token road and the pull request waits for the next dispatch run. Weigh a fallback onto GH_TOKEN with the repository read off the origin URL, so the box opens it in the same call as the ask's first line says.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/pull_token_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A pull request now opens on PULL_TOKEN, else on the GH_TOKEN a cloud box holds, and on GITHUB_REPOSITORY, else on the owner and name the origin URL carries. So done on a box opens its pull request in the same call once the parent wires done to the pull road. A run holding neither token still names PULL_TOKEN as missing. The pull on a work branch now takes a tagged ticket first only where it belongs to the branch group, since a tagged child of this group handed itself to the dry probe clone and held the check red.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: the fallback sits in pullToken and hubOf, the one road both the dispatch and the parent done road read.
The cleanup the change reveals is in the change: the test env blanks GH_TOKEN, and the tagged pool on a work branch keeps its group alone, with a test each way in src/pull/pull_tagged_test.go.
The fallback rule stands once, in pullToken and originRepo in src/branches/dispatch_fire.go, and the group rule once, in taggedAmong in src/pull/pull_hand.go.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
