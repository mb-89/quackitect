---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: engine-verbs-hold/accept
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
parent: engine-verbs-hold
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 6cdd4bb4ca5ee62e0eab06a21024fe2224cc2b68
    hash_after: 0b10cddd1274b26af285fc9411fe873a5ff8976f
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "   55.7  in all"
    inputs:
      - name: ask
        hash: 08338115480ea2b5
        size: 158
    def: 6b3cd8b993bfc9f5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

pullOpens returns a standing pull request untouched, yet done prints it with auto-merge on. Read auto_merge off the list, and enable it where it stands unset.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

cd src && go vet ./branches/ && go test ./branches/ && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

pullOpens now reads node_id and auto_merge off the open pull list. A standing pull request whose auto_merge is null takes the same mutation a new one takes, through autoMerged, which both paths share. One carrying auto_merge takes nothing, so done prints auto-merge on only where it stands on. The dfHub fake records auto_merge on the pull it enables, and a new case runs two fires over one standing pull and sees one mutation and no second pull request.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: auto_merge comes off the list, and the mutation runs where it stands unset
the cleanup: the two standing cases that assert no post now seed auto_merge set, since an unset one takes the mutation by design
one place: the mutation and its error reading stand in autoMerged alone, and both the new and the standing path call it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
