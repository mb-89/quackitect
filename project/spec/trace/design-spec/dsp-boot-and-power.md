---
id: dsp-boot-and-power
type: "[[design-spec]]"
statement: the engine standing up and lying down, carried by the host bridge, the stop hook and the boot bench
realizes:
  - "el-bootstrap"
files:
  - "project/deliverable/engine/bin/bench-boot.ts"
  - "project/deliverable/engine/bin/se-pty.ts"
  - "project/deliverable/engine/bin/se-hook-stop.ts"
---

## Responsibility

The seam between the engine and the host it lives in: the pty bridge
that keeps a terminal session alive, the stop hook that reports the
session's trail when a host turn ends, and the boot bench that keeps
standing up fast. The shutdown-at-idle countdown and the end-state
trigger land here when they are built — the requirement stands
(req-shutdown-fires-only-idle-or-end), the mechanism is owed.
