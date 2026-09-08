---
kind: [[handover]]
status: todo
urgency: soon
depends_on: doors-and-fakes
---

# The tree writes a log, and one viewer reads it

Nothing here writes a log. A door refuses a write, and the reason reaches one
session and no further.

This branch gives every door a place to say what it does. It gives a person one
command to read it back.

This brief settles the shape. Follow it, and say in your handback where it
breaks.

## Why the viewer is a download

An earlier line in this project writes its own viewer: 2426 lines of Go over
Bubble Tea, Lipgloss and fsnotify. It carries a flag called `--keys`, whose
help reads "print every key this terminal sends, and nothing else". A flag like
that exists where keys stop working, and the fastest answer is to ask the
terminal.

`jlv` matches the behaviour a person asks for almost exactly, and it runs on
that same Bubble Tea stack. So it is a fair bet to fail the same way.

lnav runs on C++ and ncurses, which fails differently or not at all. It offers
more than a person asks for, which costs a little learning and no correctness.

## What one line looks like

One JSON object per line, and one file per session. lnav reads a directory of
them and merges by time.

| field | holds | on the row |
|---|---|---|
| `at` | ISO 8601 UTC with milliseconds | yes |
| `level` | `info`, `warn` or `error` | yes |
| `door` | who says it: `write`, `bash`, `vale`, `judge`, `work` | yes |
| `said` | one sentence, under 80 characters | yes |
| the rest | `file`, `rule`, `branch`, `tool`, `ms`, `detail` | no |

lnav drops every field the row leaves out onto a detail line beneath it. So a
field earns the row only where a person scans for it.

## Why one file per session

`$.fs` offers `readFile`, `writeFile`, `listDir` and `exists`. It offers no
append and no delete. A writer that appends therefore rewrites the whole file,
and a day file grows until that rewrite hurts.

One file per session bounds the rewrite to one session. The name carries the
time, so a listing sorts by it:

    .se/log/2026-09-08T14-22-51-a6f8c43b.jsonl

## Rotation, which is really a prune

A session file closes when its session ends, so nothing rotates it.

The prune runs at `session.start`, through `$.process.run` calling node, because
`$.fs` deletes nothing. Node stands on every box the installer touches.

- Keep 14 days.
- Keep at most 200 files.
- Drop the oldest first when either cap breaks.

## Where the writer stands

`work/doors-and-fakes` puts one door per outside thing under `src/doors/`, with
a fake for each and a contract test. The log writer is a door, so it follows
that rule:

1. `src/doors/log.js` opens the file and writes it.
2. `src/doors/fake/log.js` holds the lines in memory, so every other test reads
   what a door says without touching a disk.
3. `test/contract/log.js` proves the two answer alike.

Every other door calls the log door. No other door opens a file for itself.

## The verb

`./RUNME.sh log` opens the log.

- With lnav present, run `lnav .se/log/` and inherit the terminal. A TUI wants a
  real terminal, so the runner here cannot capture its output.
- With lnav absent, print the newest file as plain rows, and name the line that
  installs the viewer.
- `./RUNME.sh log --all` opens every file, where the bare verb opens the
  newest.

## lnav, and how it installs

lnav ships a Windows binary. Release 0.14.1 carries
`lnav-0.14.1-windows-x86_64.zip`, alongside macOS and Linux builds. So the
installer takes it the way it takes Vale: one release zip at a fixed version
into `.se/bin`. Winget carries an older candidate build, so leave winget alone.

lnav is a want, not a need. `install.sh` sorts a want from a need in `wanted()`,
and `install.ps1` marks one with `wanted = $true`. Add lnav to both, and let a
box without it keep every other rule.

## The format file, which decides the reading

lnav loads a format from the reader's own folder, and from no project directory.
So the installer runs `lnav -i spec/config/lnav/quackitect.json` once the binary
lands.

    {
      "$schema": "https://lnav.org/schemas/format-v1.schema.json",
      "quackitect_log": {
        "title": "quackitect",
        "description": "one line for each thing a door does",
        "file-pattern": "\.se[/\\]log[/\\].*\.jsonl$",
        "json": true,
        "timestamp-field": "at",
        "level-field": "level",
        "body-field": "said",
        "line-format": [
          {"field": "at", "timestamp-format": "%H:%M:%S.%L"},
          " ", {"field": "level"},
          " ", {"field": "door"},
          " ", {"field": "said"}
        ],
        "sample": [{"line": "{\"at\":\"2026-01-01T00:00:00.000Z\",\"level\":\"info\",\"door\":\"write\",\"said\":\"refused\"}"}]
      }
    }

Read that against the schema before you commit it. `lnav -i` refuses a format it
cannot parse, and it says why.

## What to prove before you call this done

1. A session writes a file under `.se/log/`, and every line parses as JSON.
2. `./RUNME.sh check` passes.
3. The prune drops a file past either cap, under test, against the fake.
4. `lnav .se/log/` draws the rows once the format lands. Say whether a
   detail line opens the way this brief claims.
5. `./RUNME.sh log` still answers with lnav absent.

## What to say in your handback

- Which doors you wire, and which you leave for later.
- What one line costs in milliseconds, at 10 lines and at 500.
- Whether a flush per line holds, or whether a buffer earns its place.
- Whether lnav reads a directory of session files the way this brief assumes.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
