// The work module's rows: one a ticket, with its place and its flags, one a
// standing branch, and one a placed todo no ticket carries, ported from
// answerOf in src/scripts/work-answer.js. The git module reads the branches.
// [[spec/tickets/open-tasks-come-from-work]]
package work

import (
	"sort"

	"quackitect/src/q"
	"quackitect/src/ticket"
)

// The ports, by their local names. [[spec/design_output/model#the-wiring-file]]
const (
	TicketsPort   = "tickets"
	PlacesPort    = "places"
	CloudPort     = "cloud"
	BranchesPort  = "branches"
	RowsPort      = "rows"
	OpenTasksPort = "open-tasks"
	YoursPort     = "yours"
	OverridesPort = "overrides"
)

// A row of the queue as ticket yours prints it. [[spec/tickets/ticket-verbs-become-actions]]
type YoursRow struct {
	Ticket string `json:"ticket"`
	Path   string `json:"path"`
	Step   string `json:"step"`
	Queue  string `json:"queue"`
	State  string `json:"state"`
	Person bool   `json:"person"`
}

// Every placed row off the cloud, in outline order, each with its path. [[spec/tickets/ticket-verbs-become-actions]]
func yoursOf(in rowsIn) []YoursRow {
	paths := map[string]string{}
	for _, one := range in.Tickets {
		paths[one.Name] = one.Path
	}
	out := []YoursRow{}
	for _, one := range rowsOf(in) {
		if one.Queue == "" || one.Queue == cloudPlace || one.Cloud {
			continue
		}
		out = append(out, YoursRow{Ticket: one.Name, Path: paths[one.Name], Step: one.Step, Queue: one.Queue, State: one.State, Person: one.Person})
	}
	sort.SliceStable(out, func(a, b int) bool { return ticket.ComparePlaces(out[a].Queue, out[b].Queue) < 0 })
	return out
}

// A row as the work tab reads it. [[spec/design_output/tui#the-work-tab]]
type Row struct {
	Name     string `json:"name"`
	Kind     string `json:"kind"`
	State    string `json:"state"`
	Step     string `json:"step"`
	Progress string `json:"progress"`
	Group    string `json:"group"`
	Urgent   bool   `json:"urgent"`
	Person   bool   `json:"person"`
	Held     bool   `json:"held"`
	Waits    bool   `json:"waits"`
	Todo     bool   `json:"todo"`
	Says     string `json:"says"`
	Queue    string `json:"queue,omitempty"`
	Cloud    bool   `json:"cloud"`
	// The note's path, its route and when it last changed, which the tab's links, flags and recently done sort read. [[spec/tickets/the-work-tab-reads-v1]]
	Path    string `json:"path,omitempty"`
	Route   string `json:"route,omitempty"`
	Changed int64  `json:"changed,omitempty"`
}

type rowsIn struct {
	Tickets []ticket.Ticket   `q:"tickets"`
	Places  map[string]string `q:"places"`
	Cloud   []string          `q:"cloud"`
	// The standing work branches, each drawn as one row of its own. [[spec/tickets/the-index-reads-standing-branches]]
	Branches []ticket.Branch `q:"branches"`
	// The places the plan overrides, which light the todo letter the way the front's own todo does. [[spec/tickets/rows-todo-folds-overrides]]
	Overrides map[string]string `q:"overrides"`
}

// The module type the wiring loads as work. [[spec/tickets/open-tasks-come-from-work]]
func Registers(c *q.Catalog) q.Writer {
	rows := q.DerivedIn(c, RowsPort, []Row{}, rowsOf, q.Doc("every ticket and every placed todo, with its place in the queue and its flags"), q.Looks(q.Rows))
	open := q.DerivedIn(c, OpenTasksPort, 0, openTasksOf, q.Doc("the rows this box can take: every placed row off the cloud"), q.Label("work"), q.Looks(q.Count))
	yours := q.DerivedIn(c, YoursPort, []YoursRow{}, yoursOf, q.Doc("the rows ticket yours prints: every placed row off the cloud, in outline order, each with its path"))
	return q.Join(rows, open, yours)
}

