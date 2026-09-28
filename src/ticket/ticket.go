// The ticket as every module reads it, in a pure package, so a wire between
// the tickets module and a reader carries one Go type while no module imports
// another.
// [[spec/tickets/the-queue-becomes-a-module]]
package ticket

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
	// The leaves the record passes over the leaves the route holds, as done/all. [[spec/design_output/index#the-index-answers-the-tickets]]
	Progress string `json:"progress"`
	// The time the file last changed, off the file table, so a view sorts the newest done ticket first. [[spec/design_output/index#the-index-answers-the-tickets]]
	Changed int64 `json:"changed"`
	// The tickets this one waits on, and the hand-backs that failed on it, which the queue weighs. [[spec/tickets/the-queue-moves-to-plan]]
	DependsOn []string `json:"depends_on,omitempty"`
	Fails     int      `json:"fails,omitempty"`
	// The row the todo names, which the outline moves this one before, or a bare true. [[spec/design_output/pull#a-todo-forces-a-place]]
	TodoAt string `json:"todo_at,omitempty"`
	// The cloud's mark on a group, a hand's open claim, and a leaf a person takes, which the queue splits its lists by. [[spec/tickets/the-queue-becomes-a-module]]
	Cloud  bool `json:"cloud,omitempty"`
	Held   bool `json:"held,omitempty"`
	Person bool `json:"person,omitempty"`
}
