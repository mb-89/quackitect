---
kind: [[ticket]]
state: closed
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
step: do
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: ba5031b2b7321798b156cc8eadc5ee3b187aa9de
    hash_after: ddc0ac1428e9595fadc6aa84fa2a3bea72fbe685
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: 66 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

A person reads whether a link drawn in the terminal opens the thing it names.
The view design asks for links on values this tree resolves, and a click on a
work ticket opening that note in the editor. A person at that terminal answers
both.

Without it the view draws links nobody proves. The design output then picks a
road on a guess, and a reader clicking a name meets nothing.

- a person prints the link escape into the editor's terminal, and says whether it draws as a link
- the same person clicks it, and says what opens
- the same person says whether a path and a web address behave alike there
- the answer stands in this ticket's Discussion, one line a case

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

A person read eight link cases in the editor's terminal, and the Discussion carries what each one drew.

The ask wanted three answers, and they land together:

| the question | the answer |
|---|---|
| does a link draw as a link | an OSC 8 escape draws one, and a bare path draws as text |
| what opens on a click | the note, and the line where the url carries the editor's scheme |
| does a path behave as a web address does | alike under the escape, and apart on the fragment |

The reading closes a guess the view design was standing on. A heading in a `[[note#heading]]` link resolves to a line number before the viewer draws it. The drawing then carries `vscode://file/<path>:<line>` inside the escape.

`.se/scripts/link-click.ps1` prints the eight cases, and git ignores that folder.

## checked

- the change follows the ask. The ask wanted a person's reading, and the Discussion carries it, one line a case.
- the cleanup stands as a note. The roads to a line sit in the Discussion, and the viewer's own change belongs to the ticket drawing it.
- every fact stands in one place. The eight readings sit in this note's Discussion, and the design output points here.

# Discussion

The owner ran the eight cases in the editor's terminal on Windows, and read each one. Four draw as a link and open what they name.

| case | what printed | what the owner read |
|---|---|---|
| 1 | a file path, wrapped in an OSC 8 escape | draws as a link, and opens the note |
| 2 | a web address, wrapped in the same escape | draws as a link, and opens the page |
| 3 | the same path as bare text, no escape | draws as plain text |
| 4 | the same path with `:75`, bare text | draws as plain text |
| 5 | an OSC 8 file url carrying `#L75` | draws as a link, opens the note, and stands at the top |
| 6 | an OSC 8 file url carrying `#discussion` | draws as a link, opens the note, and stands at the top |
| 7 | an OSC 8 `vscode://file/<path>:75` | draws as a link, and lands on line 75 |
| 8 | a web address carrying `#readme` | draws as a link, and lands on the heading |

Cases 3 and 4 answer the first question the ask puts: the escape is what makes a link here. A value this tree resolves draws as a link where the viewer wraps it, and as text everywhere else.

Cases 1, 2 and 8 answer the third: a path and a web address behave alike under the escape. They part on the fragment. A web url carries `#readme` to the heading. A file url reaches the note and leaves `#L75` and `#discussion` behind, so the view stands at the top.

Two roads stand open to a line, and the tree picks between them:

| the road | what it takes |
|---|---|
| an OSC 8 `vscode://file/<path>:<line>` | the absolute path and the editor's scheme, which ties the drawing to one editor |
| an OSC 8 `file://` url with a fragment | cases 5 and 6 close this road |

So a `[[note#heading]]` link resolves its heading to a line number before it draws, and rides the editor's scheme from there.
