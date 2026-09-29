// The cage's replay: a session log recorded at debug drives the door, one
// hook row a post, and each decision the door reads apart from the bridge's
// becomes one shadow row.
// [[spec/tickets/cage-rules-replay-session-logs]]
package hooks

// The decision words both sides read as. [[spec/tickets/cage-rules-replay-session-logs]]
const (
	PassWord   = "pass"
	RefuseWord = "refuse"
	BlockWord  = "block"
	HoldWord   = "hold"
)

// One hook row the door and the bridge decide apart. [[spec/tickets/cage-rules-replay-session-logs]]
type Apart struct {
	Line  int    `json:"line"`
	Stamp string `json:"stamp"`
	Event string `json:"event"`
	Tool  string `json:"tool,omitempty"`
	Old   string `json:"old"`
	New   string `json:"new"`
}

// One recorded post, and the line of the log it stands on. [[spec/tickets/cage-rules-replay-session-logs]]
type Recorded struct {
	Line  int
	Stamp string
	Post  Post
}

// Every hook row of a debug session log, as the post the bridge read and its answer under Old. [[spec/tickets/cage-rules-replay-session-logs]]
func PostsOf(text string) ([]Recorded, error) {
	return nil, nil
}

// The bridge's answer as one decision word. [[spec/tickets/cage-rules-replay-session-logs]]
func OldDecisionOf(answer any) string {
	return ""
}

// The door's answer to a post as one decision word. [[spec/tickets/cage-rules-replay-session-logs]]
func NewDecisionOf(post Post, said Answer) string {
	return ""
}

// Drives every hook row through the door, and hands each decision read apart to say as a shadow row. [[spec/tickets/cage-rules-replay-session-logs]]
func (d *Door) ReplayLog(text string, say func(row map[string]any) error) ([]Apart, error) {
	return nil, nil
}

// The shadow row an Apart writes. [[spec/tickets/cage-rules-replay-session-logs]]
func (d *Door) ShadowRowOf(one Apart) map[string]any {
	return nil
}

// A say appending each row as one line of the session log at path. [[spec/tickets/cage-rules-replay-session-logs]]
func ShadowTo(path string) func(row map[string]any) error {
	return func(map[string]any) error { return nil }
}
