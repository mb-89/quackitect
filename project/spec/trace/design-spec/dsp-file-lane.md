---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: dsp-file-lane
type: "[[design-spec]]"
statement: reading, writing, searching and running inside the root, carried by compare-and-swap writes and root-relative paths
realizes:
  - "el-walk-engine"
files:
  - "project/deliverable/engine/files.ts"
  - "project/deliverable/engine/signals.ts"
  - "project/deliverable/engine/paths.ts"
  - "project/deliverable/engine/resolve.ts"
  - "project/deliverable/engine/search.ts"
  - "project/deliverable/engine/move.ts"
  - "project/deliverable/engine/run.ts"
  - "project/deliverable/engine/web.ts"
  - "project/deliverable/engine/gitlane.ts"
  - "project/deliverable/engine/jsonio.ts"
  - "project/deliverable/engine/hash.ts"
  - "project/deliverable/engine/model-fs.ts"
  - "project/deliverable/engine/bin/outward-search.ts"
  - "project/deliverable/engine/bin/se-hook-websearch.ts"
---

## Responsibility

The file half of the lane: reads with content hashes, writes as
compare-and-swap, atomic multi-file patches, the search with intent,
the allowlisted git verbs, command runs with captured output, and the
two doors out of the root — a committed ref and a declared root.

## Behavior and constraints

- A write lands only against the hash of the latest read.
- Bound paths resolve into the record's worktree.
- The web and search hooks log every outbound query.
