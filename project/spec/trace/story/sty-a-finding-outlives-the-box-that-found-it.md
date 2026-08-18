---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: sty-a-finding-outlives-the-box-that-found-it
type: "[[story]]"
statement: An agent on a machine nobody is watching finds something real, states it once, and the finding is still readable after the box is gone.
actor: stk-agent
refines:
  - vp-what-is-learned-outlives-the-machine
priority: must
---

## Deck

An agent is walking an iteration on a cloud box. Ten minutes in, before it has touched the record at all, it finds three defects that stopped the lane from booting.
|||
A REAL ONE, 2026-08-18: the lane died on `Number("tactical")`, the identity check returned 64 false findings on a host it had never run on, and the reading probe refused an answer quoted verbatim. None of the three is the iteration's subject.

---

It captures each one with `se_note` and keeps walking, because the contract says a stray is a note and you do not leave the state in your hand to chase one.
|||
Three calls, about a minute. `.se/notes.jsonl` now holds three lines and the inbox count reads three.

---

The box is released before anybody drains that inbox.
|||
THIS IS WHERE THE STORY USED TO END. `.gitignore` line 2 is `.se/`, so the notes were never committed and there is nothing to recover. Measured on the i15 run of 2026-08-16: the debt note it filed for the blocker that stopped it is gone, and a search of the whole call log for its ref returns nothing.

---

Now the agent drains each note to the pool as it goes, writing what it found in a sentence somebody else can read, and the mint puts that sentence on trunk.
|||
The raw note stays in `.se/notes.jsonl` and is marked drained. It is not copied and not moved — the option is a new node, AUTHORED from the note, because a raw dump may carry anything and RAW NOTES NEVER ENTER VERSION CONTROL.

---

A week later, on a different machine, an engineer clones the repository and asks the desk what to do next.
|||
The three findings are in the answer, each with what it is and when it comes back. Nobody wrote a report, and nobody had to be present when the box died.

## Unlike

[[sty-capture-a-stray]] is the first slide of this one and stops there: it gets
the finding out of the agent's head and into the inbox. This story is about the
inbox being on a machine that will not exist tomorrow.

[[sty-carry-a-finding-without-stopping]] is about not stalling the walk. It
assumes somebody will be there afterwards to read what was carried. On an
unattended box nobody is.
