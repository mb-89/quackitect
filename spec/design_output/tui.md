---
kind: [[design_output]]
---

# Scope

`src/tui` holds the window this tree draws in a terminal. This note covers
the window, its tabs, its keys, the filter, and how a line arrives.

# The viewer

`./RUNME.sh tui` opens the viewer in the terminal it stands in. The window
carries a strip of tabs, the open tab on the left, one pane on the right and a
footer of status marks. The log is the first tab.

It is a Go program on Bubble Tea, in `src/tui`. It reads
`.se/.log/session.jsonl`, the one file every writer appends to. For details,
see [[spec/design_output/log#every-writer-appends]].

## The packages the window holds

One folder holds every file the window builds from today, and a reader wanting
one tab reads them all. These packages part it, and every import runs down:

| the package | what it holds | what it imports |
|---|---|---|
| `src/tui/draw` | `cut`, `pad`, `narrow`, the palette and the styles | nothing of this tree's |
| `src/tui/tree` | the tree and the rows it draws | `src/tui/draw` |
| `src/tui/frame` | `model`, the `tab` interface, and the rendering a tab calls | the draw and the tree packages |
| `src/tui/log` | the log tab | `src/tui/frame` |
| `src/tui/work` | the work tab | `src/tui/frame` |
| `src/tui` | the window, which builds the tab list | the frame and each tab |

The tree files reach the frame through the draw package alone, so they part
first. A tab package reads `model`, so each name it reads takes a capital, and
that reaches every file naming one. [[spec/tickets/the-window-splits-by-tab]]
carries the work.

# The keys

| key | what it does |
|---|---|
| `1` to `9` | open the tab at that place |
| `w`, `s` | move up and down the log |
| up, down | scroll the details, and move the log while no details stand open |
| Enter | open the details, and Enter again closes them |
| `alt+?` | open the help in the pane |
| `alt+f` | open the filter in the pane |
| `alt+l` | raise the floor one level, and round again |
| PgUp, PgDn | step a whole window up or down the log |
| Home | go to the first row |
| End | go to the newest row, and follow every row arriving |
| `q`, `Ctrl+C` | leave |

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

## Alt L raises the floor

The window shows the rows at the floor and above, and opens at `info`. The
ladder is the one the log climbs. For what each level holds, see
[[spec/design_output/log#what-a-box-writes]].

`alt+l` raises the floor one level. From the top it comes round to the bottom,
so the press after the top stands at the opening floor again. A debug row stays
hidden until the floor comes round to it. The filter narrows what the floor
leaves. A row naming no level, or a level nobody knows, stands as `info`, so it
shows at the opening floor.

The footer names the floor at its right end, and the help names the key.

# The header holds the tabs

One line stands at the top, and a rule under it. The line carries the tabs, in
a row, and `alt+? help` at its right end. Those two are the whole header.

A tab draws as its number and its name, as `1 log`. The open tab stands in
blue, and the rest stand grey. `alt+? help` stands in blue while the help is
open.

## A number opens a tab

A number one to nine opens the tab at that place, wherever a field takes no
letters. A number past the tabs leaves the open one alone. Nine tabs is the
ceiling, and a tree wanting a tenth says so then.

The filter line takes letters, so a number types into it, and the numbers reach
the tabs again once it lets go.

## The columns stand still

The column names belong to the tab, not to the header, so each tab names its
own. The log names `time`, `level`, `kind` and `said`, and the line stands
still while the rows scroll under it.

# The window is a split

The left side holds the open tab, and the right side holds one pane: the
details, the help or the filter. The key opening one closes it, and the details
are the resting state. A shut pane gives the whole width to the tab.

`tab` in `tabs.go` is what a tab carries: its name, the left side it draws,
what the details hold, and whether a filter holds in it. So a tab after the log
is a type and no change to the frame.

# The footer carries status

A rule stands under the split, and the marks under it. Each mark stands at a
fixed place, so nothing shifts as one comes and goes, and a mark stands dark
where its thing stands off.

| where | the mark | it stands when |
|---|---|---|
| the right end | the floor, in four columns | always |
| beside it | a funnel | a filter holds in the open tab |

The floor reads as its first four letters in capitals, and wears the colour of
the level it names, so `INFO` stands dark and `WARN` stands amber. The funnel
stands red while a filter holds, and dark otherwise. The list grows as the tree
grows.

# The help reads the cursor

`alt+?` shows the help in the pane, and it is the one way there. The help opens
on three bands, in this order:

| band | what it names |
|---|---|
| `GLOBAL` | every key the window holds, whatever stands open |
| the tab | every key the open tab adds, under the tab's own name |
| the selection | every key the selected thing adds |

So a person pressing `alt+?` reads what to do next, wherever they stand. A band
the window has nothing for goes, and an empty log names no selection band.

Every key comes out of a registration, and no hand writes a second list. A tab
says which bands it adds, so the keys follow the tab a person opens.

| what | where it stands | what it holds |
|---|---|---|
| `act` | `keys.go` | a `key.Binding`, and what the key does |
| `band` | `keys.go` | a name, and a run of acts |
| `bands()` | `keys.go` | the three, out of the window and the open tab |
| `key()` | `keys.go` | the press, over the same three bands |

So a key nobody registers reaches the help nowhere and works nowhere.

The help draws a key a line, its sentence starting at one column, and a long
sentence wraps under itself the way a detail does. `FullHelpView` of the help
bubble draws a group in columns, and it drops a group wider than the width it
takes. The pane is half a window wide, so the window draws the bands itself.

`help.go` holds what no key says: the columns, the colours, the floor, the
details and how the filter reads. It stands under the bands.

# The filter pane takes letters

`alt+f` opens the filter in the pane: a line to type into, the presets the
open tab offers, and the language under them. While it stands open, every
letter types into the line, `w` and `s` too, and the open tab narrows with
each key. The arrows scroll the pane. The page keys, Home and End still step
through the log.

Enter, Esc and `alt+f` close the pane, and the filter keeps holding. A person
opens the pane again to change or clear it.

The pane is the window's, and so are the details and the help. Each tab holds
a filter line of its own, and the line shows the open tab's. One placeholder
stands for every tab, because the strip names the tab.

| under the open pane | what it does |
|---|---|
| a tab switch | keeps the pane, which then draws off the new tab |
| a number | types into the line, so the strip is the road to another tab |
| a press on the strip | switches the tab |
| a press on a row | selects it, and the wheel moves the rows |

| the tab | its presets |
|---|---|
| the log | the prompts and the replies under `alt+q`, and the selected row's kind under `alt+⇧f` |
| the work | the groups of its base file, each under a number with alt: the queue, held, recently done, urgent |

A preset is one row of the pane: its key and its name, and nothing else,
because its filter runs long. The row stands lit while the line holds that
filter. A press on the row presses the preset, the way its key does, and the
tab narrows at once. The pane names each key once, and the language under the
rows names none. For what a press does, see
[[spec/design_output/tree-view#a-preset-carries-its-sort]].

# The filter language

The language is KQL, the one Kibana uses, plus Lucene's `/pattern/`.
`filter.go` reads it, ported from v4.

- A bare word searches the level, the kind or tool, `said`, `text` and every field.
- `name: value` searches one column, and a writer names any field the line carries.
- `details: word` searches what the details show for the line.
- A word joining two terms combines them, and terms side by side mean `and`.
- `val*` is the wildcard, and `/pattern/` a regular expression.

Matching ignores case. A half-typed filter answers `still typing` and keeps the
last good one. A pattern failing to compile says why, and keeps the last good
one too.

## One key filters the line

- `alt+q` keeps the prompts and the replies.
- `alt+⇧f` keeps every line of the selected line's kind. On a tool line the kind is the tool, as `Read`.

The key writes its filter into the filter line, as `kind: /^prompt$/`, so it
reads and edits like one a person types. The same key again clears the filter.
The filter pane names each key as its preset's row, and the strip names none.
The help draws a shift chord with the `⇧` sign, so the row stays short. The
floor under `alt+l` keeps a level, so no key filters by level.

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

- A prompt wears its colour in heavy type, on its kind and on its text.
- A reply wears its colour, in heavy type on its kind.
- A warning and an error each wear a colour of their own, out of the `levels` map.
- Every other kind wears its own colour, out of the `kinds` map.
- A note wears its own colour, on its kind and on its text.
- A tool row wears the colour of its tool, out of the `tools` map.

A person sets every one of those numbers in `spec/config/styles/colours.json`,
and the window reads the file once at start. The file stands under the folder
the Vale styles share, and `loadColours` in `colour.go` holds what it reads.

| the map the file holds | what wears it |
|---|---|
| `kinds` | a kind's row, on both of its columns |
| `tools` | a tool row, named by its tool |
| `levels` | a row at debug, warn, error or fatal |
| `window` | the bar, the rule, the header, the open tab and the selected row |
| `bold` | the names wearing heavy type |
| `spare` | the colour a name both maps leave out falls back to |
| `flags` | a lit flag by its tone, `good` or `bad` or plain `on`, and one `off` |

A kind the text column colours reads its number off the `kinds` map. So the two
columns of one row wear one colour, and the number stands in one place.

A name both maps leave out takes a spare colour by a hash of the name. So it
wears the same colour every time. A test holds every colour in the two maps
apart, and a second test asserts the shipped file holds a colour per kind.

The selected row wears a bar in the gutter and the background the `window` map
names. A colour the file holds nowhere leaves the style plain, so the window
wears the terminal's own and draws on.

# The details

The details show the kind and the time to the millisecond, then every field the
writer adds, then the whole text. `text` stands where the writer adds one, and
`said` stands otherwise.

A prompt shows the reply ending its turn, and a reply shows every prompt since
the reply before it. A person adding a prompt mid-turn gets one reply for all of
them. For details, see [[spec/design_output/log#a-reply-beside-its-prompt]].

A note stands with the prompt holding it:

| the row | what stands under it |
|---|---|
| a prompt | every note between it and the prompt after it, ahead of its answer and after it |
| a note | the prompt above it, the way an answer does |

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

`./RUNME.sh tui` builds the viewer into `.se/.runtime/bin/logview`, and runs it over
`.se/.log/session.jsonl`. `viewerOf` in `src/scripts/tui-build.js` decides:

| what stands | what the verb does |
|---|---|
| a binary, and a source matching its stamp | runs the binary |
| no binary, or a source moving on | runs `go build` into `logview.new`, swaps it in by rename, then runs the binary |
| a build failing over an old binary | says why, and runs the old one |
| no Go and no binary | prints the session as plain rows |

The stamp is a hash of the `.go`, `go.mod` and `go.sum` files, and a test file
stays out of it. It stands in `.se/.runtime/bin/.logview-source`. The hash only has to
tell one source from the next, so it is a plain two-lane hash in the module and
imports nothing.

`--plain` prints the rows without the viewer, and `--all` puts every old session first.

Go is a want, and the installer offers it. A box without Go keeps every other
rule.

# The mouse reaches the window

The window asks the terminal for the mouse, and `src/tui/mouse.go` is the one
place reading where an event lands:

| the event | what it reaches |
|---|---|
| a press on row 0 | the tab under it, or the help at the strip's right end |
| a press on the column names | the sort, which [[spec/design_output/tui#the-columns-stand-still]] covers |
| a press on a list row | that row, as the selection, under any pane |
| a press on the mark before a group | the group opens, or closes |
| a press on a preset's row in the filter pane | the preset, as its key presses it |
| the wheel over the list | the log, three rows a notch |
| the wheel over the open pane | the pane's own scroll |

`mouse.go` reads the geometry the window already holds, so a moving split
carries the mouse with it. `firstRow()` names the row the list opens on, out of
`headWide` and `namesWide`, and `overPane` reads `listWidth()`.

`--mouse=false` leaves the mouse to the terminal. A window holding the mouse
takes the terminal's own text selection. So the switch stands for a person who
wants that selection back, and most terminals give it back under a held shift.

# The work tab

The strip carries the log and the work. The work tab draws every ticket this
tree holds in the tree view, nested under its group. No file stands between
the index and the tab. `spec/views/work.base` says the columns, the letters
and the presets. For the view itself, see [[spec/design_output/tree-view]].

| what the tab holds | where it comes from |
|---|---|
| the rows | `tickets`, which [[spec/design_output/index#the-index-answers-the-tickets]] answers |
| the redraw | `changes`, which [[spec/design_output/index#the-index-fires-on-change]] holds until a sweep |
| the door's port | the standing file the door writes, off the root two folders over the log |
| a door standing nowhere | the binary's own `standing` verb, which puts one up and drops a stale one |
| the places and the branches | `branch list --json`, which [[spec/design_output/work#one-reading-answers-git]] answers, run behind each tree |

A ticket naming another row nests under it, at any depth, and one naming a row
the rows hold nowhere stands at the left. The mark before the name says which
row is a group, so no column says it. A held group and its tickets wear the
`W` letter, off the standing the index answers. A group holding a branch
wears the `C` letter, off the verb's answer. The window's `Init` asks for
the tick from nothing, and each answer hands the tab its tree again.

The table draws the name, the flags and the queue, and it stands as it is
when a pane opens. The nesting says the group, and the details say the step.
The name links to its note. The state leads the flags as its first letter.

The queue is an outline the pull owns, and git holds the branches. So the
tab runs the verb behind each tree the index hands over, and lays its answer
over the rows. `workplaces.go` holds that road, and a verb answering nothing
leaves the last places standing. The tab opens on the queue: the rows
holding a place, sorted by it. So a person's rows stand first, and a closed
ticket stands off it. For the places, see
[[spec/design_output/pull#the-queue-is-an-outline]].

| the part of the details | what it draws |
|---|---|
| the flags | every flag in the column's order, in its own colour |
| the front | the rest of the fields, one a line |
| the ask | the whole ask, with every note link in it clickable |

Nothing off the body draws there, because the name in the table opens the
note.

`workindex.go` holds the road to the door, and `workitems.go` turns the rows
into items. A box with no door and no binary draws the reason in the tab, and
asks again after a pause. So a build landing later reaches the tab with no
restart.

# The work tab takes edits

A person edits a ticket where they read it, and each field a person sets has
a key of its own. The write lands in the ticket's front. The index sees it
and hands the tab its tree again, so the row reads what the note now says.
`workedit.go` and `workplace.go` hold it.

| key | what it does |
|---|---|
| `u` | flip the urgent mark on the row |
| `p`, then a digit | place the row in the queue at that digit, which writes its todo, and the same digit again takes the todo off. For the rule, see [[spec/design_output/pull#a-todo-forces-a-place]] |

The tree view holds a cell edit too, with a column cursor, a key opening the
cell, Enter writing and Esc dropping. The work tab binds no key to it, because
its fields take the keys above and the name is the ticket's own.

The write meets the door the way an agent's write does. The tab reads
`spec/schemas/ticket.schema.yaml` for what a field takes and which field the
verbs own, and it holds no list of its own. For the rule, see
[[spec/design_output/schema#the-verbs-own-their-fields]].

| the column | what an edit meets |
|---|---|
| a field the verbs own, as `state` or `step` | a refusal naming the field, and nothing opens |
| a column the index derives, as `standing` or `says` | a refusal saying the front holds no such field |
| a field a person writes, as `group` | the cell opens, and the completion offers what the schema names |

A refusal draws on the tab's last line, and the next key clears it. An edit
reaches the ticket through the `path` its row carries, and sets the one
top-level field. A value that is empty, or a mark standing off, drops the
field. A value a YAML reader trips on stands quoted, the way the record quotes
its own.

A tree handed over again carries the cursor, the selection and the open groups
across, so a redraw moves nothing under a person's hands.

# A tab the caller names

`./RUNME.sh tui work` opens the window on that tab, and `--tab work` says the
same. `TABS` in `src/scripts/tui.js` names which words stand, and the window
answers `tabNamed` for the same words. A word no tab carries leaves the open tab
where it is.

# A second launch hands over

The window holds a port of its own, one below the bridge's, where the register
hands out none. So one window stands at a time:

| what the launch meets | what it does |
|---|---|
| the port free | opens the door, and draws the window |
| the port held | hands its tab to the window standing, says so, and ends |

`src/tui/door.go` holds both directions in one shape. `openDoor` takes a
`POST /tab` carrying `{"tab":"work"}` and puts a `tabMsg` into the window, and
`tellPort` sends that same shape to a port. So the window reads a tab from
another process, and reaches another port with the words it takes.

The verb calls the door first. `told` in `src/scripts/tui.js` posts the tab, and
a door answering `ok` means a window already stands.

# The check runs its tests

`./RUNME.sh check` runs `go test ./...` in `src/tui` after the node tests. A
box without Go says so in one line and goes on.
