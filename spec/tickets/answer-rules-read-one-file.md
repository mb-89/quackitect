---
kind: [[ticket]]
state: draft
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
process: [[spec/processes/standard]]
group: the-engine-fixes-its-faults
---

# Ask

The section `[*answer.md]` in `.vale.ini` holds the chat-answer rules over any file whose name ends that way. `ANSWER` in `.claude/skills/level0/lib/voice.js` names the one file level zero reads, `answer.md`. A ticket named `deliver-checks-the-declared-answer` failed the check under those rules, and took a new name.

The section's glob reaches the file `ANSWER` names alone.

A ticket or note then takes any name, and the answer keeps its tighter rules.

Without it, every name ending in answer meets rules written for a chat answer.

- a case lints a ticket whose name ends in answer, and reads the ticket rules alone
- a case lints the answer file, and reads the answer rules hold
- `./RUNME.sh check` exits 0

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
