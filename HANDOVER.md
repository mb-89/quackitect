---
kind: [[handover]]
status: done
---

# The survey stands

`.se/tools.json` names where every tool stands on this box, and each caller
reads it. `spec/design_output/tools.md` says what the file holds and who reads
it.

# What stands now

| piece | where |
|---|---|
| the shape, and the rule over it | `.claude/skills/level0/lib/tools.js` |
| the survey, and the reader | `src/scripts/tools.js` |
| the verb `./RUNME.sh tools` | `src/scripts/cli.js` |
| the survey at install | `src/scripts/install.sh`, `install.ps1` |
| the design | `spec/design_output/tools.md` |
| the cases | `test/level0/tools.test.js`, `test/contract/tree.test.js` |

Every caller now reads the survey:

- the command line takes each binary through `whereIs`
- the hooks module reads the file at `session.start`, through `$.fs`
- `./RUNME.sh doctor` prints the survey, and asks no tool for its version
- `src/scripts/lnav-reads.js` finds the viewer the same way

# Where the guess lives

The tree carries no `valeBin`, `biomeBin`, `lnavBin` or `valeLsBin`. One
`guesses(name)` in `lib/tools.js` answers `.se/bin/<name>.exe` and `.se/bin/<name>`, and the
caller takes whichever stands. So the fallback tests the disk in place of the
platform.

`lintText` and `formatText` take the binary from the caller. Handing them none
answers `ran: false`, and the door carries on.

# Where a platform test stays

Three stand, and each one earns it:

| where | why |
|---|---|
| `install.sh`, `install.ps1` | each platform carries its own release asset, and the download comes first |
| `.vscode/settings.json` | the Biome extension reads a map keyed by platform, and reads no survey |
| `spec/config/lnav` | lnav keeps its own folder, and takes the format through `-i` |

`./RUNME.sh doctor` still asks Biome about `lsp-proxy`. That question is about
a capability, and the version beside it comes from the survey.

# What surprises me

- `work take` merges trunk itself, so `work sync` finds nothing to take
- the brief names `src/level0/lib`, and the tree holds `.claude/skills/level0/lib`
- `PATHEXT` says the box is Windows, so the walk needs no platform constant
- Biome refuses `${exe}` inside a plain string, so the shell fixture is a template

# Dead ends

- a program at the top of `src/scripts/tools.js` runs on every import, so the
  survey lives in a cli verb the installer calls
- `command -v` needs a shell, and the process door spawns none, so the survey
  walks the path variable itself

# What I leave

- no script under `.se/scripts`
- `./RUNME.sh check`: 141 cases pass, and the rules pass over the tree
- the merge into `main`, which belongs to a person
