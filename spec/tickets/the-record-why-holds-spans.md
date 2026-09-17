---
kind: [[ticket]]
state: closed
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
step: do
record:
  - step: do
    hand: box d42624a67d18a8 · claude-code
    hash_before: 1990302c6f10f3618c9db0286c5b661a70107f71
    hash_after: 69cfbfdb12a011ea913fca3bf32c0836f1af560c
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: 70 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A hand writes its ticket again after a failed review. The door reads the record as the verbs wrote it.

<!-- breaks, as text: what breaks if it is never done -->
A verdict joins its findings into one `why` line, and a person step joins them into one `asks`. Code spans past the cap there lock the ticket and turn the check red. A hand meets a refusal over a line the ticket door keeps for the verbs. So the branch reaches `branch done` nowhere, and the payload road carries the work alone.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the prose rules read the body of a note, and leave its frontmatter to the schema
- a case drives the rules over a record holding seven code spans in one `why`
- the fix names one home: the rule that reads frontmatter, or the writer that joins the findings
- `./RUNME.sh check` answers 0 on `work/the-hand-carries-a-step`, which four such lines hold red

# do

<!-- makes the change, with the test that covers it -->

## tests

    node --test test/contract/paragraph.test.js > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

The schema says which frontmatter fields hold prose, and the rules read those alone.

Two sessions met this defect at once. [[spec/tickets/voice-rules-skip-the-record]] carries the finding and the road the owner picked. That change landed on trunk before this ticket reached a hand, so what this ticket adds is the case the ask calls for.

`test/contract/paragraph.test.js` drives Vale over a record, and holds both halves:

| the field | what the rules do |
|---|---|
| `why` in a record entry, holding seven code spans | passes, because the verbs write it |
| `asks` on a person step, holding seven | passes, for the same reason |
| `says` holding seven | refused, because the schema calls it prose |
| `does` holding seven | refused, for the same reason |
| the body holding seven | refused, as it always did |

The fix names one home: the rule that reads the frontmatter. The writer that joins findings stands as it was, so a judge writes what it saw and no rule over prose reads it.

`work/the-hand-carries-a-step` merged on trunk, which is what the last line of the ask asks for.

## checked

- the change follows the ask. The ask wanted the case, and the rules already read the frontmatter the way it asks.
- the cleanup stands as a note. The says above names the duplicate, so a reader meets one story.
- every fact stands in one place. The other ticket holds the road, and this one holds the case.

# Discussion

A cloud box minted this ticket while a desk session met the same wall on `work/the-hand-carries-a-step`. Neither knew of the other, and both read the defect the same way.

The branch itself carried a third reading. Its `snippets.js` held a `FRONT` constant blanking the whole frontmatter, with a comment naming the cause. So three hands found one defect, and each wrote its own answer.

The owner picked the road: the frontmatter answers to its own schema, and the schema says which fields hold prose. `FRONT` now reads `frontless(scope)`, so the branch's shape stands and the blunt blanking goes.
