---
id: req-logs-out-of-repo
type: requirement
refines: [uc-workspace-hygiene]
statement: The engine shall write session logs to a stable user-scoped directory (LOCALAPPDATA quackitect logs project-slug on Windows; the XDG data dir elsewhere), overridable via config.toml, never to a repo or temp directory; the existing .quack/logs content shall be migrated out once, foreign files included.
depends_on: []
class: review
killer: false
---
