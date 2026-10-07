---
kind: [[design_output]]
---

# Scope

`.vscode` starts the servers holding this tree's rules as a person types. This
note covers those servers, the settings git tracks, and the assets they want.

# What the editor runs

Two language servers hold, in the editor, the rules the write door holds at a
write. A person then meets a breach as they type, and the agent meets the same
rule name at the door.

| server | holds | arrives through |
|---|---|---|
| `quack lsp` | every Go prose rule, through the tense reader, and the tree's own checks, off the lsp IO module. For details, see [[spec/design_output/lsp]] | the quackitect extension, which asks the bridge for the battery's list |
| `biome lsp-proxy` | every Biome rule over JavaScript and JSON | `.se/.runtime/bin/biome`, one subcommand |

For how the panel draws each source, see
[[spec/design_output/lsp#the-panel-reads-the-battery]].

`./RUNME.sh doctor` names both, and their versions.

# Where the judged rules stay

`spec/config/styles/VoiceJudged` asks a model one question per span. No language
server speaks that, so the panel draws the Go rules and the door draws the
rest.

# What the tracked settings say

`.vscode/settings.json` and `.vscode/extensions.json` travel with the tree, so a
clone opens with the rules live in the problems panel. Every path in them stands
relative to the workspace folder:

| setting | value | why |
|---|---|---|
| `biome.lsp.bin` | a path per platform | Windows takes `biome.exe`, and the rest take `biome` |
| `biome.configurationPath` | `spec/config/biome.json` | Biome looks for its config at the root, and this tree holds it under `spec` |

`.vscode/extensions.json` offers the Biome extension, and
`bierner.markdown-mermaid`, which draws the Mermaid diagrams of the design notes
in the Markdown preview. `EXTENSIONS` in `.claude/skills/level0/lib/servers.js`
names the list, and the install takes it.

`SettingsNameBinaries`, `BiomeOnWindows` and `ExtensionsOnOffer` weigh both files and hold every row above, so the settings
and `.se/.runtime/bin` move together. `./RUNME.sh lint` runs them, so a drift lands in
the problems panel of the editor they configure.
For details, see [[spec/design_output/tree#the-rules-over-two-files]].

# The agent surface needs nothing

Level zero reads every Write and Edit at `tool.call` and runs the Go rules,
Biome and the judge there. That door sits inside the harness process and speaks no
language server protocol, so `.claude` takes no editor entry at all.

# One command opens the editor

A person takes the tree and runs RUNME, bare. RUNME installs what the tree
needs, links the sidebar, opens the editor here, and shows the quackitect panel.

- `.\RUNME.ps1` runs the install through `RUNME.sh`, then starts `code` itself.
  PowerShell finds `code.cmd` on its own.
- `./RUNME.sh` runs the install, then starts `code` where the path carries one.
- A verb after either hands the verb to the command line, and opens nothing.

The PowerShell entry sets `SE_EDITOR_OPENS`, so `RUNME.sh` leaves the opening
to it and the editor opens once. Before it opens, RUNME writes
`.se/.runtime/show-panel`. For details, see
[[spec/design_output/extension#runme-opens-the-panel]].
