---
id: i64-the-diamond-and-the-orchestrator-handove
status: seeded
opened: 2026-08-24T18:13:29.560Z
goal: "The diamond and the orchestrator handover: a marker in the drawing that re-owes the reading as the walk passes it, and an agent that spawns a fresh worker per segment instead of walking the iteration itself."
vision: "THE PROBLEM. A hand that has not read the documents can be told by the machine that it has. The reading credit is per session, so a spawned subagent inherits the CREDIT while its context starts empty and holds none of the READING. The machine then does not serve the documents, and the worker walks on without the method. A compaction does the same thing to a single agent: nothing the engine can observe moves, so the credit stands.\n\nreq-compaction-reowes-the-reading is priority must with breaks_how_badly fatal, and it names this exact failure: \"A compacted agent walks on with the method gone from its head, and nothing notices.\"\n\nTHE DIAMOND. A marker placed in the DRAWING, reusable in any machine. Passing it does two things.\n\n- It DROPS THE READING CREDIT, so whoever pulls next is owed what that state demands.\n- It SAYS A HANDOVER IS DUE, so the current hand stops and the orchestrator spawns.\n\nTHE FIRST EFFECT MUST NOT DEPEND ON THE SECOND, and that is the design's load-bearing property. The machine sees the walk pass the marker by itself. If nobody spawns, if the orchestrator dies, if the same worker simply carries on, the reading is still owed. The diamond degrades safely.\n\nTHE SECOND EFFECT CANNOT BE ENFORCED, and the seed says so rather than letting a later agent discover it. The lane cannot tell two hands apart: one dispatcher serves every agent, `as` is a declared claim that nothing checks, and setReader in deliverable/engine/sessionreads.ts has no callers anywhere in the tree. So a gate reading \"refuse until a fresh hand arrives\" would rest on the hand declaring itself. KEEP THE SPAWN ADVISORY and let the credit drop carry the correctness.\n\nTHE ORCHESTRATOR. An agent entering an iteration becomes the orchestrator and never walks the iteration itself. It spawns one worker per segment, in series, and waits.\n\nWORKERS ARE THE SAME STRENGTH OR STRONGER. There is no weak-and-strong split. This is the difference from the guide and walker split that failed: that design escalated when the walker \"did not do something properly\", which depends on a weak model noticing its own failure — so it fires least often when it is needed most, and it is very hard to diagnose. The owner's account, 2026-08-24: \"it didn't work. It was hard to diagnose.\"\n\nTHE NEW TRIGGER NEEDS NOBODY TO NOTICE ANYTHING. It fires at a marker the machine sees for itself.\n\nTHE HANDOVER, in order.\n\n- The worker reaches the diamond and its pull says it is finished there.\n- The worker sends the orchestrator a WAKE-UP, never a report.\n- The orchestrator pulls, and the machine says where the walk stands: blessed, not blessed, stopped below the dial, or not moved at all.\n- The orchestrator spawns the next worker with a one-line prompt.\n- The worker pulls, is owed the reading, reads what the state demands, and continues.\n\nTHE MACHINE IS THE SOURCE OF TRUTH, NEVER THE MESSAGE. That is what makes a worker dying silently survivable, and it is why no report is needed: the gate already carries the verdict.\n\nTHE BRIEFING IS NEARLY FREE HERE, which is what this framework earns over generic orchestration. Elsewhere a handoff is only as good as the prompt the parent writes. Here the worker pulls and the machine briefs it from the record.\n\nWHAT WAITING COSTS. Context is not lost by waiting; the client holds the message list. What expires is the prompt cache, five minutes by default. A cold wake re-writes the orchestrator's prefix at cache-write rates, which at roughly 30K tokens is about twenty cents on Opus 5. The miss is cheap PRECISELY BECAUSE the orchestrator stays small.\n\nWHAT IS ALREADY ON DISK, uncommitted at seed time, from the 2026-08-24 conversation. A marker written by the SessionStart hook and collected by Session.pull, in deliverable/engine/compaction.ts, deliverable/engine/bin/se-hook-start.ts and deliverable/engine/session.ts, with deliverable/tests/compaction-marker.test.ts and a raised ceiling in deliverable/tests/files.test.ts. The cage matchers were also corrected: `clear` matched two hooks and printed two contradictory openings.\n\nTHAT WORK IS THE SAME LEVER WITH A DIFFERENT TRIGGER. It drops the credit when a hook fires. This iteration should drive it from the walk passing the diamond instead. It was built before the owner had approved a build and should be treated as a starting point, not as a decision.\n\nWHAT IS NOT KNOWN. Whether an orchestrator survives a long wait on a cloud box is unmeasured. A working subagent is activity and probably keeps the session alive, but on 2026-08-24 the lane's own process was replaced during an idle gap between two turns, costing a full re-boot. That should be probed rather than assumed."
inputs:
  - "note-65461691f931"
  - "note-e6ddada02fd1"
  - "req-compaction-reowes-the-reading"
  - "opt-reading-credit-survives-the-engine"
  - "deliverable/engine/sessionreads.ts"
  - "guidance/method/subagents.md"
  - "guidance/method/cloud-runner.md"
