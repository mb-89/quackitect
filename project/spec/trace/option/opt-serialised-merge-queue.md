---
id: opt-serialised-merge-queue
type: "[[option]]"
statement: land every branch through one first-in-first-out queue, with conflict resolution tiered by how much judgment it needs
cluster: cluster-the-record-life
found_by: prior-art
source: "How to Run a Multi-Agent Coding Workspace, https://www.augmentcode.com/guides/how-to-run-a-multi-agent-coding-workspace"
---

## Mechanism

Landings do not race. They queue, and the queue merges one at a time so
every merge sees the result of the one before it. The source describes a
four-tier conflict resolution behind the queue, and a watchdog that reports
fleet health rather than leaving a stuck merge silent.

WHAT IT WOULD COST HERE. Today one landing is one merge and nothing
serialises them, which is safe only because one agent walks. The queue is
the mechanism that makes several safe, and it costs a component that
outlives any single walk — something has to hold the queue while nobody is
driving.
