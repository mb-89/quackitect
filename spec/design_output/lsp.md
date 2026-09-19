---
kind: [[design_output]]
refines: ["[[spec/design_input/one-server-holds-the-shape]]"]
---

# Scope

`src/lsp` holds a language server of this tree's own. It stands beside Biome,
and draws every finding the battery reads. This note covers the shape a
finding takes, the checker under every front, the two fronts, the port, and
the build.

For the ask, see [[spec/design_input/one-server-holds-the-shape]].

# The panel reads the battery

The panel draws the list `./RUNME.sh check` reads, and a finding standing there
holds a push. The server asks the bridge for that list, so a rule reaches the
editor the way it reaches the check:

| source | draws an open file | draws a closed file |
|---|---|---|
| this server's own checks | this server | this server |
| Vale, through the tense reader | this server | this server |
| Biome | the Biome extension, while a person types | this server |

The Vale extension runs raw Vale, which knows no tense reader. So the
workspace settings hand it a filter no rule passes, and it draws nothing.

A file redraws on four roads:

| road | what redraws |
|---|---|
| the server starts | every file, off this server's sweep and one ask to the bridge |
| the editor opens a file, or a person types in it | that file, off the buffer |
| the editor saves or closes a file | that file, and a save asks the bridge again |
| anything changes a file on disk | that file, off the disk and the bridge |

# The panel follows the disk

At its start the server asks the editor to watch every file under the root.
The editor then names each file that changes on disk, whoever changes it: an
agent, git, or a script. The server redraws each named file off the disk and
asks the bridge again for it, so a finding leaves once its file passes. An open
file follows the editor's buffer, and a change under a folder the battery skips
redraws nothing.

# The config reads absolute paths

Vale matches a section of `.vale.ini` against the path it receives, and an
editor hands it an absolute one. So every section naming a folder opens on
`**/`, and a contract test holds that.