// The words a row reads, which src/scripts/work-answer.js names and a Go module spells again. [[spec/design_output/pull#the-queue-is-an-outline]]
const (
	groupKind   = "group"
	ticketKind  = "ticket"
	todoKind    = "todo"
	heldPlace   = "0"
	heldState   = "held"
	openState   = "open"
	closedState = "closed"
)

// One row a ticket in the order the tickets come, then one a placed name no ticket carries, in name order. [[spec/design_output/work#one-reading-answers-git]]
func rowsOf(in rowsIn) []Row {
	cloud := map[string]bool{}
	for _, one := range in.Cloud {
		cloud[one] = true
	}
	state := map[string]string{}
	for _, one := range in.Tickets {
		state[one.Name] = one.State
	}
	// A branch row stands for its group, so a ticket under that group rides the branch and draws no row of its own. [[spec/design_output/work#one-reading-answers-git]]
	branched := map[string]bool{}
	for _, one := range in.Branches {
		branched[one.Name] = true
	}
	overridden := in.Overrides
	out := []Row{}
	for _, one := range in.Branches {
		out = append(out, branchRow(one, in.Places[one.Name], cloud[one.Name]))
		for _, child := range one.Children {
			out = append(out, rowOf(child, in.Places[child.Name], cloud[child.Name], waits(child, state), overridden[child.Name]))
		}
	}
	for _, one := range in.Tickets {
		if branched[one.Name] || branched[one.Group] {
			continue
		}
		out = append(out, rowOf(one, in.Places[one.Name], cloud[one.Name], waits(one, state), overridden[one.Name]))
	}
	loose := []string{}
	for name := range in.Places {
		if _, stands := state[name]; !stands && !branched[name] {
			loose = append(loose, name)
		}
	}
	sort.Strings(loose)
	for _, name := range loose {
		out = append(out, Row{Name: name, Kind: todoKind, State: stateAt(openState, in.Places[name]), Held: in.Places[name] == heldPlace, Todo: true, Queue: in.Places[name]})
	}
	return out
}

// A ticket's row, the way rowOfTicket draws it. [[spec/design_output/work#one-reading-answers-git]]
func rowOf(one ticket.Ticket, place string, cloud, waits bool, overridden string) Row {
	kind := ticketKind
	if one.Route == groupKind {
		kind = groupKind
	}
	return Row{
		Name: one.Name, Kind: kind, State: stateAt(one.State, place), Step: one.Step, Progress: one.Progress,
		Group: one.Group, Urgent: one.Urgent, Person: one.Person, Held: one.Held, Waits: waits,
		Todo: one.Todo || overridden != "", Says: one.Says, Queue: place, Cloud: cloud,
		Path: one.Path, Route: one.Route, Changed: one.Changed,
	}
}

// A branch's row, the way answerOf draws it: no state, and the fields of its group's copy on the tip where it holds one. [[spec/design_output/work#one-reading-answers-git]]
func branchRow(one ticket.Branch, place string, cloud bool) Row {
	group := one.Ticket
	return Row{
		Name: one.Name, Kind: groupKind, Step: group.Step, Progress: group.Progress, Urgent: group.Urgent,
		Person: group.Person, Held: group.Held, Says: group.Says, Queue: place, Cloud: cloud,
	}
}

// A row at zero stands in hand, so its state reads held whatever its front says. [[spec/design_output/pull#the-queue-is-an-outline]]
func stateAt(state, place string) string {
	if place == heldPlace {
		return heldState
	}
	return state
}

// A ticket waiting on one still open carries the flag saying so. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func waits(one ticket.Ticket, state map[string]string) bool {
	for _, dep := range one.DependsOn {
		if state[dep] == openState {
			return true
		}
	}
	return false
}
