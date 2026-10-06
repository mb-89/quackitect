// The failure door: the one place a module raises a failure, which answers
// the lines it prints and the row the log takes.
// [[spec/design_output/failures#one-door-raises-a-failure]]
package failure

import (
	"fmt"
	"strings"
)

// The kind a failure's log row carries, the field naming its id, the level an unregistered id takes, and the opening of a remedy line. [[spec/design_output/failures#one-door-raises-a-failure]]
const (
	RowKind       = "failure"
	IDField       = "failure"
	unknownLevel  = "error"
	remedyOpening = "remedy: "
)

// One raised failure: its id, level, message and remedies, and whether a node carries the id. [[spec/design_output/failures#one-door-raises-a-failure]]
type Raised struct {
	ID         string
	Level      string
	Said       []string
	Remedies   []string
	Registered bool
}

// The failure an id names, with the message the site builds. An id no node carries raises at error. [[spec/design_output/failures#one-door-raises-a-failure]]
func Raise(registry Registry, id string, said ...string) Raised {
	node, ok := registry.Node(id)
	if !ok {
		return Raised{ID: id, Level: unknownLevel, Said: said}
	}
	return Raised{ID: id, Level: node.Level, Said: said, Remedies: node.Remedies, Registered: true}
}

// The lines a refusal prints: the message, the id at its level, and each remedy. [[spec/design_output/failures#one-door-raises-a-failure]]
func (one Raised) Lines() []string {
	out := append([]string{}, one.Said...)
	if !one.Registered {
		return append(out, fmt.Sprintf("failure %s stands unregistered, so %s names no remedy", one.ID, Folder))
	}
	out = append(out, fmt.Sprintf("failure %s at %s", one.ID, one.Level))
	for _, remedy := range one.Remedies {
		out = append(out, remedyOpening+remedy)
	}
	return out
}

// The row the log takes, stamped by the caller through its clock door, its message on one line as the JavaScript log writes it. [[spec/design_output/failures#one-door-raises-a-failure]]
func (one Raised) Row(at string) map[string]any {
	said := strings.Join(strings.Fields(strings.Join(one.Said, " ")), " ")
	return map[string]any{"at": at, "level": one.Level, "kind": RowKind, "said": said, IDField: one.ID}
}
