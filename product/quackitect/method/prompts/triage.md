# quack triage — process the inbox

For each note in `.quack/notes/inbox/`, route it to exactly one home. Then move the file.

- **this iteration** — only if it is in scope and the iteration is unlocked. Rare. Usually defer.
- **backlog** — future scope. Move it to `.quack/notes/backlog/`. Add a one-line "ready when…".
- **method** — a process or checklist improvement. Harvest it into the relevant type/rigor template.
- **archive** — done, or a durable rejection WITH its reason. So it is never re-litigated.

Triage runs on trunk. Keep the inbox at zero. A note is never a check until `quack start` bakes it.
