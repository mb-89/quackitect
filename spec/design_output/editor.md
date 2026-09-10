---
kind: [[design_output]]
describes: [[.vscode]]
---

# What the editor runs

Two language servers hold, in the editor, the rules the write door holds at a
write. A person then meets a breach as they type, and the agent meets the same
rule name at the door.

| server | holds | arrives through |
|---|---|---|
| `vale-ls` | every rule in `spec/config/styles/VoiceVale` | the Vale extension, which downloads its own copy |
| `biome lsp-proxy` | every Biome rule over JavaScript and JSON | `.se/bin/biome`, one subcommand |

`./RUNME.sh doctor` names both, and their versions.

# Where the judged rules stay

`spec/config/styles/VoiceJudged` asks a model one question per span. No language
server speaks that, so the editor draws the Vale rules and the door draws the
rest.

# What the tracked settings say

`.vscode/settings.json` and `.vscode/extensions.json` travel with the tree, so a
clone opens with the rules live in the problems panel. Every path in them stands
relative to the workspace folder:

| setting | value | why |
|---|---|---|
| `vale.valeCLI.path` | `.se/bin/vale` | vale-ls spawns Vale with the workspace folder as its working directory |
| `vale.valeCLI.config` | `.vale.ini` | the extension joins a relative path to the workspace root |
| `vale.valeCLI.installVale` | `false` | the pinned 3.20.0 answers, so no second copy arrives |
| `vale.enableSpellcheck` | `false` | spelling sits outside VoiceVale, so the panel matches the door |
| `vale.valeCLI.lintOnChange` | `true` | a rule that draws while typing costs less than one that waits for a save |
| `biome.lsp.bin` | a path per platform | Windows takes `biome.exe`, and the rest take `biome` |
| `biome.configurationPath` | `spec/config/biome.json` | Biome looks for its config at the root, and this tree holds it under `spec` |

`SettingsNameBinaries`, `EditorDrawsWriteRules`, `BiomeOnWindows` and
`ExtensionsOnOffer` weigh both files and hold every row above, so the settings
and `.se/bin` move together. `./RUNME.sh lint` runs them, so a drift lands in
the problems panel of the editor they configure.
For details, see [[spec/design_output/tree#the-rules-over-two-files]].

VS Code holds `vale.valeCLI.path` and `vale.valeCLI.config` at their user-level
value until a person trusts the workspace. Trust the folder on the first open,
and the tracked values apply.

# The asset matrix

`.claude/skills/level0/lib/servers.js` pins the version and names one release asset per
platform. The install scripts ask node for the URL, so the matrix lives in one
place and a test drives it.

| platform | asset |
|---|---|
| Linux x86 | `vale-ls-x86_64-unknown-linux-gnu.zip` |
| Linux arm64 | `vale-ls-aarch64-unknown-linux-gnu.zip` |
| macOS x86 | `vale-ls-x86_64-apple-darwin.zip` |
| macOS arm64 | `vale-ls-aarch64-apple-darwin.zip` |
| Windows x86 | `vale-ls-x86_64-pc-windows-gnu.zip` |
| Windows arm64 | `vale-ls-aarch64-pc-windows-msvc.zip` |

Windows breaks the pattern: x86 ships a gnu target and arm64 an msvc one. A
test holds both, because a guess costs a person one install that fails.

# The doors hold without vale-ls

The Vale extension downloads its own vale-ls into per-extension storage and
checks a SHA-256. It reads `vale.valeCLI.path` for the Vale binary alone, so no
setting points it at `.se/bin/vale-ls`.

So the copy in `.se/bin` serves two readers: `doctor`, and an editor that starts
a server binary by path. A download that fails costs one warning line, and
`./RUNME.sh` goes on, because Vale and Biome carry the doors.

# The agent surface needs nothing

Level zero reads every Write and Edit at `tool.call` and runs Vale, Biome and
the judge there. That door sits inside the harness process and speaks no
language server protocol, so `.claude` takes no editor entry at all.
