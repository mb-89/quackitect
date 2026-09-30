// The queue's places: every open row's outline place, off the tickets, the
// plan, the cloud's mark, the time each ticket came in and the minute, ported
// from placesIn in src/scripts/work-answer.js. It reads no git.
// [[spec/tickets/the-queue-becomes-a-module]]
package queue

import (
	"encoding/json"
	"fmt"
	"strings"

	"quackitect/src/q"
	"quackitect/src/ticket"
)

// The words a ticket's front and route carry that the split reads, which src/engine/group.js names and a Go module spells again. [[spec/design_output/pull#the-queue-is-an-outline]]
const (
	closedState  = "closed"
	openState    = "open"
	draftState   = "draft"
	noteRoute    = "note"
	trivialRoute = "trivial"
	bareTrue     = "true"
)

// The span of a minute, in the milliseconds the score's clock counts. [[spec/design_output/pull#the-queue-is-a-score]]
const msAMinute = 60 * msASecond

// The ports, by their local names. [[spec/design_output/model#the-wiring-file]]
const (
	RowsPort   = "rows"
	PlanPort   = "plan"
	CloudPort  = "cloud"
	StoodPort  = "stood"
	MinutePort = "minute"
	PlacesPort = "places"
	// The places a hand overrides, which the work module reads. [[spec/tickets/rows-todo-folds-overrides]]
	OverridesPort = "overrides"
)

// The weights a key reads where no layer sets it, the values spec/config/level0.json holds. [[spec/tickets/index-reads-loaded-projections]]
const (
	builtInBlock = float64(10)
	builtInDay   = float64(1)
	builtInFail  = float64(5)
)

// What a run of places reads. [[spec/tickets/the-queue-becomes-a-module]]
type placesIn struct {
	Rows   []ticket.Ticket  `q:"rows"`
	Plan   q.Content        `q:"plan"`
	Cloud  []string         `q:"cloud"`
	Stood  map[string]int64 `q:"stood"`
	Minute int64            `q:"minute"`
	Block  float64          `q:"config/block"`
	Day    float64          `q:"config/day"`
	Fail   float64          `q:"config/fail"`
}

// The module type the wiring loads as queue. [[spec/tickets/the-queue-becomes-a-module]]
func Places(c *q.Catalog) q.Writer {
	// The keys stand under queue in spec/config/level0.json, where the ticket program reads them too. The served index answers every key its built-in value until it reads loaded projections, so each built-in holds the file's value. [[spec/tickets/index-reads-loaded-projections]]
	q.CfgIn(c, "block", builtInBlock, q.Doc("the score a ticket takes for each ticket its chain holds up"))
	q.CfgIn(c, "day", builtInDay, q.Doc("the score a ticket takes for each whole day it stands"))
	q.CfgIn(c, "fail", builtInFail, q.Doc("the score a ticket takes for each hand-back that failed on it"))
	places := q.DerivedIn(c, PlacesPort, map[string]string{}, placesOf, q.Doc("every open row's place in the queue, as an outline number, and ∞ for a row the cloud holds"))
	overrides := q.DerivedIn(c, OverridesPort, map[string]string{}, overridesOf, q.Doc("every place a hand overrides in the plan file, by name"))
	return q.Join(places, overrides)
}

// The places placesIn answers. A closed row, a note and a row the cloud holds take no place in the lists. A held row and the plan's work stand in hand, a person's step and a draft wait on a person, a ticket whose waits all stand closed goes to the agents, and every other row goes back. A row the cloud holds that stands open takes ∞. [[spec/design_output/pull#the-queue-is-an-outline]]
func placesOf(in placesIn) map[string]string {
	plan := planOf(in.Plan)
	cloud := setOf(in.Cloud)
	state := map[string]string{}
	all := []Row{}
	for _, one := range in.Rows {
		state[one.Name] = one.State
		all = append(all, Row{Name: one.Name, Path: one.Path, Group: one.Group, Todo: one.TodoAt, Urgent: one.Urgent, DependsOn: one.DependsOn, Fails: one.Fails})
	}
	ticketRows := len(all)
	all = append(all, plan.rows()...)
	var persons, held, agents, back []Row
	for at, one := range all {
		if at < ticketRows && !placed(in.Rows[at], cloud) {
			continue
		}
		switch {
		case one.Name == plan.Working || (at < ticketRows && in.Rows[at].Held):
			held = append(held, one)
		case at < ticketRows && waitsOnPerson(in.Rows[at]):
			persons = append(persons, one)
		case at < ticketRows && takeable(in.Rows[at], state):
			agents = append(agents, one)
		default:
			back = append(back, one)
		}
	}
	score := At{
		Now:     in.Minute * msAMinute,
		Weights: map[string]float64{blockWeight: in.Block, dayWeight: in.Day, failWeight: in.Fail},
		Stood:   in.Stood,
	}
	rest := append(Queued(agents, all, score), Queued(back, all, score)...)
	out := Outline(Queued(persons, all, score), held, rest, all, plan.overrides())
	for _, one := range in.Rows {
		if cloud[one.Name] && one.State != closedState {
			out[one.Name] = CloudPlace
		}
	}
	return out
}

