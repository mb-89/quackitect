---
id: adr-logs-user-dir
type: adr
addresses: [req-logs-out-of-repo]
adjudicated_by: human
statement: The engine owns canonical log-dir resolution — %LOCALAPPDATA%\quackitect\logs\<slug> on Windows, $XDG_DATA_HOME (default ~/.local/share)/quackitect/logs/<slug> elsewhere, config.toml override wins, slug = workspace dir name + h12(abs-path) prefix — chosen over os.UserCacheDir (droppable-cache semantics for durable research data) and os.UserConfigDir (roaming AppData, wrong for bulk). The 122 MB under .quack/logs migrates once, verified by count+size, foreign folders included.
depends_on: []
class: review
killer: false
---
