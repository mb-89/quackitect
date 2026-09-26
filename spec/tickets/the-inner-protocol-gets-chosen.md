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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-migration-writes-its-specs
record:
  - step: do
    hand: box d7a540d981d5 · claude-code-remote
    hash_before: 0e1ac0855b2fad632c91be06992d05849d3082e3
    hash_after: 872f44d3931d8cd623a1d8678e78f0dbfd5e82ea
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "spec/tickets/the-inner-protocol-gets-chosen.md:77:1: ListItem: A sentence in a list item holds 20 words, and this one ho"
reason: done
---

# Ask

This ticket answers both questions in the funnel `spec/funnel/the-inner-protocol-stands-open`. One is the protocol between the index and its processes, and the other is how the editor reaches the LSP door.

The `q` core of phase 1 speaks the protocol, and phase 7 builds the door. The cloud decides a question itself, and the owner reads the call at the merge.

- a design note under `spec/design_output` says it, and `./RUNME.sh lint` passes over it
- a rationale under `spec/rationales` argues each answer
- the funnel note leaves the tree, and the model's design input names the answers
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

Both questions of the funnel stand answered, and the funnel leaves the tree.

| the question | the answer | the argument |
|---|---|---|
| the protocol inside | NATS, with the server inside the index, on loopback TCP | [[spec/rationales/the-processes-speak-nats]] |
| the road to the LSP door | the editor starts `quack lsp`, which relays stdio to the doors process | [[spec/rationales/the-editor-starts-quack-lsp]] |

[[spec/design_output/inner-protocol]] maps names onto subjects and names the
header. A gap in the revisions asks for a read again, and a peer from another
build meets a refusal. The model's design input names both answers in its
platform table. The migration's design input and the group's ask point at the
note.

Weighed: `gRPC` gives typed streams, and its schema over an open catalog
carries values as bytes, at the cost of a generator on every box. Every peer is
Go in one module, so the `q` package gives the types. Assumed: a delivery at
most once holds, because a revision gap costs one read.

## checked

- the change follows the ask: the note, a rationale for each answer, the funnel gone, and the design input naming both
- the cleanup it reveals: every link to the funnel now names the note
- the note owns the subjects, and the rationales argue without restating the table


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
