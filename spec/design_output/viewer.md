---
kind: [[design_output]]
---

# Scope

`src/viewer` holds the log viewer. This note covers the window, its keys, the
filter, and how a line arrives.

# The viewer

`./RUNME.sh log` opens the log viewer in the terminal it stands in. The log sits
on the left, and the details of one row open on the right.

It is a Go program on Bubble Tea, in `src/viewer`. It reads
`.se/log/session.jsonl`, the one file every writer appends to. For details,
see [[spec/design_output/log#every-writer-appends]].

# The keys

| key | what it does |
|---|---|
| `w`, `s` | move up and down the log |
| up, down | scroll the details, and move the log while no details stand open |
| Enter | open the details, and Enter again closes them |
| `alt+?` | open the help in the pane |
| `alt+f` | open the filter in the pane |
| PgUp, PgDn | step a whole window up or down the log |
| Home | go to the first row |
| End | go to the newest row, and follow every row arriving |
| `q`, Ctrl+C | leave |

The log and the details each keep their own place. So a person reads a long
reply with the arrows and steps to the next row with `s`, and both hold.

## E finds the newest error

`e` moves to the newest line at `error`. On an error already, it moves to the
error before it, so pressed again it walks back through them. With no error it
leaves the selection where it stands. The help names it, and the header stays
at three keys.

Following is where the selection stands. On the newest row the window follows,
and anywhere above it the window holds still while rows arrive.

The window carries no status bar.

# The header

Two lines stand above the log at every size. The first names the columns and,
at its right end, the three keys opening the pane: `enter details`, `alt+?
help` and `alt+f filter`. The second is a rule. The header spans the whole
window, so the pane opens under it too.

While a filter holds, `alt+f filter` stands in bold red. A cleared line drops
the filter, and the key goes back to grey.

# The help

`alt+?` shows the help in the pane, and `?` alone does the same. The help
names every key, the columns, the colours, what the details show and how the
filter opens. `help.go` holds it, beside the filter's own text.

# The filter pane takes letters

`alt+f` opens the filter in the pane: a line to type into, and the language
under it. While it stands open, every letter types into the line, `w` and `s`
too, and the list narrows with each key. The arrows scroll the pane. The page
keys, Home and End still step through the log.

Enter, Esc and `alt+f` close the pane, and the filter keeps holding. A person
opens the pane again to change or clear it.

# The filter language

The language is KQL, the one Kibana uses, plus Lucene's `/pattern/`.
`filter.go` reads it, ported from v4.

- A bare word searches the level, the kind or tool, `said`, `text` and every field.
- `name: value` searches one column: `time`, `level`, `kind`, `tool`, `said`, `text`, or any field a writer adds.
- `details: word` searches what the details show for the line.
- `and`, `or`, `not`, `-word` and brackets combine terms, and terms side by side mean `and`.
- `val*` is the wildcard, and `/pattern/` a regular expression.

Matching ignores case. A half-typed filter answers `still typing` and keeps the
last good one. A pattern failing to compile says why, and keeps the last good
one too.

## One key filters the line

- `alt+shift+f` keeps every line of the selected line's kind. On a tool line the kind is the tool, as `Read`.
- `alt+ctrl+f` keeps every line of the selected line's level.

The key writes its filter into the filter line, as `kind: /^prompt$/`, so it
reads and edits like one a person types. The same key on a line of that kind
again clears the filter. The filter pane names both keys, and the header stays
at three.

## A name nobody knows

A column name no line carries matches nothing. A typo matching every line
reads as a filter that works, and a person trusts it.

# The filter holds the selection

A filter keeps the selection where the kept rows still hold it. A selection the
filter drops lands on the first kept row at or after it, and a following
window lands on the newest kept row.

# One row

A row shows the time, the level, the kind and `said`. The level stands blank at
`info`, so a warning or an error is the one level a person sees.

A `tool` row names its tool in place of the kind, as `Read`, `Grep` or `Bash`.
Every row reads `tool` otherwise, and a column saying one word on every row
tells a person nothing.

`ParseRecord` reads the fields every writer writes. For details, see
[[spec/design_output/log#what-one-line-looks-like]]. A line that fails to parse
stands as an `unparsed` row holding its raw text.

# Colours

- A prompt wears yellow in heavy type, on its kind and on its text.
- A reply wears green, in heavy type on its kind.
- A warning wears amber text, and an error red.
- Every other kind wears its own colour, out of `kindColours` in `colour.go`.
- A tool row wears the colour of its tool, out of `toolColours`.

A name both tables leave out takes a spare colour by a hash of the name. So it
wears the same colour every time. A test holds every colour in the two tables
apart.

The selected row wears a bar in the gutter and a grey background.

# The details

The details show the kind and the time to the millisecond, then every field the
writer adds, then the whole text. `text` stands where the writer adds one, and
`said` stands otherwise.

A prompt shows the reply ending its turn, and a reply shows every prompt since
the reply before it. A person adding a prompt mid-turn gets one reply for all of
them. For details, see [[spec/design_output/log#a-reply-beside-its-prompt]].

A long line wraps at the pane's width. A field's value wraps under itself, and a
word wider than the pane breaks where it stands.

# The pane holds still

The details load again when the selection moves, and open at the top. A row
arriving elsewhere leaves them alone. A reply arriving under a held prompt
reaches its details, and the scroll stays where it stands.

# How a line arrives

A writer appends each line the moment it happens. The viewer watches the log
folder, and the operating system wakes it on every write to the session file. A
poll every 250 ms stands behind the watcher.

The tail keeps the bytes it holds and hands over only what follows them.

- The held bytes, then more: the tail hands over the complete lines after them.
- Shorter, and a start of the held bytes: the tail waits for the write to finish.
- Other bytes: the tail starts again at the top.

A line with no newline waits for its end.

## A rotation starts it again

A session start empties the file and writes the new session's first line. The
tail waits on the empty file, and the first line of the new session starts the
window again. So a window staying open moves on to the next session by itself.

# One frame

`logview --frame --size WxH --pane details|help|filter --filter <text> <path>`
draws the window once and prints it. A reader with no terminal sees the same window a person sees.

# The verb builds it

`./RUNME.sh log` builds the viewer into `.se/bin/logview`, and runs it over
`.se/log/session.jsonl`. `viewerOf` in `src/scripts/viewer.js` decides:

| what stands | what the verb does |
|---|---|
| a binary, and a source matching its stamp | runs the binary |
| no binary, or a source moving on | runs `go build`, then the binary |
| a build failing over an old binary | says why, and runs the old one |
| no Go and no binary | prints the session as plain rows |

The stamp is a hash of the `.go`, `go.mod` and `go.sum` files, and a test file
stays out of it. It stands in `.se/bin/.logview-source`. The hash only has to
tell one source from the next, so it is a plain two-lane hash in the module and
imports nothing.

`--plain` prints the rows without the viewer, and `--all` puts every old session first.

Go is a want, and the installer offers it. A box without Go keeps every other
rule.

# The check runs its tests

`./RUNME.sh check` runs `go test ./...` in `src/viewer` after the node tests. A
box without Go says so in one line and goes on.
