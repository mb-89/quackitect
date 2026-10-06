// The failure door: the one place a module raises a failure, which answers
// the lines it prints and the row the log takes.
// [[spec/design_output/failures#one-door-raises-a-failure]]
package failure

// One raised failure: its id, level, message and remedies, and whether a node carries the id. [[spec/design_output/failures#one-door-raises-a-failure]]
type Raised struct {
	ID         string
	Level      string
	Said       []string
	Remedies   []string
	Registered bool
}

// The failure an id names, with the message the site builds. [[spec/design_output/failures#one-door-raises-a-failure]]
func Raise(registry Registry, id string, said ...string) Raised {
	return Raised{}
}

// The lines a refusal prints: the message, the id at its level, and each remedy. [[spec/design_output/failures#one-door-raises-a-failure]]
func (one Raised) Lines() []string {
	return nil
}

// The row the log takes, stamped by the caller through its clock door. [[spec/design_output/failures#one-door-raises-a-failure]]
func (one Raised) Row(at string) map[string]any {
	return nil
}
