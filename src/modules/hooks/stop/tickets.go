// What the stop checks read off a ticket's front: the leaf a hand stands on,
// the group it holds, the private tickets it opens, and the holds it queues.
// [[spec/tickets/cage-stop-rules-port]]
package stop

import (
	"strings"

	"quackitect/src/yaml"
)

// The fields the checks read, and the hands that take no leaf off the queue. [[spec/tickets/the-stop-reads-the-state]]
const (
	stateKey    = "state"
	openState   = "open"
	closedState = "closed"
	groupRoute  = "group"
	noteRoute   = "note"
	personHand  = "person"
)

// The hands a leaf names that the queue hands no desk. [[spec/design_output/stop#the-mechanical-checks]]
var handsNoDesk = map[string]bool{personHand: true, "children": true, "helper": true}

// A front's field as String reads it, or nothing where no front stands. [[spec/tickets/cage-stop-rules-port]]
func field(front *yaml.Doc, key string) string {
	if front == nil {
		return ""
	}
	return yaml.AsString(front.Get(key))
}

// A field with its link brackets off, as fieldOf in src/branches/group.go reads it. [[spec/design_output/work#a-group-is-a-ticket]]
func bare(said string) string {
	return strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(strings.TrimSpace(said), "[["), "]]"))
}

// Who takes the leaf a ticket's pointer names, or its first leaf where no pointer stands, and whether a leaf stands. [[spec/tickets/the-stop-reads-the-state]]
func LeafBy(text string) (string, bool) {
	front := yaml.FrontOf(text)
	if front == nil {
		return "", false
	}
	step := strings.TrimSpace(field(front, "step"))
	for _, one := range walk(front.Get("steps"), "") {
		if (step != "" && one.path == step) || (step == "" && one.said.Get("steps") == nil) {
			return yaml.AsString(one.said.Get("by")), true
		}
	}
	return "", false
}

type entry struct {
	path string
	said *yaml.Doc
}

// Every step of a route, parents before their children, each by its path, as entriesIn walks them. [[spec/design_output/schema#keywords-that-name-a-step]]
func walk(steps any, parent string) []entry {
	var out []entry
	for _, one := range yaml.AsList(steps) {
		said := yaml.AsDoc(one)
		if said == nil {
			continue
		}
		path := yaml.AsString(said.Get("name"))
		if parent != "" {
			path = parent + "/" + path
		}
		out = append(out, entry{path, said})
		out = append(out, walk(said.Get("steps"), path)...)
	}
	return out
}

// A group stands in hand where its last record opened a step and closed none. [[spec/design_output/pull#the-group-holds-the-turn]]
func HeldGroup(text string) bool {
	front := yaml.FrontOf(text)
	if front == nil || field(front, stateKey) == closedState {
		return false
	}
	var last *yaml.Doc
	for _, one := range yaml.AsList(front.Get("record")) {
		if said := yaml.AsDoc(one); said != nil {
			last = said
		}
	}
	return last != nil && field(last, "hash_before") != "" && field(last, "hash_after") == ""
}

// The group a ticket lands in, or nothing. [[spec/design_output/work#a-group-is-a-ticket]]
func GroupOf(text string) string {
	return bare(field(yaml.FrontOf(text), groupRoute))
}

// A private ticket open and off the note route carries the turn. [[spec/design_output/pull#the-private-queue]]
func OpenPrivate(text string) bool {
	front := yaml.FrontOf(text)
	return field(front, stateKey) == openState && !onRoute(front, noteRoute)
}

func onRoute(front *yaml.Doc, route string) bool {
	process := strings.TrimSuffix(strings.TrimPrefix(field(front, "process"), "[["), "]]")
	return process == route || strings.HasSuffix(process, "/"+route)
}

// The queue holds work for a desk where a free open ticket has a leaf a hand takes, or a group carries the mark. [[spec/design_output/stop#the-mechanical-checks]]
func QueueHolds(texts []string) bool {
	for _, text := range texts {
		front := yaml.FrontOf(text)
		if field(front, stateKey) != openState {
			continue
		}
		if onRoute(front, groupRoute) {
			if field(front, "urgent") == "true" {
				return true
			}
			continue
		}
		if strings.TrimSpace(field(front, groupRoute)) != "" {
			continue
		}
		if by, ok := LeafBy(text); ok && !handsNoDesk[by] {
			return true
		}
	}
	return false
}

// Whether a ticket's text reads closed, off its front's state. [[spec/design_output/pull#the-hand-and-the-hold]]
func Closed(text string) bool {
	return bare(field(yaml.FrontOf(text), stateKey)) == closedState
}

// Whether a ticket, or the group it lands in, stands at a leaf a person takes. [[spec/tickets/the-stop-reads-the-state]]
func WaitsOnPerson(text string, read func(name string) string) bool {
	if text == "" {
		return false
	}
	if by, _ := LeafBy(text); by == personHand {
		return true
	}
	group := GroupOf(text)
	if group == "" {
		return false
	}
	by, _ := LeafBy(read(group))
	return by == personHand
}
