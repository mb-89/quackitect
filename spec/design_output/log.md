---
kind: [[design_output]]
---

# Scope

`src/doors/log.js` writes one line for each thing a door does. This note covers
the shape of a line, who says what, and who reads it back.

# What one line looks like

One JSON object per line, in one file per session: `.se/.log/session.jsonl`.
The viewer reads it. For details, see [[spec/design_output/tui]].

| field | holds | on the row |
|---|---|---|
| `at` | ISO 8601 UTC with milliseconds | yes |
| `level` | `debug`, `info`, `warn`, `error` or `fatal`, and every line carries one | yes |
| `kind` | what the line is | yes |
| `said` | one sentence, 80 characters at most | yes |
| `text` | the whole text, where `said` clips it | no |
| the rest | `file`, `rule`, `branch`, `tool`, `ms`, `detail` | no |

The viewer shows every field the row leaves out in the details. So a field earns
the row only where a person scans for it.

`rowOf` clips `said` to that length and folds its whitespace, and a level
outside the five, or none, reads as `info`. A line written before the rename carries
`door` in place of `kind`, and the viewer reads either.

# A reply beside its prompt

The `prompt` kind carries what the owner submits, and the `reply` kind carries
the answer that ends the turn. Both carry the whole of it in `text`. The details
of a prompt show its reply, and the details of a reply show its prompt.

A reply stands at the turn's end, and the answer stands right under its prompt.

## A prompt is the owner's

`onPromptSubmit` in `src/bridge/answer.js` reads where a prompt comes from:

| the origin | the row | a reply owed |
|---|---|---|
| `composer`, `sdk` | `prompt` | yes |
| any other, a helper's hand-back and a task's notice among them | `agent` | no |

A helper's own turn carries `agentId`, and it answers the agent that starts it.
So its end and its text write no `reply` row, and the owner reads their own
prompts beside the session's replies to them.

# The answer under its prompt

The hook writes an `answer` line at `info` the moment it finds the session's
answer to a demand. A demand is a prompt, an update a person asks for, or a
hold. The line carries the whole answer in `text` and the demand in `detail`.
The session writes nothing for it, because the cage writes it.

Two more kinds come out of the gate:

- `gate` carries a call the gate warns or refuses, at `warn`.
- `god` carries a refusal god mode passes, at `warn`.

