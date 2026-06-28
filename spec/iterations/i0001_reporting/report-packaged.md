---
id: report-packaged
statement: `quack report` is wired into the command surface (CMDS in cli.py plus the `/review report` method seam) and runs end-to-end from a clean checkout, producing report.html with no network or Obsidian dependency to generate or open.
depends_on: [report-impl]
class: review
killer: false
---

## Rationale (not load-bearing)
L5/Ship. Forward work. `/review` commissions the deterministic report and may add the
optional human narrative on top (kept visually distinct from the deterministic core).
