---
id: structure
statement: A project is README, spec/, product/, notes/, and .quack/. Keep at most ~5 visible files and folders per level. Dotfolders are exempt. State is not a committed file; the agent reads `quack status` and humans open `quack report`. Quackitect dogfoods itself.
type: adr
addresses: [command-surface]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)

Heavy machinery hides in dotfolders so a non-technical user sees a handful of folders; spec = the thinking, product = what ships.
