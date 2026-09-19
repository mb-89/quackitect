---
kind: [[ticket]]
state: open
urgent: true
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
group: the-tree-names-its-things
step: do
---

# Ask

The log viewer draws one window with one thing in it. The design input asks for
a window of tabs, and the log is the first tab. This ticket lands the frame
that holds them. [[spec/design_input/the-window-holds-every-tab]]

The gain is a window a second tab drops into. A tab names itself and draws its
own left side. The frame carries the rest, so the work browser costs a type and
no frame.

Without it every tab grows its own header, its own footer and its own keys. The
window then reads differently in each one.

- the header carries a numbered tab a tab, and `alt+?` at its right end
- a number one to nine opens the tab at that place
- a number past the tabs leaves the open one alone
- the footer carries the floor in four columns at its right end
- the footer carries a funnel beside it while a filter holds
- `go -C src/viewer test ./...` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

    go -C src/viewer test ./...

## check

    ./RUNME.sh check

## says

The window grows a frame. The header is a strip of numbered tabs with `alt+?`
at its right end, and a number one to nine opens the tab at that place. The
column names move out of the header and into the tab, where they stand still
while the rows scroll. A footer carries the floor in four columns and a funnel
beside it, each at a fixed place, dark while its thing stands off.

`tab` says what a tab carries: its name, the left side it draws, what the
details hold, and whether a filter holds in it. The log is the one that stands
today, and a test drives a second one beside it. So the work browser is a type
and no change to the frame.

The keys the header carried move into the help, `alt+l` and the floor among
them. The question mark alone no longer opens the help, so `alt+?` is the one
way there.

## checked

- the change follows the ask: the strip, the numbers, the split and the footer land. The tabs after the log wait for their own ticket
- the cleanup it reveals: the help still reads as one written text. The bands it grows wait for the next ticket
- the frame stands in one place: the design output says it once, and the code points at the anchor

# Discussion

The mouse stays out. The design input names a click on a tab as the open
question, and the branch leaves that ticket free for a person.
