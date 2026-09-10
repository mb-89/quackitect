---
kind: [[handover]]
status: held
urgency: soon
depends_on: the-config-holds-numbers
---

# Every rule reaches the panel

Eleven rules stand in `test/contract/tree.test.js`. A person meets each one by
breaking it and reading a stack trace, because a test draws nowhere.

`main` now carries `.vscode/tasks.json`, which runs `./RUNME.sh lint` when the
folder opens and reads every line of it into the Problems panel. So a rule that
reaches `lint` reaches a person, over every file in the tree.

This branch moves the eleven into `lint`. It writes no language server.

# Why no server here

Two facts settle it, both measured on 2026-09-09:

- Vale's script sandbox offers `text` and `fmt` alone. No `os`, no `fs`, no
  `json`. A rule sees the buffer it looks at and nothing else, so a rule
  comparing two files cannot live in Vale.
- A language server diagnoses the documents an editor opens. The owner asks for
  every file in the folder, and that is a sweep.

`lint` already sweeps: it runs Vale over the tree, folds Biome's findings in,
and prints one line each:

    spec/guidance/voice.md:5:1: ShortHeading: A heading holds five words.

Every line of that shape matches the task's pattern. A finding that reaches
`lint` therefore reaches the panel, whoever holds the rule.

# What to build

## Each rule becomes a function

The eleven move to `.claude/skills/level0/lib/tree.js`, free of `node:` imports.
Each answers a list of findings in the shape the tree already uses:

    { file, rule, line, column, message, severity }

`pathInScript` in `lib/scripts.js` answers that shape today, and
`line()` in `lib/refuse.js` prints it. Follow both.

A rule reads what it compares through the disk door, handed in. A test then
drives it against a fake tree and touches nothing.

## `lint` calls them

`lint` gains one loop over those functions, beside the loop it already runs for
`pathInScript`.

A rule with no line to point at answers line 1 of the file it blames. A finding
with no place lands nowhere in the panel.

## The eleven

| the rule | the two things it compares |
|---|---|
| the settings name the binaries this tree installs | `.vscode/settings.json`, the install script |
| the editor draws the rules the write door draws | `.vscode/settings.json`, `.vale.ini` |
| Windows takes the biome extension | `.vscode/settings.json`, the platform map |
| a clone opens with both extensions on offer | `.vscode/extensions.json`, the settings |
| the lnav format reads what the log door writes | `spec/config/lnav`, `lib/log.js` |
| a second stop file adds a rule with no code change | `spec/config/stop`, `lib/stop.js` |
| no code path deletes a log file | every source file |
| a name in git holds five words | every path git holds |
| the survey names every tool the installer installs | `.se/tools.json`, the install script |
| the survey finds the node running it | `.se/tools.json`, the running process |
| every script passes the path rule | every `.sh` and `.ps1` |

The last one stands in `lint` already, through `pathInScript`. Leave it where it
is and count it as the pattern the other ten follow.

# The half drawing live

The task sweeps when the folder opens. Vale draws under the line as a person
types, and three of the eleven can move there as well:

    [formats]
    sh = md
    ps1 = md

Those two lines make Vale read a shell script. A probe rule inside
`install.sh` draws at line 2, so this holds.

With that, `NoPathInScript` becomes a Vale rule, its module goes, and a person
sees the path fault while writing the line. Take this half only once the first
half stands, and say in your handback whether the other two are worth moving.

Watch the double report. A rule held by Vale and by `lib/tree.js` both prints
twice in the panel.

# What leaves the tests

Delete the ten that move. Put a contract case in their place for each. Hand the
function a fake tree that breaks the rule and assert the finding. Then hand it
this tree and assert none.

`test/contract/shape.test.js` is the pattern for a Vale rule, and
`test/level0/tools.test.js` for a function over a fake disk.

# What to prove first

1. `./RUNME.sh check` passes, and it runs `claude plugin validate` for you.
2. Each of the ten answers a finding on a broken tree, under test.
3. `./RUNME.sh lint` prints every one of them in the standard line shape.
4. A person opens the folder and the Problems panel carries them. Break one
   rule on purpose, and say what the panel shows.
5. `check` still fails where a rule fails, so the gate holds.

# What your handback says

- What the ten cost `lint` in milliseconds over this tree.
- Whether the panel reads well, or whether one broken thing floods it.
- Which rules go into Vale, and which of them report twice at first.
