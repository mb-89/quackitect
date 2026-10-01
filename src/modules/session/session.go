// The folds over the events of a session, which the instance session binds
// under session/<id>/: the context's fill, the last event read, and the
// helpers that report, with every session's reports read as one.
// [[spec/design_output/model#a-fold-keeps-its-state]]
package session

import (
	"sort"

	"quackitect/src/q"
)

// The local names of the folds. [[spec/tickets/the-hooks-door-lands]]
const (
	FillName    = "<id>/fill"
	LastName    = "<id>/last"
	ReportsName = "<id>/reports"
	ReportsPort = "reports"
)

// The kind of event a helper's report lands as. [[spec/design_output/level0#the-wait-returns-on-signals]]
const stopKind = "classic.Stop"

// The newest event a session's fold reads: its place and its kind. [[spec/design_output/model#a-fold-keeps-its-state]]
type Last struct {
	Seq  int64  `json:"seq"`
	Kind string `json:"kind"`
}

// The module type the wiring loads as session. [[spec/tickets/the-hooks-door-lands]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.FoldIn(c, FillName, 0, fills, q.Doc("the context's tokens, as the newest event naming them says")),
		q.FoldIn(c, LastName, Last{}, lasts, q.Doc("the place and the kind of the newest event a session lands")),
		q.FoldIn(c, ReportsName, []string{}, reports, q.Doc("the helpers whose stop lands in a session, as their report")),
		q.DerivedIn(c, ReportsPort, []string{}, everyReport, q.Doc("the helpers that report, over every session")),
	)
}

// Every session's reports, read as one family. [[spec/tickets/find-and-wait-in-go]]
type reportsIn struct {
	Reports map[string][]string `q:"<id>/reports"`
}

// A helper's stop lands its agent, and the session's own stop and every other event pass by. [[spec/design_output/level0#the-wait-returns-on-signals]]
func reports(state []string, event q.Event) []string {
	if event.Kind != stopKind || event.Hand.Agent == "" {
		return state
	}
	return append(append([]string{}, state...), event.Hand.Agent)
}

func everyReport(in reportsIn) []string {
	sessions := make([]string, 0, len(in.Reports))
	for id := range in.Reports {
		sessions = append(sessions, id)
	}
	sort.Strings(sessions)
	out := []string{}
	for _, id := range sessions {
		out = append(out, in.Reports[id]...)
	}
	return out
}

// The field of an event carrying the context's tokens. [[spec/design_output/model#a-post-and-its-answer]]
const fillField = "fill"

// An event naming no fill keeps the one before. [[spec/design_output/model#a-fold-keeps-its-state]]
func fills(state int, event q.Event) int {
	switch one := event.Fields[fillField].(type) {
	case float64:
		return int(one)
	case int:
		return one
	case int64:
		return int(one)
	}
	return state
}

func lasts(_ Last, event q.Event) Last { return Last{Seq: event.Seq, Kind: event.Kind} }
