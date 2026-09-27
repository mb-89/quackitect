// A call of an action: it takes a record under ops/<id>, runs the action's
// requests, and answers within the wait its caller sets.
// [[spec/design_output/model#a-caller-sets-its-wait]]
package ops

import (
	"time"

	"quackitect/src/q"
)

// The result within the wait, or the operation still running past it. [[spec/design_output/model#a-caller-sets-its-wait]]
type Answer struct {
	Result   any           `json:"result,omitempty"`
	Error    string        `json:"error,omitempty"`
	Running  bool          `json:"running"`
	Handle   string        `json:"handle"`
	Fraction float64       `json:"fraction"`
	Gone     time.Duration `json:"gone"`
}

// [[spec/design_output/model#a-caller-sets-its-wait]]
func Call(b *Book, s *q.Store, name string, input any, caller string, wait time.Duration, accept func(q.Request) (any, error)) (Answer, error) {
	return Answer{}, nil
}

// The operation once it ends, or as it stands when the span runs out. [[spec/design_output/model#a-caller-sets-its-wait]]
func (b *Book) Wait(id string, span time.Duration) (Op, bool) {
	return Op{}, false
}

// [[spec/design_output/model#the-handle-is-a-name]]
func (b *Book) Progress(id string, done, known int, step string) error {
	return nil
}

// The session's operations standing queued or running. [[spec/design_output/model#the-agent-does-not-poll]]
func (b *Book) Open(caller string) []string {
	return nil
}

// ops/wait with no handle: every open operation of the session, once each ends or the span runs out. [[spec/design_output/model#the-agent-does-not-poll]]
func (b *Book) WaitCaller(caller string, span time.Duration) []Op {
	return nil
}
