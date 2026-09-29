// The log module: the session rows off the session log, and the level ladder
// every reader ranks a row by, held once.
// [[spec/tickets/the-log-topic-lands]]
package log

import "quackitect/src/q"

// The ports, by their local names. [[spec/design_output/model#the-wiring-file]]
const (
	SessionPort = "session"
	RowsPort    = "rows"
	LadderPort  = "ladder"
)

// The ladder Python's logging climbs. [[spec/design_output/log#what-a-box-writes]]
var Ladder = []string{}

// One row of the session log. [[spec/design_output/tui#one-row]]
type Row struct {
	At     string            `json:"at"`
	Level  string            `json:"level"`
	Kind   string            `json:"kind"`
	Said   string            `json:"said"`
	Text   string            `json:"text,omitempty"`
	Extra  map[string]string `json:"extra,omitempty"`
	Broken bool              `json:"broken,omitempty"`
}

type rowsIn struct {
	Session q.Content `q:"session"`
}

// The module type the wiring loads as log. [[spec/tickets/the-log-topic-lands]]
func Registers(c *q.Catalog) q.Writer {
	rows := q.DerivedIn(c, RowsPort, []Row{}, rowsOf, q.Doc("every row of the session log, in the order it holds them"))
	ladder := q.OutIn(c, LadderPort, Ladder, q.Doc("the level ladder every reader ranks a row by"))
	return q.Join(rows, ladder)
}

func rowsOf(in rowsIn) []Row {
	return RowsOf(in.Session.Text)
}

// One row a line that holds anything. [[spec/design_output/tui#one-row]]
func RowsOf(text string) []Row {
	return nil
}

// A level's place on the ladder, and info's place for a level nobody knows. [[spec/design_output/log#what-a-box-writes]]
func Rank(level string) int {
	return 0
}
