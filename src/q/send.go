// The index runs the requests an action answers: in order, each Then reading
// the answers, and the undo of every request before a failing one.
// [[spec/design_output/model#an-action-lists-requests]]
package q

import (
	"errors"
	"fmt"
)

// Runs the action's requests through accept, which reaches the IO module each names. [[spec/design_output/model#an-action-lists-requests]]
func (s *Store) Send(name string, input any, accept func(Request) (any, error)) error {
	list, err := s.Act(name, input)
	if err != nil {
		return err
	}
	var done []Request
	for len(list) > 0 {
		answers := make([]any, 0, len(list))
		for _, one := range list {
			said, err := accept(one)
			if err != nil {
				return errors.Join(fmt.Errorf("%s.%s refuses: %w", one.Module, one.Verb, err), undo(done, accept))
			}
			answers = append(answers, said)
			done = append(done, one)
		}
		last := list[len(list)-1]
		if last.Then == nil {
			break
		}
		list = last.Then(answers)
	}
	return nil
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