depends_on: []
---

# i64-the-diamond-and-the-orchestrator-handove

## Goal

The diamond and the orchestrator handover: a marker in the drawing that re-owes the reading as the walk passes it, and an agent that spawns a fresh worker per segment instead of walking the iteration itself.

## Rough vision

THE PROBLEM. A hand that has not read the documents can be told by the machine that it has. The reading credit is per session, so a spawned subagent inherits the CREDIT while its context starts empty and holds none of the READING. The machine then does not serve the documents, and the worker walks on without the method. A compaction does the same thing to a single agent: nothing the engine can observe moves, so the credit stands.

req-compaction-reowes-the-reading is priority must with breaks_how_badly fatal, and it names this exact failure: "A compacted agent walks on with the method gone from its head, and nothing notices."

THE DIAMOND. A marker placed in the DRAWING, reusable in any machine. Passing it does two things.

- It DROPS THE READING CREDIT, so whoever pulls next is owed what that state demands.
- It SAYS A HANDOVER IS DUE, so the current hand stops and the orchestrator spawns.

THE FIRST EFFECT MUST NOT DEPEND ON THE SECOND, and that is the design's load-bearing property. The machine sees the walk pass the marker by itself. If nobody spawns, if the orchestrator dies, if the same worker simply carries on, the reading is still owed. The diamond degrades safely.

THE SECOND EFFECT CANNOT BE ENFORCED, and the seed says so rather than letting a later agent discover it. The lane cannot tell two hands apart: one dispatcher serves every agent, `as` is a declared claim that nothing checks, and setReader in deliverable/engine/sessionreads.ts has no callers anywhere in the tree. So a gate reading "refuse until a fresh hand arrives" would rest on the hand declaring itself. KEEP THE SPAWN ADVISORY and let the credit drop carry the correctness.

THE ORCHESTRATOR. An agent entering an iteration becomes the orchestrator and never walks the iteration itself. It spawns one worker per segment, in series, and waits.

WORKERS ARE THE SAME STRENGTH OR STRONGER. There is no weak-and-strong split. This is the difference from the guide and walker split that failed: that design escalated when the walker "did not do something properly", which depends on a weak model noticing its own failure — so it fires least often when it is needed most, and it is very hard to diagnose. The owner's account, 2026-08-24: "it didn't work. It was hard to diagnose."

THE NEW TRIGGER NEEDS NOBODY TO NOTICE ANYTHING. It fires at a marker the machine sees for itself.

THE HANDOVER, in order.

- The worker reaches the diamond and its pull says it is finished there.
- The worker sends the orchestrator a WAKE-UP, never a report.
- The orchestrator pulls, and the machine says where the walk stands: blessed, not blessed, stopped below the dial, or not moved at all.
- The orchestrator spawns the next worker with a one-line prompt.
- The worker pulls, is owed the reading, reads what the state demands, and continues.

THE MACHINE IS THE SOURCE OF TRUTH, NEVER THE MESSAGE. That is what makes a worker dying silently survivable, and it is why no report is needed: the gate already carries the verdict.

THE BRIEFING IS NEARLY FREE HERE, which is what this framework earns over generic orchestration. Elsewhere a handoff is only as good as the prompt the parent writes. Here the worker pulls and the machine briefs it from the record.

WHAT WAITING COSTS. Context is not lost by waiting; the client holds the message list. What expires is the prompt cache, five minutes by default. A cold wake re-writes the orchestrator's prefix at cache-write rates, which at roughly 30K tokens is about twenty cents on Opus 5. The miss is cheap PRECISELY BECAUSE the orchestrator stays small.

WHAT IS ALREADY ON DISK, uncommitted at seed time, from the 2026-08-24 conversation. A marker written by the SessionStart hook and collected by Session.pull, in deliverable/engine/compaction.ts, deliverable/engine/bin/se-hook-start.ts and deliverable/engine/session.ts, with deliverable/tests/compaction-marker.test.ts and a raised ceiling in deliverable/tests/files.test.ts. The cage matchers were also corrected: `clear` matched two hooks and printed two contradictory openings.

THAT WORK IS THE SAME LEVER WITH A DIFFERENT TRIGGER. It drops the credit when a hook fires. This iteration should drive it from the walk passing the diamond instead. It was built before the owner had approved a build and should be treated as a starting point, not as a decision.

WHAT IS NOT KNOWN. Whether an orchestrator survives a long wait on a cloud box is unmeasured. A working subagent is activity and probably keeps the session alive, but on 2026-08-24 the lane's own process was replaced during an idle gap between two turns, costing a full re-boot. That should be probed rather than assumed.

## Inputs

- note-65461691f931
- note-e6ddada02fd1
- req-compaction-reowes-the-reading
- opt-reading-credit-survives-the-engine
- deliverable/engine/sessionreads.ts
- guidance/method/subagents.md
- guidance/method/cloud-runner.md
