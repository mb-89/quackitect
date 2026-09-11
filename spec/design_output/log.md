---
kind: [[design_output]]
describes: [[src/doors/log.js]]
---

# What one line looks like

One JSON object per line, in one file per session: `.se/log/session.jsonl`.
The viewer reads it. For details, see [[spec/design_output/viewer]].

| field | holds | on the row |
|---|---|---|
| `at` | ISO 8601 UTC with milliseconds | yes |
| `level` | `info`, `warn` or `error` | yes |
| `kind` | what the line is | yes |
| `said` | one sentence, 80 characters at most | yes |
| `text` | the whole text, where `said` clips it | no |
| the rest | `file`, `rule`, `branch`, `tool`, `ms`, `detail` | no |

The viewer shows every field the row leaves out in the details. So a field earns
the row only where a person scans for it.

`rowOf` clips `said` to 80 characters and folds its whitespace, and a level
outside the three reads as `info`. A line written before the rename carries
`door` in place of `kind`, and the viewer reads either.

# A reply beside its prompt

The `prompt` kind carries what the owner submits, and the `reply` kind carries
the answer that ends the turn. Both carry the whole of it in `text`. The details
of a prompt show its reply, and the details of a reply show its prompt.

A reply stands at the turn's end, and the answer stands right under its prompt.

# The answer under its prompt

The hook writes an `answer` line at `info` the moment it finds the session's
answer to a demand. A demand is a prompt, an update a person asks for, or a
hold. The line carries the whole answer in `text` and the demand in `detail`.
The session writes nothing for it, because the cage writes it.

Two more kinds come out of the gate:

- `gate` carries a call the gate warns or refuses, at `warn`.
- `god` carries a refusal god mode passes, at `warn`.

For details, see [[spec/design_output/level0#a-step-carries-the-answer]].

# Which kind says what

| kind | says | where it stands |
|---|---|---|
| `level0` | the session starts, and the canary comes back | `session.start`, `turn.complete` |
| `tool` | every call a tool takes | `tool.call` |
| `prompt` | every prompt, as submitted | `prompt.submit` |
| `stop` | a turn ends, or goes on | `turn.complete` |
| `reply` | every answer ending a turn | `turn.complete` |
| `answer` | a call the gate warns or refuses | `tool.call` |
| `write` | the code door refuses a write | `tool.call` |
| `vale` | the rules refuse prose, and how long a lint takes | the hook, and `lint` |
| `judge` | a model refuses prose | `tool.call` |
| `bash` | a commit or a push aims at trunk | `tool.call` |
| `work` | a branch verb answers, and the branch it stands on | `work.js` |

A line the `log` tool writes carries the kind the agent names.

# A setting writes a line

A key moves in two ways, and each writes a line naming the key and its value:

- The `sidebar` kind carries a press, a run or an edit in the sidebar.
- The `config` kind carries `./RUNME.sh config <key> <value>`, which every slash command runs.

So a hold a button sets and a slash command lifts stands in the log twice, once
per writer. For details, see [[spec/design_output/extension#a-press-writes-a-line]].

# What a tool line names

The `tool` kind writes one line per call, and the line names the tool and one
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
`info`. So a box configuring nothing writes everything. `writes` decides, and
every writer asks it before the line lands.

# Where the writer stands

`.claude/skills/level0/lib/log.js` shapes a line and reaches nothing. Three
writers read it, because three runtimes write:

- `logHere` in `hooks/level0.js`, through `$.fs`
- `src/doors/log.js`, through the disk door, for the command line
- `src/extension/lib/logbook.js`, through the editor door, for the sidebar

The door takes the disk and the clock as arguments, the way the git door takes
the process door. `src/doors/fake/log.js` pairs it with the fake disk, so a test
reads back what a door says and touches nothing.

# Every writer appends

Every writer adds its line to the end of `session.jsonl`, and keeps every line
the others hold there. So the hook, the command line and the sidebar land in
one file, in the order they happen.

- The command line appends through the disk door's `append`.
- `$.fs` offers `read`, `write`, `list`, `exists` and `stat`, and no append. So
  the hook reads the file and writes it back one line longer.
- The editor's file system offers no append either, so the sidebar does the same.

The hook and the sidebar each queue their lines, so one of them writes one line
at a time. `$.fs` refuses a read or a write over 4 MiB, and one session stays
under that.

# A session rotates its file

At session start, the hook moves the last session's file into `.se/log/old`,
named by the time of its first line, and starts `session.jsonl` empty:

    .se/log/old/2026-09-08T14-22-51-a6f8c43b.jsonl

`$.fs` offers no move, so the hook writes the old text to its new name and then
empties the session file. The log keeps every session, and the viewer shows the
current one alone.

# The log tool

Level zero registers `mcp__level0__log`. The agent calls it with a kind and one
sentence, and `text` where one sentence runs short. The hook stamps the time and
appends the line the way it appends its own. So a status or a note the agent
means for the owner lands where the owner reads.

# Nothing here deletes a log

Rotation moves a session aside, so the folder grows. A retro owns deletion,
this tree carries no retro, and a person removes what a retro reaches.

A growing folder costs less than a folder swept empty under a person
mid-diagnosis. So no code path in this tree deletes a log file, and
`NoLogDeleted` reads every source file git holds to say so.
For details, see [[spec/design_output/tree#the-rules-over-two-files]].
