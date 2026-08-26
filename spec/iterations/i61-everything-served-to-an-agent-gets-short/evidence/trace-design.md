---
form: trace-design
reopened: 2026-08-24T18:01:32.048Z — The initial trace used a delimiter that treated each files list as one nonexistent path.
amended: 2026-08-24T18:01:09.729Z by agent — Use the node-table list separator so each declared file resolves independently.
by: agent
signed_off: 2026-08-24T18:01:39.328Z
authors: agent
files: null
---

# Evidence form / trace-design

## current_situation

The three i61 behavior changes are implemented. Each design specification names its source and regression coverage.

## design_trace

| node | realizes | files |
| [[dsp-session-guidance-delivery]] | el-walk-engine | deliverable/engine/session.ts · deliverable/tests/pull-offer.test.ts |
| [[dsp-state-entry-form-delivery]] | el-walk-engine | deliverable/engine/stateform.ts · deliverable/engine/session.ts · deliverable/tests/supply-gap.test.ts · deliverable/tests/pull.test.ts |
| [[dsp-blockers-only-stop-behavior]] | el-walk-engine | deliverable/engine/bin/se-hook-stop.ts · deliverable/tests/stophook.test.ts |

## follow_up

Continue through verification and the remaining iteration gates.

## anything_else