For details, see [[spec/design_output/level0#a-step-arrives-late]].

# Which kind says what

| kind | says | where it stands |
|---|---|---|
| `level0` | the session starts, and the canary comes back | `session.start`, `turn.complete` |
| `tool` | every call a tool takes | `tool.call` |
| `prompt` | every prompt the owner submits | `prompt.submit` |
| `agent` | a helper's hand-back, a task's notice, and a helper's layer | `prompt.submit`, `agent.spawn` |
| `stop` | a turn ends, or goes on | `turn.complete` |
| `reply` | every answer ending a turn | `turn.complete` |
| `answer` | the session's answer to a demand | `turn.step`, `tool.call` |
| `write` | the code door refuses a write | `tool.call` |
| `vale` | the rules refuse prose, and how long a lint takes | the hook, and `lint` |
| `bash` | a commit or a push aims at trunk | `tool.call` |
| `work` | a branch verb answers, and the branch it stands on | `work.js` |
| `context` | the blocks reaching the session, and whether a re-read brings them | `prompt.context` |
| `compact` | a compaction runs, what fires it, and how many messages it keeps | `session.compact` |

A line the `log` tool writes carries the kind the agent names.

# A setting writes a line

A key moves in the ways listed below, and each writes a line naming the key and its value:

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

The ladder is the one Python's logging climbs, and a box writes the lines at
its level and above. The comment on `log` in `spec/config/level0.json` says
what each level writes.

A level the reader does not know reads as `info`, and a missing object reads as
`info`. So a box configuring nothing writes every line a door says, and a debug
line stays off its disk until it asks for it. `writes` decides, and every
writer asks it before the line lands.

The server reads the level at each event, through the local file, the
environment and the tracked file. So a change to the key reaches the next line.
The viewer holds a floor of its own over what the disk carries. For details, see
[[spec/design_output/tui#alt-l-raises-the-floor]].

# Where the writer stands

`.claude/skills/level0/lib/log.js` shapes a line and reaches nothing. The
writers below read it, one for each runtime:

- `logHere` in `hooks/level0.js`, through `$.fs`
- `src/doors/log.js`, through the disk door, for the command line
- `src/extension/lib/logbook.js`, through the editor door, for the sidebar

The door takes the disk and the clock as arguments, the way the git door takes
the process door. The door writes a row and forgets it. `src/doors/fake/log.js`
pairs it with the fake disk and asks it to keep its rows, so a test reads back
what a door says and touches nothing.

# Every writer appends

Every writer adds its line to the end of `session.jsonl`, and keeps every line
the others hold there. So the hook, the command line and the sidebar land in
one file, in the order they happen.

- The command line appends through the disk door's `append`.
- `$.fs` offers no append, so the hook reads the file and writes it back one
  line longer.
- The editor's file system offers no append either, so the sidebar does the same.

The hook and the sidebar each queue their lines, so one of them writes one line
at a time. `$.fs` refuses a read or a write over 4 MiB, and one session stays
under that.

# A reader reads new rows

A door counting rows of a kind reads the session file past the offset it holds,
through the disk door's `readFrom`. It folds the new whole rows into what it
holds on the box. `tallied` in `.claude/skills/level0/lib/log.js` does
the reading. A fresh box reads the file once from the start, and a file shorter
than the offset reads as a new session. Other writers land rows in the same
file, so the door reads the file and counts no row in memory.

# A session rotates its file

At session start, the hook moves the last session's file into `.se/.log/old`,
named by the time of its first line, and starts `session.jsonl` empty:

    .se/.log/old/2026-09-08T14-22-51-a6f8c43b.jsonl

`$.fs` offers no move, so the hook writes the old text to its new name and then
empties the session file. The log keeps every session, and the viewer shows the
current one alone.

# One verb reads the log

`./RUNME.sh log` answers the rows the log holds, narrowed by the flags below:

| the flag | what it reads | the owner it calls |
|---|---|---|
| `--since <span>` | the rows whose stamp falls inside the span | `spanOf`, under `src/scripts/group.js` |
| `--level <name>` | the rows at that level and above | `writes` and `rank` |
| `--kind <name>` | the rows of that kind | the row's own field |
| `--words <text>` | the rows carrying every word, in any case | `carrying` |
| `--last <count>` | the last rows, after every filter above | the verb itself |
| `--count` | one row a kind, the most first, over the rows the filters keep | `countsOf` |

`./RUNME.sh find --log <words>` hands its words to this verb, because the index
walks no log. `src/scripts/log-read.js` owns the read over the session file and
the rotated ones, and `tui --plain` calls the same one. A span opens every
rotated file named inside it, and the newest one named before it, whose later
rows run into the span. The read drops a torn line alone. The verb narrows what
that read answers, and prints each row through `asRow`.

A span answers seconds, and a row's stamp answers milliseconds. `MS` beside
`timeOf` in `lib/log.js` crosses the two, and every reader takes it from there.

The window's filter language stands elsewhere, and these flags reach for none of
it. Go owns that language, and this verb runs in node before any Go build
stands. For details, see [[spec/design_output/tui#the-filter-language]].

# The log tool

Level zero registers `mcp__level0__log`. The agent calls it with a kind and one
sentence, and `text` where one sentence runs short. The hook stamps the time and
appends the line the way it appends its own. So a status or a note the agent
means for the owner lands where the owner reads.

# An answer stands in chat

- Outcome: the answer to the owner's prompt stands in the chat as text. The hook logs it whole under kind `answer`, and the agent calls nothing for it.
- Cause: an answer through the log tool alone reaches no chat, and the owner reads the chat mid-turn.
- Door: the step carrying the text clears the demand, and a log call of kind `answer` clears nothing.
- Teacher: the warning and the refusal ask for text in the chat, and name no call.

# Nothing here deletes a log

Rotation moves a session aside, so the folder grows. A retro owns deletion,
this tree carries no retro, and a person removes what a retro reaches.

A growing folder costs less than a folder swept empty under a person
mid-diagnosis. So no code path in this tree deletes a log file, and
`NoLogDeleted` reads every source file git holds to say so.
For details, see [[spec/design_output/tree#the-rules-over-two-files]].
