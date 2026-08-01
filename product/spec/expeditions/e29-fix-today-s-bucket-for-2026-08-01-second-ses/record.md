---
id: e29-fix-today-s-bucket-for-2026-08-01-second-ses
kind: fix
status: closed
closed: 2026-08-01T15:49:27.538Z
ruling: applied
report_override: "The owner, in chat this session: \"you can end this expedition, go back to the front desk. When you're done, right, you can write the expedition report yourself.\""
opened: 2026-08-01T13:03:18.595Z
goal: "TODAY'S BUCKET for 2026-08-01 (second session). Opened to hold the day's small work; the goal gets amended as things join it.\n\nLANDED: the VS Code control bar. The extension hard-coded its own bar while e28 had replaced only the ENGINE's, so the owner kept seeing the old sliders. The hand-written HTML is deleted and the bar is now rows built from two panel specs, served by the engine and asserted by a test.\n\nTHE MAIN BODY OF WORK: the Bases-equivalent live table. The owner ruled at the desk on 2026-08-01 that this does NOT get its own iteration. i1-prove-a-bases-equivalent-live-table-can- was seeded and started by an earlier agent against that intent; it stands open with a bound worktree, awaiting the owner's word. The work happens HERE.\n\nWHAT IS WANTED: the view AS THE INSTRUMENT, built and changed and saved from the interface, rather than a renderer for view files somebody else authors. One warm model of every note, its frontmatter and its connections, holding tens of thousands of nodes. The Bases expression language, with a function registry we can extend. Controls that WRITE the .base file, exactly as the cell editor already writes frontmatter.\n\nFILTERING IS THE HOT PATH, RENDERING IS NOT. Cutting tens of thousands of nodes to a few dozen must be fast; painting many rows slowly is acceptable. Today's code re-reads the whole vault per render, which is the opposite, and it gets replaced rather than tuned.\n\nTHE MATRIX IS DEMOTED to one renderer among many and explicitly not an important one. Nothing further gets built on it.\n\nRISK FIRST: the expression language does not exist at all, and filters and formulas both stand on it. It is built first, with the warm model measured at real scale behind it.\n\nDetail: note-b20c4ff82555 and product/spec/bases-syntax.md section 10."
---

# e29-fix-today-s-bucket-for-2026-08-01-second-ses

Free prose — the human head of the record. Machine-facing fields stay in the frontmatter.
