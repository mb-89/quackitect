---
id: sty-reading-cannot-be-skipped
type: "[[story]]"
statement: When the method says an agent must read something first, I want the machine to know whether it actually did, so the step downstream is not built on a polite yes.
actor: stk-agent
refines:
  - vp-systematic-engineering
killer: true
---

## Deck

Every agent claims to have read the brief. Nothing in an ordinary setup can tell a real read from a polite yes, and the whole method downstream rests on that answer.
|||

---

The pull answers `read` and hands over ONE document, whole, inside the payload. There is no path to fetch and nothing to skim.
|||

---

The proof it asks for is the document's LAST words. A host that truncated the text cannot produce them, because truncation eats the end.
|||

---

A wrong answer credits nothing, and the same document comes back. Reading it is the only way past.
|||

---

When the loop stops handing documents, everything owed is in hand — by construction, not by promise.
|||
