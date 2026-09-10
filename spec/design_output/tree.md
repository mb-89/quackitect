---
kind: [[design_output]]
describes: [[.claude/skills/level0/lib/tree.js]]
---

# The rules over two files

Vale hands a rule one buffer. Its script sandbox offers `text` and `fmt` alone,
so a rule weighing a config against the code reading it finds no second file
there.

Ten such rules live in `.claude/skills/level0/lib/tree.js`. `./RUNME.sh lint`
runs each one over the whole tree, beside the rules Vale holds and the rules
Biome holds.

| the rule | the two things it weighs |
|---|---|
| `SettingsNameBinaries` | `.vscode/settings.json`, `src/scripts/install.sh` |
| `EditorDrawsWriteRules` | `.vscode/settings.json`, `.vale.ini` |
| `BiomeOnWindows` | `.vscode/settings.json`, the platform map inside it |
| `ExtensionsOnOffer` | `.vscode/extensions.json`, `.vscode/settings.json` |
| `LnavReadsTheLog` | `spec/config/lnav/quackitect.json`, `lib/log.js` |
| `StopFolderIsData` | `spec/config/stop`, `lib/stop.js` |
| `NoLogDeleted` | every source file git holds |
| `NameHoldsTheWords` | every path git holds |
| `SurveyNamesInstalls` | `src/scripts/install.sh`, `lib/tools.js` |
| `SurveyFindsNode` | `.se/tools.json`, the node running the sweep |

# Why the panel reads them

`.vscode/tasks.json` runs `./RUNME.sh lint` when the folder opens and matches
every line of this shape:

    spec/guidance/voice.md:5:1: ShortHeading: A heading holds five words.

A finding that reaches `lint` therefore reaches the problems panel, whoever
holds the rule. A test draws nowhere, so a rule living as a test alone meets a
person as a stack trace.

# What a rule answers

Each rule takes the tree and answers a list of findings, in the shape every
door in this tree already answers:

    { file, rule, line, column, message, severity }

`line()` in `lib/refuse.js` prints one. `pathInScript` in `lib/scripts.js`
answers the same shape.

A finding names a file that stands on disk, so the panel opens it. A rule with
no line to point at answers line 1, and a rule that finds the offending key
answers the line holding it.

# The tree handed in

`treeOf` builds the reader every rule takes. It holds the disk door, the git
door and the root, and it answers relative paths:

| it answers | what it gives |
|---|---|
| `read(path)` | the text at that path, or the empty string |
| `exists(path)` | whether the path stands |
| `names(folder, end)` | the file names in a folder, by ending |
| `paths()` | every path git holds |
| `words` | the cap `names.words` says |
| `node` | the version of the node running the sweep |

A rule reaches nothing else, so a test hands it a fake tree over `fakeDisk` and
`fakeGit` and touches memory alone.

# When the sweep runs

`lint` runs these rules where it sweeps the whole tree. The task does that, and
so does `./RUNME.sh check`.

Naming a path instead runs Vale, Biome and the script rule over that path, and
leaves the tree rules out. A rule over the whole tree answers the same list
whatever path a person names.

# The script rule draws live

`[formats]` in `.vale.ini` maps `sh` and `ps1` to `md`, so Vale reads a shell
script. `spec/config/styles/VoiceScript` holds one rule over those two
endings, and `NoPathInScript` stands there.

A person then meets the path fault under the line as they type, and the
command line meets the same rule name. `lib/scripts.js` holds `SCRIPT`, the
ending pattern the walk reads, and nothing else.

For details, see [[spec/design_output/level0#the-rules-vale-cannot-hold]].

# What stays outside

Three of the ten weigh a config against a constant this tree holds in
JavaScript: the extension ids, the platform map and the binary paths. Moving
one into Vale copies that constant into a rule file, and a second copy is a
defect.

So they stay here, where one copy answers them all.
