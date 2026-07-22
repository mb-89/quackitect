---
id: se.structure
kind: decision
statement: A project is README, spec/, product/, notes/, and .quack/. Keep at most ~5 visible files and folders per level. Dotfolders are exempt. State is not a committed file; the agent reads `quack status` and humans open `quack report`. Quackitect dogfoods itself.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_type: adr
v1_adjudicated_by: human
v1_killer: "true"
v2_amendment: ~5 visible per level, minus .quack
---

## Rationale (not load-bearing)

Heavy machinery hides in dotfolders so a non-technical user sees a handful of folders; spec = the thinking, product = what ships.

## v2 amendment (applied at mint)

~5 visible per level, minus .quack
