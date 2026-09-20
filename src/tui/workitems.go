// The work tab's items, read off the rows the index answers. A ticket naming
// another row nests under it, whatever route the parent rides, and a ticket
// naming no row stands at the left. Nothing here opens a file.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"encoding/json"
	"fmt"
)

// The kinds a row carries, off the route a group rides, which the mark draws and the filter reads. [[spec/design_output/tree-view#the-name-column-nests]]
const (
	kindTicket = "ticket"
	kindGroup  = "group"
)

// The standing a held branch gives, one of the words [[spec/design_output/work#what-the-standing-says]] names.
const heldStanding = "held"

// One row of the index's answer. [[spec/design_output/index#the-index-answers-the-tickets]]
type ticketRow struct {
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
	Changed  int64  `json:"changed"`
}

// The keys the verb's answer lays over the rows, which the index holds nowhere. [[spec/design_output/tui#the-work-tab]]
const (
	queueKey = "queue"
	cloudKey = "cloud"
)

// [[spec/design_output/tui#the-work-tab]]
func ReadWorkItems(text string) ([]Item, error) {
	var rows []ticketRow
	if err := json.Unmarshal([]byte(text), &rows); err != nil {
		return nil, err
	}
	return itemsOfTickets(rows), nil
}

// A row naming another row as its group nests under it, and the rest stand at the left in the order the rows come. [[spec/design_output/tree-view#the-name-column-nests]]
func itemsOfTickets(rows []ticketRow) []Item {
	items := make(map[string]*Item, len(rows))
	order := make([]string, 0, len(rows))
	for _, one := range rows {
		held := itemOfTicket(one)
		items[one.Name] = &held
		order = append(order, one.Name)
	}
	roots := make([]string, 0, len(rows))
	for _, name := range order {
		one := items[name]
		parent, found := items[one.Keys["group"]]
		if found && parent != one {
			parent.Kids = append(parent.Kids, *one)
			continue
		}
		roots = append(roots, name)
	}
	out := make([]Item, 0, len(roots))
	for _, name := range roots {
		out = append(out, withKids(items, *items[name]))
	}
	return out
}

// A parent's kids landed before their own kids did, so the tree reads the map once more on the way down. [[spec/design_output/tree-view#the-name-column-nests]]
func withKids(items map[string]*Item, one Item) Item {
	kids := make([]Item, 0, len(one.Kids))
	for _, kid := range one.Kids {
		kids = append(kids, withKids(items, *items[kid.Name]))
	}
	one.Kids = kids
	return one
}

// [[spec/design_output/tui#the-work-tab]]
func itemOfTicket(one ticketRow) Item {
	kind := kindTicket
	if one.Route == kindGroup {
		kind = kindGroup
	}
	return Item{Name: one.Name, Keys: map[string]string{
		"kind":     kind,
		"path":     one.Path,
		"state":    one.State,
		"step":     one.Step,
		"route":    one.Route,
		"group":    one.Group,
		"standing": one.Standing,
		"urgent":   flagOf(one.Urgent),
		"todo":     flagOf(one.Todo),
		"held":     flagOf(one.Standing == heldStanding),
		cloudKey:   flagOf(false),
		"changed":  changedOf(one.Changed),
		"says":     one.Says,
	}}
}

// The time the file changed, as a number the sort reads, and nothing where the index knows none. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func changedOf(when int64) string {
	if when <= 0 {
		return ""
	}
	return fmt.Sprint(when)
}

// A flag stays an ordinary key, so the filter reads `urgent: true` and no new word. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func flagOf(yes bool) string {
	if yes {
		return "true"
	}
	return "false"
}
