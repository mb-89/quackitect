// The fleet: one row a work branch, read off the record its group carries,
// since every box writes its hold there whoever fires it.
// [[spec/tickets/boxes-write-their-final-record]]
package branches

// The variable the harness names a cloud box's session in, which a pull request event routes to. [[spec/tickets/boxes-write-their-final-record]]
const sessionVar = "CLAUDE_CODE_REMOTE_SESSION_ID"

// One box on a work branch: its standing, the last hand its record names, and that hand's session and final record. [[spec/tickets/boxes-write-their-final-record]]
type boxRow struct {
	Branch, Standing, Hand, Session, Model, Cost, Final string
}

// One row a work branch, off its group's record. [[spec/tickets/boxes-write-their-final-record]]
func fleetRows(_ []stand, _ map[string]string) []boxRow {
	return nil
}
