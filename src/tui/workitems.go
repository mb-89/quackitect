// The work tab's items, read off the rows the index answers. A group's row
// carries the tickets naming it under it, and a ticket naming no group, or one
// the rows hold nowhere, stands at the left. Nothing here opens a file.
// [[spec/design_output/tui#the-work-tab]]

package main

import "encoding/json"

// A row every item carries, so the filter reads one word for every kind. [[spec/design_output/tui#the-work-tab]]
const workKind = "ticket"

// The route a group rides, the word [[spec/design_output/index#the-index-answers-the-tickets]] answers under route.
const groupRoute = "group"

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
}

// [[spec/design_output/tui#the-work-tab]]
func ReadWorkItems(text string) ([]Item, error) {
	var rows []ticketRow
	if err := json.Unmarshal([]byte(text), &rows); err != nil {
		return nil, err
	}
	return itemsOfTickets(rows), nil
}

// [[spec/design_output/tui#the-work-tab]]
func itemsOfTickets(rows []ticketRow) []Item {
	groups := map[string]int{}
	out := make([]Item, 0, len(rows))
	for _, one := range rows {
		if one.Route == groupRoute {
			groups[one.Name] = len(out)
			out = append(out, itemOfTicket(one))
		}
	}
	for _, one := range rows {
		if one.Route == groupRoute {
			continue
		}
		if at, held := groups[one.Group]; held {
			out[at].Kids = append(out[at].Kids, itemOfTicket(one))
			continue
		}
		out = append(out, itemOfTicket(one))
	}
	return out
}

// [[spec/design_output/tui#the-work-tab]]
func itemOfTicket(one ticketRow) Item {
	return Item{Name: one.Name, Keys: map[string]string{
		"kind":     workKind,
		"path":     one.Path,
		"state":    one.State,
		"step":     one.Step,
		"route":    one.Route,
		"group":    one.Group,
		"standing": one.Standing,
		"urgent":   flagOf(one.Urgent),
		"todo":     flagOf(one.Todo),
		"held":     flagOf(one.Standing == heldStanding),
		"says":     one.Says,
	}}
}

// A flag stays an ordinary key, so the filter reads `urgent: true` and no new word. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func flagOf(yes bool) string {
	if yes {
		return "true"
	}
	return "false"
}
