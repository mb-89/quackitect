// The folds over the events of a session, which the instance session binds
// under session/<id>/: the context's fill, and the last event read.
// [[spec/design_output/model#a-fold-keeps-its-state]]
package session

import "quackitect/src/q"

// The local names of the folds. [[spec/tickets/the-hooks-door-lands]]
const (
	FillName = "<id>/fill"
	LastName = "<id>/last"
)

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
	)
}

func fills(state int, _ q.Event) int { return state }

func lasts(state Last, _ q.Event) Last { return state }
