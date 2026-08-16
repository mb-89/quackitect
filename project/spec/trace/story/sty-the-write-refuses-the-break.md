---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: sty-the-write-refuses-the-break
type: "[[story]]"
statement: An agent writes a node that breaks a corpus rule, hears it at the write with the line named, and fixes it in one move instead of hunting it four calls later.
actor: stk-agent
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

An agent is deep in a state, writing the fourth of four register entries. It knows the rule about quoting a colon inside a YAML value. Knowing it is not the same as remembering it at the keystroke.
|||
LIVED, 2026-08-16, BY THE AGENT WRITING THIS ROW. The value was `impact: The second is worse: it taxes…`. The rule stood in guidance and had been read that session.

---

The write goes out. Today it comes back `created: true` with a hash, and the agent moves on believing the corpus is sound.
|||
THAT IS WHAT HAPPENED. The write landed, the hash came back, and the walk carried on for four more calls over a corpus that would not parse.

---

Four calls later the next pull throws. `Nested mappings are not allowed in compact mappings at line 9, column 9`. No file is named. No write is named. The walk stops.
|||
THE ERROR VERBATIM, from the pull that stopped. Line and column of a BLOCK, not of a file. Four register entries had been written since the break.

---

The agent goes hunting. Which of the four? Which line? Are the other three carrying it too? Four calls to answer what one refusal would have said.
|||
A SECOND INSTANCE THE SAME DAY COST ELEVEN CALLS. `status: part-closed`, a word outside its key's list, parsed fine and trapped the walk four states later while naming a state that was fine. Three `se_amend` calls were aimed at states that were not the problem.

---

NOW THE SAME MOMENT WITH THE CHECK STANDING. The write goes out. It comes back refused, typed, naming the file, the line, the offending value and the fix.
|||
SE-C-138, from `engine/guard.ts`. Its refusal carries the path, the file's own line number, the offending line's text, and the fix — "quote the value, or check the block's delimiters". `tests/writeguard.test.ts` drives all four.

---

The agent quotes the value and writes again. It lands. One call, and the corpus was never broken — not for four calls, not for a second.
|||
DEMONSTRATED UNPROMPTED ON THIS ITERATION'S OWN WALK. The guard refused a bound-rules fixture that had carried a duplicate `realization` key for months, naming the line, and the fixture was fixed in one move.

---

Nothing was reviewed. Nobody was asked to look. The rule that was read and broken anyway is now a rule that cannot be broken quietly, and the person's time never entered the story at all.
|||
MEASURED AGAINST THE WRITE'S OWN BUDGET. The guarded write answers inside 1000 ms — `tests/writeguard.test.ts` asserts it — and `force` does not clear the guard. A check too slow for the write moves to the sweep instead (`req-a-check-too-slow-for-the-write-moves-to-the-sweep`), which runs 1019 nodes in 327 ms at three engine-chosen moments and needs no verb.
