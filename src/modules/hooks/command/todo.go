// The todo tag on a push: a note a push carries holding the
// tag parks work on this box, and a gate's point passes.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"strings"

	"quackitect/src/yaml"
)

// The tag's field, the point's field and the gate's point; pulled.go owns a note's suffix. [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
const (
	todoKey   = "todo"
	pointKey  = "point"
	gatePoint = "gate"
)

// The notes a push's listing names, once each, trimmed. [[spec/tickets/cage-commit-guards-port]]
func NotesIn(listing string) []string {
	var out []string
	for _, row := range strings.Split(listing, "\n") {
		name := strings.TrimSpace(row)
		if strings.HasSuffix(name, noteEnd) && !holds(out, name) {
			out = append(out, name)
		}
	}
	return out
}

// The notes holding the tag, a gate's point aside. [[spec/tickets/cage-commit-guards-port]]
func TaggedIn(files []Note) []string {
	var out []string
	for _, one := range files {
		if strings.HasSuffix(one.Name, noteEnd) && isTagged(one.Text) && !isGatePoint(one.Text) {
			out = append(out, one.Name)
		}
	}
	return out
}

// The refusal naming every tagged note a push carries. [[spec/tickets/cage-commit-guards-port]]
func RefusedTodo(names []string) string {
	lines := []string{"A tagged note parks work on this box, and this push carries " + itoa(len(names)) + ".", ""}
	for _, one := range names {
		lines = append(lines, "  "+one)
	}
	lines = append(lines, "",
		"Run `./RUNME.sh ticket todo <name> --off` on each, and push again. A commit",
		"carries the tag, because the push is the one gate the tag meets.")
	return strings.Join(lines, "\n")
}

// A tag is any value past false: a bare true, or the name of the row the ticket stands before. [[spec/design_output/pull#the-queue-is-an-outline]]
func isTagged(text string) bool {
	said := frontOf(text).Get(todoKey)
	return said != nil && said != false && yaml.AsString(said) != "false"
}

// [[spec/tickets/gate-points-pass-the-push]]
func isGatePoint(text string) bool {
	return yaml.AsString(frontOf(text).Get(pointKey)) == gatePoint
}

// The front a note opens with, or none. [[spec/design_output/schema#what-a-note-reads-as]]
func frontOf(text string) *yaml.Doc {
	rows := lineEnd.Split(text, -1)
	if strings.TrimSpace(rows[0]) != frontFence {
		return nil
	}
	for at := 1; at < len(rows); at++ {
		if strings.TrimSpace(rows[at]) == frontFence {
			return yaml.AsDoc(yaml.Read(strings.Join(rows[1:at], "\n")))
		}
	}
	return nil
}
