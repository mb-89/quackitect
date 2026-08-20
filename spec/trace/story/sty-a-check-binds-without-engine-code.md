---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: sty-a-check-binds-without-engine-code
type: "[[story]]"
statement: A maintainer adds a conformance check by naming the element it binds to, and it runs on every write from then on without a line of engine code.
actor: stk-engineer-driving-agents
refines:
  - vp-the-engine
priority: must
---

## Deck

A maintainer notices the same mistake for the third time. A design spec names an element that no longer exists, and nothing catches it until somebody reads carefully.
|||
THE THIRD TIME IS NOT A FIGURE OF SPEECH. On 2026-08-16 the sweep's first run against the real corpus found SIX standing breaks of exactly this kind — five option nodes and one register entry carrying a word outside the list their own item template declares. Every one predated any check.

---

TODAY THAT ENDS ONE OF TWO WAYS. Another sentence in the guidance, which was already there and did not hold. Or a change to the engine, which means an iteration.
|||
BOTH HALVES ARE MEASURED. The seed rule stood in the tool's own argument description, unmissable, and was obeyed on 7 of 27 iterations. And the engine change is this row's own iteration — the reason it took one is the reason the story exists.

---

Neither is proportionate. The rule is one line long. The cost of enforcing it should be one line too.
|||
THE SHAPE THE RULE TAKES: `rules: [{key, allows, on_break}]` in the node's own frontmatter. Three keys, one line each. `machines/items/*.md` already carried `checks: [{field, one_of}]` in the same shape, so the vocabulary was not invented for this.

---

WITH THE BINDING IN PLACE the maintainer opens the element node and writes the rule beside what it governs, in the same file, in the shape the trace already uses.
|||
`engine/rules.ts` reads it. `tests/boundrules.test.ts` writes a rule into a fixture element and the next write against that element obeys it — no registration step, no restart.

---

No engine file is touched. No verb is registered. The check exists because the corpus says it does, the same way a machine exists because a drawing says it does.
|||
PROVEN MECHANICALLY RATHER THAN ASSERTED. The case runs `git status --porcelain -- deliverable/engine` before arming the rule and again after it fires, and asserts the two are identical. A claim about "no engine code" that nobody diffed would be exactly the kind of sentence this story is about.

---

The next write that breaks the rule is refused, and the refusal names the element, the rule and the fix. The one after that is refused too, a month later, when everybody has forgotten the conversation.
|||
THE REFUSAL'S OWN WORDS, from a live run: `realization: "reuse" — one of make, per the rule on el-probe-carrying-a-bound-rule`. It names the value, the allowed list, and WHICH NODE'S rule fired — so a reader can go to the rule rather than to the engine.

---

The maintainer added a consequence to the drawing, not a paragraph to a document. That is the same promise the engine already keeps for states and gates, kept one place further down.
|||
AND THE PROMISE HAS A LIMIT THIS SLIDE SHOULD NOT HIDE. A rule that cannot answer inside the write's budget does not bind at the write; it moves to the sweep and REPORTS (`req-a-check-too-slow-for-the-write-moves-to-the-sweep`). A rule declaring no way forward does not arm at all (`req-a-check-names-its-way-forward`), so no maintainer can write a block with no exit.
