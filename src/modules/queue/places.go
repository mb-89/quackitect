// The queue's places: every open row's outline place, off the tickets, the
// plan, the cloud's mark, the time each ticket came in and the minute, ported
// from placesIn in src/scripts/work-answer.js. It reads no git.
// [[spec/tickets/the-queue-becomes-a-module]]
package queue

import (
	"quackitect/src/q"
	"quackitect/src/ticket"
)

// The ports, by their local names. [[spec/design_output/model#the-wiring-file]]
const (
	RowsPort   = "rows"
	PlanPort   = "plan"
	CloudPort  = "cloud"
	StoodPort  = "stood"
	MinutePort = "minute"
	PlacesPort = "places"
)

// What a run of places reads. [[spec/tickets/the-queue-becomes-a-module]]
type placesIn struct {
	Rows   []ticket.Ticket  `q:"rows"`
	Plan   q.Content        `q:"plan"`
	Cloud  []string         `q:"cloud"`
	Stood  map[string]int64 `q:"stood"`
	Minute int64            `q:"minute"`
	Block  float64          `q:"config/weight/block"`
	Day    float64          `q:"config/weight/day"`
	Fail   float64          `q:"config/weight/fail"`
}

// The module type the wiring loads as queue. [[spec/tickets/the-queue-becomes-a-module]]
func Places(c *q.Catalog) q.Writer {
	q.CfgIn(c, "weight/block", float64(0), q.Doc("the score a ticket takes for each ticket its chain holds up"))
	q.CfgIn(c, "weight/day", float64(0), q.Doc("the score a ticket takes for each whole day it stands"))
	q.CfgIn(c, "weight/fail", float64(0), q.Doc("the score a ticket takes for each hand-back that failed on it"))
	return q.DerivedIn(c, PlacesPort, map[string]string{}, placesOf, q.Doc("every open row's place in the queue, as an outline number, and ∞ for a row the cloud holds"))
}

// [[spec/tickets/the-queue-becomes-a-module]]
func placesOf(in placesIn) map[string]string {
	return map[string]string{}
}
