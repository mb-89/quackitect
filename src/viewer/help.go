// What alt+? and alt+f open in the pane: how the window works, and how the
// filter reads. The strip names the tabs, and these say every key.
// [[spec/design_output/viewer#the-help]]

package main

const HelpText = `THE WINDOW

A strip of tabs stands at the top, the open tab on the left, one pane on the
right and the status marks at the foot. The pane shows one of three things, and
the key that opens it closes it again.

  enter          the details of the selected line
  alt+?          this help
  alt+f          the filter

THE TABS

  1 to 9         open the tab at that place

A number past the tabs leaves the open one alone. The filter line takes
letters, so a number types into it while it stands open.

KEYS

  w s            one line up, one line down
  up down        scroll the pane, or move the log while no pane stands open
  pgup pgdn      a whole window up or down
  home           the first line
  end            the newest line, and follow every line arriving
  e              the newest error, and e again the one before it
  alt+l          raise the floor: info, warn, error, fatal, then debug, and round again
  q  ctrl+c      leave

The log and the pane each keep their place, so a person reads a long reply
with the arrows and steps to the next line with s.

FOLLOWING

On the newest line the window follows. Anywhere above it, the window holds
still while lines arrive. end brings it back.

THE COLUMNS

  time           when the line lands, on this box's clock
  level          info in grey, debug dim, and warn, error and fatal in colour
  kind           what it is. A tool line names its tool
  said           one sentence. The details hold the whole text

COLOURS

A prompt stands in yellow, and a reply in green. A warning stands in amber,
an error in red, and a fatal line in magenta. Every other kind wears its own
colour.

THE FLOOR

The window shows the lines at the floor and above. The floor opens at info,
so debug lines stay hidden until alt+l brings the floor round to debug. The
header names the floor beside alt+l, in red while it stands off info.

THE DETAILS

A prompt shows its answer and the reply ending its turn. An answer shows its
prompt, and a reply shows every prompt of its turn. Every other line shows the fields its writer adds.

THE FILTER

alt+f opens a line to type the filter into. While a filter holds, the funnel in
the footer stands red. Clear the line and every line comes back.`

const FilterHelp = `THE FILTER

Type above. The list narrows with every key, and enter, esc or alt+f close
this pane with the filter still holding. Clear the line to drop it.

SHORTCUTS

  alt+q                keep the prompts and the replies: the talk
  alt+shift+f          keep every line of the selected line's kind

A tool line's kind is its tool, as Read or Bash. A shortcut writes the
filter into the line above, so it reads and edits like one typed. The same
shortcut again clears the filter. Each works with this pane shut too.

The language is KQL, the one Kibana uses.

  word                 every column, and every field
  name: value          that column
  name: "two words"    the phrase, in that column
  details: word        anything the details show for that line

COMBINING

  a b                  both. Terms side by side mean and
  a and b              both
  a or b               either
  not a                remove. -a means the same
  (a or b) and c       group with brackets

not binds tightest, then and, then or. The keywords ignore case.

MATCHING

  val*                 the wildcard KQL has
  /pattern/            a regular expression, as Lucene writes it
  name: /pattern/      the same, in one column

Matching ignores case everywhere.

COLUMNS

  time  level  kind  tool  said  text  details

Any field a writer adds answers by its name too, as file: or branch:. A name
no line carries matches nothing.

WHILE TYPING

A half-typed filter keeps the last one that worked, and the line under the
filter says still typing.`
