---
id: req-runme-orientation
type: requirement
statement: The RUNME scripts shall install and verify the toolchain and print orientation, and shall create no project - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The RUNME scripts shall check the prerequisites, install what is missing, and verify the result on both platforms (Windows via Winget, Linux via the package manager).
2. When the toolchain verifies, the RUNME scripts shall print a short orientation naming the next steps a user takes to start a project of their own.
3. If a RUNME script completes, then it shall have created no workspace and no project - a deterministic installer carries no LLM and cannot meaningfully author one.

## Rationale (not load-bearing)
Owner correction 2026-07-12 (NOTE-20260712-113045), revising the shipped i18 scripts, which
still create a demo workspace and render a board. RUNME slims to install + verify + orient;
the walkthrough DECK is where a newcomer sees a project happen (req-pong-deck), and the
orientation text hands over to it.
