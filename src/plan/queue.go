// The queue's score, ported from src/scripts/pull-queue.js. The mark stands
// over the score, and the score weighs what waits under a row, how long it
// stands and how often a hand failed on it. A caller hands the rows in, so the
// order reads no git and no file.
// [[spec/tickets/the-queue-moves-to-plan]]
package plan

// A row as the queue reads it off a ticket or a todo. [[spec/tickets/the-queue-moves-to-plan]]
type Row struct {
	Name      string   `json:"name"`
	Path      string   `json:"path"`
	Group     string   `json:"group"`
	Todo      string   `json:"todo"`
	Urgent    bool     `json:"urgent"`
	DependsOn []string `json:"depends_on"`
	Fails     int      `json:"fails"`
	Order     int      `json:"order"`
}

// What a score reads past the rows: the clock in milliseconds, the weights the config holds, and the second each path came in. [[spec/tickets/the-queue-moves-to-plan]]
type At struct {
	Now     int64              `json:"now"`
	Weights map[string]float64 `json:"weights"`
	Stood   map[string]int64   `json:"stood"`
}

// [[spec/tickets/the-queue-moves-to-plan]]
func Queued(list, all []Row, at At) []Row {
	return nil
}
