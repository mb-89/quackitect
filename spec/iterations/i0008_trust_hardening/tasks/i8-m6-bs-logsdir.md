---
id: i8-m6-bs-logsdir
statement: Engine-owned log-dir resolution (LOCALAPPDATA/XDG + name-hash slug, config.toml override), migrate the 122 MB under .quack/logs out (count+size verified, foreign folders included), and point the method prompts (review retro, AGENTS) at the new location so future sessions find the logs. Design marker implements req-logs-out-of-repo.
milestone: M6
class: review
killer: false
parent: i8-m6-build
depends_on: [i8-m6-bs-monotonic]
---
