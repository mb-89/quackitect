---
kind: [[ticket]]
state: draft
urgency: now
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
group: work/the-window-grows-tabs
---

# Ask

The help is one written text today, and a hand keeps it beside the keys the
window reads. The design input asks for three bands out of registered keys.
[[spec/design_input/the-window-holds-every-tab]]

The gain is a help that cannot go stale. A key carries its own sentence, the
window reads that registration, and the help draws it. So a tab adding a key
adds its help line at the same moment.

Without it every tab writes its keys into a second list by hand. The two lists
then drift, and a person reads a key that works nowhere.

- the help opens on a global band, then the open tab's band, then the selection's
- a band the window has nothing for goes
- a key nobody registers works nowhere
- `go -C src/viewer test ./...` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

    go -C src/viewer test ./...

## check

    ./RUNME.sh check

## says

Every key the window holds now stands as a registration. `act` pairs a binding
with what it does, and `band` names a run of them. The window walks the three
bands on a key press, and the help draws the same three. So a key nobody
registers works nowhere, and the question mark alone goes with it.

A tab says which bands it adds. The log adds its rows band and, while a row
stands selected, the band of that row. An empty log names no selection band.

The key lists leave the written help. That text now says what no key says: the
columns, the colours, the floor, the details and how the filter reads.

## checked

- the change follows the ask: three bands, out of the registrations the window reads
- the cleanup it reveals: the written help loses every key list, so a key stands in one place
- the help bubble draws no band, and the design output says why

# Discussion

`FullHelpView` of the help bubble drops a group wider than the width it takes.
A band of sentences is wider than half a window. So the window draws the bands
itself, over the wrapping the details already use.
