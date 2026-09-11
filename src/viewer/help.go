// What alt+? and alt+f open in the details pane: how the window works, and how
// the filter reads. The header names the three keys, and these say the rest.
// [[spec/design_output/viewer#the-help]]

package main

const HelpText = `THE WINDOW

The log stands on the left, one line per thing that happens. The pane on the
right shows one of three things, and the key that opens it closes it again.

  enter          the details of the selected line
  alt+?          this help
  alt+f          the filter

KEYS

  w s            one line up, one line down
  up down        scroll the pane, or move the log while no pane stands open
  pgup pgdn      a whole window up or down
  home           the first line
  end            the newest line, and follow every line arriving
  e              the newest error, and e again the one before it
  q  ctrl+c      leave

The log and the pane each keep their place, so a person reads a long reply
with the arrows and steps to the next line with s.

FOLLOWING

On the newest line the window follows. Anywhere above it, the window holds
still while lines arrive. end brings it back.

THE COLUMNS

  time           when the line lands, on this box's clock
  level          blank for info, and warn or error in colour
  kind           what it is. A tool line names its tool
  said           one sentence. The details hold the whole text

COLOURS

A prompt stands in yellow, and a reply in green. A warning stands in amber,
and an error in red. Every other kind wears its own colour.

THE DETAILS

A prompt shows its answer and the reply ending its turn. An answer shows its
prompt, and a reply shows every prompt of its turn. Every other line shows the fields its writer adds.

THE FILTER

alt+f opens a line to type the filter into. While a filter holds, alt+f in
the header stands in bold red. Clear the line and every line comes back.`

const FilterHelp = `THE FILTER

Type above. The list narrows with every key, and enter, esc or alt+f close
this pane with the filter still holding. Clear the line to drop it.

SHORTCUTS

  alt+shift+f          keep every line of the selected line's kind
  alt+ctrl+f           keep every line of the selected line's level

A tool line's kind is its tool, as Read or Bash. The shortcut writes the
filter into the line above, so it reads and edits like one typed. The same
shortcut on a line of that kind again clears the filter. Both work with this
pane shut too.

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
