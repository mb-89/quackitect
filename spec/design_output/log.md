---
kind: [[design_output]]
describes: [[src/doors/log.js]]
---

# What one line looks like

One JSON object per line, and one file per session. lnav reads a folder of them
and merges by time.

| field | holds | on the row |
|---|---|---|
| `at` | ISO 8601 UTC with milliseconds | yes |
| `level` | `info`, `warn` or `error` | yes |
| `door` | who says it | yes |
| `said` | one sentence, 80 characters at most | yes |
| the rest | `file`, `rule`, `branch`, `tool`, `ms`, `detail` | no |

lnav drops every field the row leaves out onto a detail line beneath it. So a
field earns the row only where a person scans for it.

`rowOf` clips `said` to 80 characters and folds its whitespace, and a level
outside the three reads as `info`.

# Which door says what

| door | says | where it stands |
|---|---|---|
| `level0` | the session starts, and what the prune drops | `session.start` |
| `write` | the code door refuses a write | `tool.call` |
| `vale` | the rules refuse prose, and how long a lint takes | the hook, and `lint` |
| `judge` | a model refuses prose | `tool.call` |
| `bash` | a commit or a push aims at trunk | `tool.call` |
| `work` | a branch verb answers, and the branch it stands on | `work.js` |

# Where the writer stands

`src/level0/lib/log.js` shapes a line and reaches nothing. Two writers read it,
because two runtimes write:

| writer | reaches disk through | why |
|---|---|---|
| `src/doors/log.js` | the disk door | the command line builds every door |
| `logHere` in `hooks/level0.js` | `$.fs.writeFile` | the plugin folder carries `src/level0` alone |

The door takes the disk and the clock as arguments, the way the git door takes
the process door. `src/doors/fake/log.js` pairs it with the fake disk, so a test
reads back what a door says and touches nothing.

`$.fs` offers `readFile`, `writeFile`, `listDir` and `exists`. It offers no
append, so each line rewrites the whole file. One file per session bounds that
rewrite to one session, and the name carries the time, so a listing sorts by it:

    .se/log/2026-09-08T14-22-51-a6f8c43b.jsonl

The file appears with the first line a door says. A session saying nothing
leaves nothing behind.

# Rotation, really a prune

A session file closes when its session ends, so nothing rotates it.

- Keep 14 days.
- Keep at most 200 files.
- Keep the newest 20 whatever their age.
- Drop the oldest first when a cap breaks.

The third line is a floor under the first. A fortnight away puts every file
past the age cap, and a folder swept empty leaves a person diagnosing yesterday
with nothing. So the age cap reaches a file only where more than 20 stand.

`dropping` decides, and it reads the time out of each name. The door removes
what it names, and a file outside that naming stays where it is.

`$.fs` deletes nothing, so level zero runs `node src/scripts/prune.js` at
`session.start` through `$.process.run`. That script builds the real doors and
prunes `.se/log`, which it makes where it stands missing.

# The verb

`./RUNME.sh log` opens the log.

| what stands | what the verb does |
|---|---|
| lnav in `.se/bin`, or on the path | runs it over the newest file, and inherits the terminal |
| `--all` beside it | hands lnav the whole folder, which it merges by time |
| no lnav | prints the newest file as plain rows, and names the install |

A TUI wants a real terminal, so the runner hands it the terminal it stands in.

# lnav, and how it installs

Release 0.14.1 ships one zip per platform, and the installer takes it the way it
takes Vale, at a fixed version into `.se/bin`.

| platform | asset | lands as |
|---|---|---|
| Linux | `lnav-0.14.1-linux-musl-<cpu>.zip` | `.se/bin/lnav` |
| Windows | `lnav-0.14.1-windows-<cpu>.zip` | `.se/bin/lnav.exe`, beside `msys-2.0.dll` |
| macOS | brew | wherever brew puts it |

That release carries no macOS zip, so brew answers there, and the command line
reads `lnav` off the path where `.se/bin` holds none.

lnav is a want. `install.sh` sorts a want from a need in `wanted()`, and
`install.ps1` marks one with `wanted = $true`. A box without lnav keeps every
other rule. Winget carries an older candidate build, so the
Windows installer leaves winget alone.

lnav loads a format from the reader's own folder, and from no project directory.
So the installer runs `lnav -i spec/config/lnav/quackitect.json` once the binary
lands. `test/contract/tree.test.js` holds that file to what the door writes.

# The search writes itself down

A web search and a web fetch each write one line under the door `search`. The
query or the url stands on the row, and the rest opens beneath.

An earlier line in this project leaves that duty with the agent. An agent
forgets, and a hook forgets nothing.

# The viewer learns this tree

`src/scripts/lnav-reads.js` hands lnav the format, the theme, and the choice of
theme. Node runs it, because the Windows build fails under a shell parent and
answers 0 anyway. So the script reads the theme back, and trusts no exit code.

The installer calls it once and stamps `.se/bin/.lnav-reads-this-tree`. Deleting
that stamp asks for the three again.
