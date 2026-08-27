---
id: wt-one-job-has-two-pieces-of-code-doing-it-and-neither-knows-th
type: "[[work]]"
statement: "One job has two pieces of code doing it, and neither knows the other exists. The first keeps a stored index, refreshes only what moved, and watches the tree beneath it. The second walks everything and parses every file afresh on each call, remembering nothing between them. Seven checking cases used the second, which made their file the most expensive in the suite at 33.5 seconds out of 296; a single shared read per file brought that to 3.8. The bigger question is which of the two the drawing surface picks when it renders a table. If it picks the second, every reader waits for a whole parse while the stored index sits untouched beside them."
ready_when: "ready when a sweep opens on whether each job in the system is done by exactly one piece of code"
source: "note-29ae0463afeb"
---

## Why it stands

One job has two pieces of code doing it, and neither knows the other exists. The first keeps a stored index, refreshes only what moved, and watches the tree beneath it. The second walks everything and parses every file afresh on each call, remembering nothing between them. Seven checking cases used the second, which made their file the most expensive in the suite at 33.5 seconds out of 296; a single shared read per file brought that to 3.8. The bigger question is which of the two the drawing surface picks when it renders a table. If it picks the second, every reader waits for a whole parse while the stored index sits untouched beside them.

## When it comes back

ready when a sweep opens on whether each job in the system is done by exactly one piece of code
