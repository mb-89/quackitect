---
minted_in: i1
id: dsp-boot-and-power
type: "[[design-spec]]"
statement: the engine standing up and lying down, carried by the host bridge, the stop hook, the boot bench and the packager
realizes:
  - el-bootstrap
files:
  - project/deliverable/engine/bin/bench-boot.ts
  - project/deliverable/engine/bin/se-pty.ts
  - project/deliverable/engine/bin/se-hook-stop.ts
  - project/deliverable/engine/bin/package.ts
  - project/deliverable/engine/version.ts
---

## Responsibility

The seam between the engine and the host it lives in: the pty bridge
that keeps a terminal session alive, the stop hook that reports the
session's trail when a host turn ends, and the boot bench that keeps
standing up fast. The packager assembles the shippable archive - the
same tree the export copies, zipped, with the entry README rendered
in - so standing up can start from one file. The shutdown-at-idle countdown and the end-state
trigger land here when they are built — the requirement stands
(req-shutdown-fires-only-idle-or-end), the mechanism is owed.
