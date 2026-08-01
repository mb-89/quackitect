---
id: e29-fix-today-s-bucket-for-2026-08-01-second-ses
kind: fix
status: open
opened: 2026-08-01T13:03:18.595Z
goal: "TODAY'S BUCKET for 2026-08-01 (second session). Opened to hold the day's small work; the goal gets amended as things join it.\n\nFIRST AND URGENT: the VS Code control bar shows the OLD controls. The owner changed them in e28, restarted the window, and still sees three sliders. product/deliverable/vscode/extension.js hard-codes its own bar (lines 906, 910, 914) while e28 replaced only the ENGINE's bar. The control bar is one fact living in two places, and the copy the owner touches is the one with no test on it. Detail in note-e5b3243b5510.\n\nThe fix: the extension takes its bar from the engine, the way it already takes the card list from /api/cards. The hand-written HTML is DELETED, never edited — editing keeps two copies alive. A test then asserts against what the EXTENSION serves, because all three existing slider assertions read only the engine's output. vscode/ATTACH.md still documents sliders and follows.\n\nThis LANDS ON TRUNK as soon as it is green. The owner is blocked on seeing it, so it does not wait for the close.\n\nNot in here: the Bases table. That is iteration i1, seeded and paused at its kickoff."
---

# e29-fix-today-s-bucket-for-2026-08-01-second-ses

Free prose — the human head of the record. Machine-facing fields stay in the frontmatter.
