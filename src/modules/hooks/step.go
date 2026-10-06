// The step a door's effects answer, and the merge of an after into an answer.
// stepOf leaves cage.ts and merged leaves shape.ts for this file.
// [[spec/tickets/level0-hooks-hold-no-rule]]
package hooks

// The step the effects answer: an answer to the call, rows to ask back, named blocks, and afters riding as context. [[spec/tickets/level0-hooks-hold-no-rule]]
type Step struct {
	Answer map[string]any `json:"answer,omitempty"`
	Rows   *string        `json:"rows,omitempty"`
	Blocks []Block        `json:"blocks,omitempty"`
	After  []string       `json:"after,omitempty"`
}

// One named block a prompt context hands on. [[spec/tickets/level0-hooks-hold-no-rule]]
type Block struct {
	Name string `json:"name"`
	Text string `json:"text"`
}

// The step the effects answer, in order. A stub until the build step lands it. [[spec/tickets/level0-hooks-hold-no-rule]]
func StepOf(effects []Effect, event string, asks bool) Step {
	return Step{}
}

// An answer with the adds merged in. A stub until the build step lands it. [[spec/tickets/level0-hooks-hold-no-rule]]
func Merged(said any, adds map[string]any) map[string]any {
	return nil
}
