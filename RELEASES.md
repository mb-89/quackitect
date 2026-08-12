# Releases

One entry per shipped version, newest first.

## 4.0.0 — 2026-08-12

Work shares across machines.

- Creating an iteration publishes it to the shared repository at once,
  and any machine there can take it and run it.
- A taken iteration names which machine holds it and for how long. Two
  machines can never hold the same one - the second is refused and told
  who holds it.
- The autonomy control became a ladder of named work types: blocked,
  mechanical, operational, tactical, strategic, ideation. Each rung
  includes the ones below it.
- The waiting screen's offer now includes going idle.
- Newly drawn sub-machines get a placeholder drawing until authored, so
  planning can continue.
- Breaking: drawings authored with the rung words need this version.
  Older versions refuse them.

## 3.0.0 — 2026-08-11

The first packaged v3.

- The engine: the se MCP server — the caged tool lane, the call log, the
  state-machine kernel, the mirror.
- The machines: the rigor matrix, the methods, the forms and the guidance
  the agent is bound by.
- The VS Code extension: the mirror beside the editor.
- The one-time installer: RUNME.ps1 — install, cage, launch.
- Assembled by `project/deliverable/engine/bin/package.ts`.
