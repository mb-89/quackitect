// What alt+? and alt+f open in the pane, under the keys. The bands name every
// key out of its registration, and this text says what no key says: the
// columns, the colours, the floor, the details and how the filter reads.
// [[spec/design_output/tui#the-help-reads-the-cursor]]

package main

const HelpText = `THE WINDOW

A strip of tabs stands at the top, the open tab on the left, one pane on the
right and the status marks at the foot. The pane shows one of three things, and
the key that opens it closes it again. The tab and the pane each keep their
place, so a person reads a long reply and steps to the next row, and both hold.

FOLLOWING

On the newest row the window follows. Anywhere above it, the window holds
still while rows arrive. end brings it back.

THE COLUMNS

  time           when the row lands, on this box's clock
  level          info in grey, debug dim, and warn, error and fatal in colour
  kind           what it is. A tool row names its tool
  said           one sentence. The details hold the whole text

COLOURS

A prompt stands in yellow, and a reply in green. A warning stands in amber,
an error in red, and a fatal row in magenta. Every other kind wears its own
colour.

THE FLOOR

The window shows the rows at the floor and above. The floor opens at info, so
debug rows stay hidden until the floor comes round to debug. The footer names
the floor at its right end, in the colour of the level it names.

THE DETAILS

A prompt shows its answer and the reply ending its turn. An answer shows its
prompt, and a reply shows every prompt of its turn. Every other row shows the
fields its writer adds.

THE FILTER

The filter is the open tab's own, and the funnel in the footer stands red
while one holds. Clear the line and every row comes back.`

const FilterHelp = `THE LANGUAGE

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

Matching ignores case everywhere.`