// A ticket takes a place while it stands open, off the cloud and off the note route. [[spec/design_output/pull#the-queue-is-an-outline]]
func placed(one ticket.Ticket, cloud map[string]bool) bool {
	return one.State != closedState && !cloud[one.Name] && one.Route != noteRoute
}

// A person's step, or a draft no agent opens. [[spec/design_output/pull#the-queue-is-an-outline]]
func waitsOnPerson(one ticket.Ticket) bool {
	return one.Person || (one.State == draftState && one.Route != trivialRoute)
}

// An open ticket, or a trivial draft the pull opens, whose every wait stands closed or stands nowhere here. The pull's hand rules and verbs read the box and no ticket, so the module leaves them out. [[spec/design_output/pull#done-leaves-no-takeable-step]]
func takeable(one ticket.Ticket, state map[string]string) bool {
	if one.State != openState && !(one.State == draftState && one.Route == trivialRoute) {
		return false
	}
	for _, dep := range one.DependsOn {
		if said, stands := state[dep]; stands && said != closedState {
			return false
		}
	}
	return true
}

// The plan this box holds: the work in hand, the places a hand overrides, and the todos. [[spec/design_output/stop#the-plan]]
type plan struct {
	Working string         `json:"working"`
	Places  map[string]any `json:"places"`
	Todos   []planTodo     `json:"todos"`
}

type planTodo struct {
	Title string `json:"title"`
	Todo  any    `json:"todo"`
}

// The plan off its file, and an empty one where the file stands nowhere or reads as no plan. [[spec/design_output/stop#the-plan]]
func planOf(file q.Content) plan {
	var out plan
	if file.Hash == "" || json.Unmarshal([]byte(file.Text), &out) != nil {
		return plan{}
	}
	return out
}

func (p plan) titles() map[string]bool {
	out := map[string]bool{}
	for _, one := range p.Todos {
		out[one.Title] = true
	}
	return out
}

// The todos as rows: a name, an anchor and the order they stand in, so the score skips them and the anchor places them. [[spec/design_output/stop#the-plan]]
func (p plan) rows() []Row {
	titles := p.titles()
	out := []Row{}
	for order, one := range p.Todos {
		if one.Title == "" {
			continue
		}
		out = append(out, Row{Name: one.Title, Todo: anchorOf(one.Todo, titles), Order: order})
	}
	return out
}

// What the overrides read: the plan file alone. [[spec/tickets/rows-todo-folds-overrides]]
type overridesIn struct {
	Plan q.Content `q:"plan"`
}

// The places a hand overrides in the plan file, which the work module's rows light the todo letter off. [[spec/tickets/rows-todo-folds-overrides]]
func overridesOf(in overridesIn) map[string]string { return planOf(in.Plan).overrides() }

// The overrides a hand writes, and a todo's own passes the check its anchor does. [[spec/design_output/pull#a-todo-forces-a-place]]
func (p plan) overrides() map[string]string {
	titles := p.titles()
	out := map[string]string{}
	for name, said := range p.Places {
		if titles[name] {
			out[name] = anchorOf(said, titles)
			continue
		}
		out[name] = textOf(said)
	}
	return out
}

// A todo anchors at the front or on another todo, and any other anchor lands it after the todos. [[spec/design_output/pull#a-todo-forces-a-place]]
func anchorOf(said any, titles map[string]bool) string {
	word := strings.TrimSpace(textOf(said))
	if word == bareTrue || word == First || titles[word] {
		return word
	}
	return Last
}

// A value as the text JavaScript's String gives it, and nothing for none. [[spec/tickets/the-queue-becomes-a-module]]
func textOf(said any) string {
	if said == nil {
		return ""
	}
	return fmt.Sprint(said)
}

func setOf(names []string) map[string]bool {
	out := map[string]bool{}
	for _, one := range names {
		out[one] = true
	}
	return out
}
