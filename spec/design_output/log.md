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
| `level0` | the session starts, and the canary comes back | `session.start`, `turn.complete` |
| `tool` | every call a tool takes | `tool.call` |
| `prompt` | every prompt, as submitted | `prompt.submit` |
| `stop` | a turn ends, or goes on | `turn.complete` |
| `write` | the code door refuses a write | `tool.call` |
| `vale` | the rules refuse prose, and how long a lint takes | the hook, and `lint` |
| `judge` | a model refuses prose | `tool.call` |
| `bash` | a commit or a push aims at trunk | `tool.call` |
| `work` | a branch verb answers, and the branch it stands on | `work.js` |

# What a tool line names

The `tool` door writes one line per call, and the line names the tool and one
field. That field says what the call aims at:

| tool | field |
|---|---|
| a write | the path |
| Bash | the command |
| a search | the query |
| a fetch | the url |

`aimOf` reads them in that order and answers the first the call carries, and a
call carrying none says its own name. A web search and a web fetch write the
line every other tool writes. So the query and the url stand where a person
already looks.

`turn.step` stays out. A transcript holds a turn's steps already, so a line per
step buys a second copy of what stands elsewhere.

The write door and the trunk guard write their own lines. The `tool` line goes
down first, and the door adds what it refuses beneath it.

# What a box writes

`spec/config/level0.json` takes a `log` object naming the level:

    "log": {
      "level": "info"
    }

| level | writes |
|---|---|
| `info` | everything, and this is the default |
| `warn` | a refusal and a fault |
| `error` | a fault |

A level the reader does not know reads as `info`, and a missing object reads as
`info`. So a box configuring nothing writes everything. `writes` decides, the
door asks it before the line lands, and the hook asks it too.

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

# Nothing here deletes a log

A session file closes when its session ends, so nothing rotates it, and the
folder grows. A retro owns deletion, this tree carries no retro, and a person
removes what a retro reaches.

A growing folder costs less than a folder swept empty under a person
mid-diagnosis. So no code path in this tree deletes a log file, and `grep`
answers that in one line:

    grep -rn "remove\|unlink\|rm -" --include=*.js src .claude/skills

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

# The viewer learns this tree

`src/scripts/lnav-reads.js` hands lnav the format, the theme, and the choice of
theme. Node runs it, because the Windows build fails under a shell parent and
answers 0 anyway. So the script reads the theme back, and trusts no exit code.

The installer calls it once and stamps `.se/bin/.lnav-reads-this-tree`. Deleting
that stamp asks for the three again.
