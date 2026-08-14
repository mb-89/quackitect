# Releases

One entry per shipped version, newest first.

## 4.1.0 — 2026-08-14

Fixing how you work no longer means stepping outside your work.

- Find the method wrong halfway through a job and you can correct it where
  you are. The change lands in the one place the method lives, and it applies
  to you at once. Before this it meant leaving the job, editing somewhere
  else, and coming back.
- Where a job runs is now a setting. Pick a separate process for each one -
  the default, so a crash stays with the job that caused it. Or a thread,
  which starts more cheaply. Or neither, which is the plain baseline the
  other two are measured against.
- Choose it with `--mode process`, `--mode thread` or `--mode inline` when
  you start. The panel can store the choice instead, and the next start
  takes it.
- The panel and the editor read the available choices from the system, so
  neither keeps its own copy of the list.
- The system reports its own version again. It had been announcing an old
  one since 4.0.0, in the line it prints at startup and in every call it
  logged. Older entries keep what they recorded.
- Nothing breaks. Everything authored for 4.0.0 keeps working.

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
