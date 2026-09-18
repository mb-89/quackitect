// The work tab's items, read off the one answer the work verb writes. The
// editor opens no git process: it reads that file and nothing else, so the
// board is as fresh as the last write. A group's row carries its tickets
// under it, and a ticket naming no group stands at the left.
// [[spec/design_output/work#one-verb-answers-git]]

package main

import (
	"encoding/json"
	"strconv"
)

// A row every item carries, so the filter reads one word for every kind. [[spec/design_output/work#one-verb-answers-git]]
const workKind = "ticket"

type workTicket struct {
	Name     string `json:"name"`
	State    string `json:"state"`
	Step     string `json:"step"`
	Progress string `json:"progress"`
	Group    string `json:"group"`
	Urgent   bool   `json:"urgent"`
	Person   string `json:"person"`
	Stood    int    `json:"stood"`
	Queue    int    `json:"queue"`
	Says     string `json:"says"`
}

type workBranch struct {
	Branch   string       `json:"branch"`
	Name     string       `json:"name"`
	Status   string       `json:"status"`
	Kind     string       `json:"kind"`
	Step     string       `json:"step"`
	Progress string       `json:"progress"`
	Person   string       `json:"person"`
	Age      string       `json:"age"`
	Queue    int          `json:"queue"`
	Says     string       `json:"says"`
	Tickets  []workTicket `json:"tickets"`
}

type workAnswer struct {
	Branches []workBranch `json:"branches"`
	Loose    []workTicket `json:"loose"`
}

// [[spec/design_output/work#one-verb-answers-git]]
func ReadWorkItems(text string) ([]Item, error) {
	var said workAnswer
	if err := json.Unmarshal([]byte(text), &said); err != nil {
		return nil, err
	}
	out := make([]Item, 0, len(said.Branches)+len(said.Loose))
	for _, one := range said.Branches {
		kids := make([]Item, 0, len(one.Tickets))
		for _, held := range one.Tickets {
			kids = append(kids, itemOfTicket(held))
		}
		out = append(out, Item{Name: one.Name, Keys: map[string]string{
			"kind":     workKind,
			"state":    one.Status,
			"step":     one.Step,
			"progress": one.Progress,
			"queue":    placeOf(one.Queue),
			"age":      one.Age,
			"group":    "",
			"urgent":   "",
			"person":   one.Person,
			"stood":    "",
			"says":     one.Says,
		}, Kids: kids})
	}
	for _, one := range said.Loose {
		out = append(out, itemOfTicket(one))
	}
	return out, nil
}

// [[spec/design_output/work#one-verb-answers-git]]
func itemOfTicket(one workTicket) Item {
	mark := ""
	if one.Urgent {
		mark = "urgent"
	}
	return Item{Name: one.Name, Keys: map[string]string{
		"kind":     workKind,
		"state":    one.State,
		"step":     one.Step,
		"progress": one.Progress,
		"queue":    placeOf(one.Queue),
		"age":      "",
		"group":    one.Group,
		"urgent":   mark,
		"person":   one.Person,
		"stood":    placeOf(one.Stood),
		"says":     one.Says,
	}}
}

// A ticket the queue leaves out carries no place, and the column stands empty. [[spec/design_output/pull#the-queue-is-a-score]]
func placeOf(at int) string {
	if at <= 0 {
		return ""
	}
	return strconv.Itoa(at)
}
