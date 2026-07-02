---
id: uc-workspace-hygiene
type: usecase
refines: [need-workspace-drive]
statement: Engine session logs live in a stable user-scoped directory outside the repo — no repo bloat, no foreign personal data under version control, cross-project searchable, never OS-purged.
class: review
killer: false
---
## Rationale (not load-bearing)
~123 MB sits under .quack/logs today, including foreign trader/sebot session+memory files (personal data). A temp dir is wrong (OS-cleaned); a stable per-user data dir is right.
