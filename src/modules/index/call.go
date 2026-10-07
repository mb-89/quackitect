// A call of an action: it takes a record under ops/<id>, runs the action's
// requests, and answers within the wait its caller sets.
// [[spec/design_output/model#a-caller-sets-its-wait]]
package index

import (
	"errors"
	"fmt"
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
	declared, ok := s.Declared(name)
	if !ok {
		return Answer{}, fmt.Errorf("%s names no action", name)
	}
	id, err := b.Start(name, input, caller, declared)
	if err != nil {
		return Answer{}, err
	}
	go b.runs(s, id, input, accept)
	if declared.Writes {
		b.Next()
	}
	one, _ := b.Wait(id, wait)
	return b.answerOf(one), nil
}

// Waits for its turn, runs the requests, ends the record, and starts the next writer. [[spec/design_output/model#one-writer-per-tree]]
func (b *Book) runs(s *q.Store, id string, input any, accept func(q.Request) (any, error)) {
	for {
		b.mu.Lock()
		one, ok := b.ops[id]
		state, woke := State(""), b.changed
		if ok {
			state = one.State
		}
		b.mu.Unlock()
		if state == Running {
			break
		}
		if state != Queued {
			return
		}
		<-woke
	}
	one, _ := b.Get(id)
	said, err := s.Deliver(one.Action, input, accept, func(done, known int, step string) {
		_ = b.Progress(id, done, known, step)
	})
	if err != nil {
		_ = b.Fail(id, reasonOf(err))
	} else {
		_ = b.Finish(id, said)
	}
	if one.Writes {
		b.Next()
	}
}

// The reason the refusing module gives, where one refuses. [[spec/design_output/model#a-caller-sets-its-wait]]
func reasonOf(err error) string {
	var refused q.Refusal
	if errors.As(err, &refused) {
		return refused.Err.Error()
	}
	return err.Error()
}

func (b *Book) answerOf(one Op) Answer {
	said := Answer{Handle: one.ID, Result: one.Result, Error: one.Error, Gone: b.clock.Now().Sub(one.Started)}
	if one.Progress.Known > 0 {
		said.Fraction = float64(one.Progress.Done) / float64(one.Progress.Known)
	}
	if !one.Ended.IsZero() {
		said.Gone = one.Ended.Sub(one.Started)
	}
	said.Running = one.State == Queued || one.State == Running
	return said
}

// The operation once it ends, or as it stands when the span runs out. [[spec/design_output/model#a-caller-sets-its-wait]]
func (b *Book) Wait(id string, span time.Duration) (Op, bool) {
	until := b.after(span)
	for {
		b.mu.Lock()
		one, ok := b.ops[id]
		woke := b.changed
		var held Op
		if ok {
			held = *one
		}
		b.mu.Unlock()
		if !ok {
			return Op{}, false
		}
		if held.State != Queued && held.State != Running {
			return held, true
		}
		select {
		case <-woke:
		case <-until:
			return held, false
		}
	}
}

// [[spec/design_output/model#the-handle-is-a-name]]
func (b *Book) Progress(id string, done, known int, step string) error {
	b.mu.Lock()
	defer b.mu.Unlock()
	one, ok := b.ops[id]
	if !ok {
		return fmt.Errorf("%s names no operation", Name(id))
	}
	if one.State != Running {
		return fmt.Errorf("%s stands %s, and moves no step", Name(id), one.State)
	}
	one.Progress = Progress{Done: done, Known: known, Step: step}
	return b.save(one)
}
