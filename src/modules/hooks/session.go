// The session file the door writes on a session's start: the id and the
// harness, which the hand reads off it.
// [[spec/tickets/level0-hooks-forward-to-go]]
package hooks

// Writes the session file off a session start under the root. [[spec/tickets/level0-hooks-forward-to-go]]
func (d *Door) writesSession(_ Post, _ string) {}
