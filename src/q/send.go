// The index runs the requests an action answers: in order, each Then reading
// the answers, and the undo of every request before a failing one.
// [[spec/design_output/model#an-action-lists-requests]]
package q

import (
	"errors"
	"fmt"
	"reflect"
)

// Runs the action's requests through accept, which reaches the IO module each names. [[spec/design_output/model#an-action-lists-requests]]
func (s *Store) Send(name string, input any, accept func(Request) (any, error)) error {
	_, err := s.Deliver(name, input, accept, nil)
	return err
}

// A request the IO module refuses, and the reason it gives. [[spec/design_output/model#an-action-lists-requests]]
type Refusal struct {
	Module, Verb string
	Err          error
}

func (r Refusal) Error() string { return r.Module + "." + r.Verb + " refuses: " + r.Err.Error() }
func (r Refusal) Unwrap() error { return r.Err }

// Send, answering the last answer, and telling moved each request answered against the requests known. [[spec/design_output/model#a-caller-sets-its-wait]]
func (s *Store) Deliver(name string, input any, accept func(Request) (any, error), moved func(done, known int, step string)) (any, error) {
	list, err := s.Act(name, input)
	if err != nil {
		return nil, err
	}
	if moved == nil {
		moved = func(int, int, string) {}
	}
	var done []Request
	var said any
	known := len(list)
	for len(list) > 0 {
		answers := make([]any, 0, len(list))
		for _, one := range list {
			said, err = accept(one)
			if err != nil {
				return nil, errors.Join(Refusal{one.Module, one.Verb, err}, undo(done, accept))
			}
			answers = append(answers, said)
			done = append(done, one)
			moved(len(done), known, one.Module+"."+one.Verb)
		}
		last := list[len(list)-1]
		if last.Then == nil {
			break
		}
		list = last.Then(answers)
		known += len(list)
	}
	// The caller receives the type q.Answers declares, or a refusal naming the action. [[spec/tickets/deliver-checks-the-declared-type]]
	if want := s.owner(name).answers; want != nil {
		if got := reflect.TypeOf(said); got == nil || !got.AssignableTo(want) {
			return nil, fmt.Errorf("%s answers a %T, and q.Answers declares a %s", name, said, want)
		}
	}
	return said, nil
}

// The undo of each request that ran, newest first. [[spec/design_output/model#an-action-lists-requests]]
func undo(done []Request, accept func(Request) (any, error)) error {
	var failed []error
	for i := len(done) - 1; i >= 0; i-- {
		if done[i].Undo == nil {
			continue
		}
		if _, err := accept(*done[i].Undo); err != nil {
			failed = append(failed, err)
		}
	}
	return errors.Join(failed...)
}
