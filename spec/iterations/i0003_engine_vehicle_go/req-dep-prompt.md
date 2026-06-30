---
id: req-dep-prompt
type: requirement
refines: [uc-vendor-engine]
statement: A dependency-check prompt lists each build and development dependency with its winget install path. When a required tool is missing, the agent consults this prompt and asks the user to install it. Runtime dependencies are none. The build and development list is go (winget GoLang.Go) and the optional git (winget Git.Git).
depends_on: []
class: review
killer: false
---

## Rationale (not load-bearing)
M2. The runtime dependency list collapses to nothing with a Go binary. What remains is the build toolchain. The prompt makes a missing tool a clear, install-able ask.
