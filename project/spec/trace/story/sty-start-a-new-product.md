---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: sty-start-a-new-product
type: "[[story]]"
statement: An engineer standing at the front desk wants to begin a product that does not exist yet, and finds out where a product is chosen.
actor: stk-engineer-driving-agents
refines:
  - vp-systematic-engineering
priority: must
---

## Deck

The engineer is at the front desk of a product they already run. Now they want to begin something else entirely — a different tool, for a different audience.
|||
The general form is uc-begin-a-product, graded must; the demonstration is OWED per reports/rpt-start-a-new-product.md.

---

They say it in their own words: "I want to start a new product. It turns meeting recordings into decisions."
|||
req-desk-takes-plain-words - the desk accepts and routes, no format demanded.

---

THE DESK ANSWERS THE QUESTION THIS STORY EXISTED TO ASK. A product IS a folder. There is no picker and there is not going to be one, because everything a product owns — its spec, its machines, its notes, its whole log — lives in that tree. Choosing a product means opening its folder, and that happened at boot.
|||
The folder rule at the desk: req-desk-states-the-folder-rule, worded at trunk commit 1b239b66 after the fresh-eyes check found it missing.

---

So the desk does the one thing that follows: it scaffolds the new product's folder, and tells them plainly that the new product opens in its own window. The current one keeps running, untouched.
|||
req-begin-says-own-window, in tsp-first-run's verifies set.

---

They open the new folder. The ramp-up story runs again, shorter — the extension is already installed, so the script only starts an engine and opens a workspace.
|||
req-second-product-reuses-install: zero further extension installs.

---

The new front desk greets them with an empty machine and no backlog. They say what they want, and the desk recommends an iteration, because the work has a goal of its own and nothing is open to put it in.
|||
The routing rule: work joins an open record where one fits, and a goal of its own earns a record - contract rule 8 and req-small-fix-joins-open-record's complement.

---

They say yes. The desk seeds the record with the goal, the vision and the inputs already filled from the sentence they just said, so they confirm rather than compose.
|||
se_seed_iteration with the prefill discipline of guidance/craft/ux.md - a prefill is a suggestion the person confirms.

---

Two products, two folders, two windows, one installed engine. Nothing was configured and nothing was shared but the engine itself.
|||
The end-to-end second-product run is the owed piece: reports/rpt-start-a-new-product.md.
