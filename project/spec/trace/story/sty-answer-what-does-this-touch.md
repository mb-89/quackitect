---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: sty-answer-what-does-this-touch
type: "[[story]]"
statement: When an agent needs to answer what a decision touches, without already knowing which of the corpus's roughly 300 files holds it, I want a structured query over nodes and edges, so I can get back exactly the matching rows or a named refusal instead of a silent miss.
actor: stk-agent
refines:
  - vp-the-ledger
priority: must
---

## Deck

An agent needs to answer what a decision touches. The corpus holds roughly 300 trace files, and nothing but grep tells it where to look.
|||


---

The agent has se_file_search and se_file_glob only. Both find matching TEXT, never a typed row with named fields — this iteration's own frame-delta needed four such calls just to find one resident value-prop file.
|||


---

The agent asks the query verb for every node of kind decision whose statement or edges touch the topic, naming exactly the fields it wants back: id, statement, decided_in.
|||


---

The verb returns filtered rows — only the matching nodes, only the named fields — instead of a directory to search by hand.
|||


---

The agent asks for a field that does not exist on that node type. The verb refuses by name and lists the fields that do exist, instead of returning an empty or wrong result.
|||


---

The agent follows one returned id to its file and reads the decision's own rationale. What used to cost four search calls across 300 files now costs one structured query and one read.
|||

