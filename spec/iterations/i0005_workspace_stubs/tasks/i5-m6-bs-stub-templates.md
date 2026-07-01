---
id: i5-m6-bs-stub-templates
statement: Author the drive-from-inside stub templates as one authoring unit — the `quack.cmd` launcher (internal → `.quack\engine.local` → `QUACK_ENGINE`, clear failure otherwise), the committed `AGENTS.md` stub (drive via `.\quack`; prompts via `quack resolve` / `quack guides`), and the `.gitignore` (excludes `.quack/engine.local`, `.quack/engine/`). Realizes req-inside-launcher, req-inside-entry-surface, req-engine-loc-untracked (design markers in the templates).
milestone: M6
parent: i5-m6-build
class: review
killer: false
depends_on: [i5-m6-build-planned]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). One checkpoint: the three stub files are authored together and share one verification; splitting per-file was below the resumability floor. The launcher's label-goto shape was validated in the M5 spike.
