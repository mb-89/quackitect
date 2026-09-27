// The tickets topic: the one reading of a ticket, its Ask and its standing,
// as pure functions over a note's text, and the name tickets/all the index
// commits beside the files it reads them from.
// [[spec/tickets/the-tickets-topic-lands]]
package tickets

import "quackitect/src/q"

// The name every ticket stands under, which the index commits. [[spec/tickets/the-tickets-topic-lands]]
const AllName = "tickets/all"

// The standing a group's branch gives it, the words [[spec/design_output/work#what-the-standing-says]] names.
const (
	StandingTodo = "todo"
	StandingHeld = "held"
	StandingDone = "done"
)

type Ticket struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	State    string `json:"state"`
	Step     string `json:"step"`
	Route    string `json:"route"`
	Group    string `json:"group"`
	Urgent   bool   `json:"urgent"`
	Todo     bool   `json:"todo"`
	Standing string `json:"standing"`
	Says     string `json:"says"`
	// The time the file last changed, off the file table, so a view sorts the newest done ticket first. [[spec/design_output/index#the-index-answers-the-tickets]]
	Changed int64 `json:"changed"`
}

// [[spec/tickets/the-tickets-topic-lands]]
func Registers(catalog *q.Catalog) {}

// [[spec/tickets/the-tickets-topic-lands]]
func Path(rel string) bool { return false }

// [[spec/tickets/the-tickets-topic-lands]]
func Of(path, name, text string, changed int64) Ticket { return Ticket{} }

// [[spec/tickets/the-tickets-topic-lands]]
func All(list []Ticket) []Ticket { return list }

// [[spec/tickets/the-tickets-topic-lands]]
func Ask(text string) string { return "" }

// [[spec/tickets/the-tickets-topic-lands]]
func Held(text string) bool { return false }
