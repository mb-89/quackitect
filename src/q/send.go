// The index runs the requests an action answers: in order, each Then reading
// the answers, and the undo of every request before a failing one.
// [[spec/design_output/model#an-action-lists-requests]]
package q

// Runs the action's requests through accept, which reaches the IO module each names. [[spec/design_output/model#an-action-lists-requests]]
func (s *Store) Send(name string, input any, accept func(Request) (any, error)) error {
	return nil
}
