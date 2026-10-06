// The fleet: one row a work branch, read off the record its group carries,
// since every box writes its hold there whoever fires it.
// [[spec/tickets/boxes-write-their-final-record]]
package branches

// The variable the harness names a cloud box's session in, which a pull request event routes to. [[spec/tickets/boxes-write-their-final-record]]
const sessionVar = "CLAUDE_CODE_REMOTE_SESSION_ID"

// One box on a work branch: its standing, the last hand its record names, and that hand's session and final record. [[spec/tickets/boxes-write-their-final-record]]
// The tip, its age and the pull request come off the refs. [[spec/tickets/the-fleet-verb-watches-boxes]]
type boxRow struct {
	Branch, Standing, Hand, Session, Model, Cost, Final string
	Tip, Age, Pull                                      string
	AgeSeconds                                          int64
}

// The config key naming the span a held box sits idle past, and its default. [[spec/tickets/the-fleet-verb-watches-boxes]]
const (
	idleKey  = "fleet.idleAfter"
	idleSpan = "30m"
)

// A box that stalls: its branch and why. [[spec/tickets/the-fleet-verb-watches-boxes]]
type wake struct {
	Branch, Why string
}

// The ways a box stalls. [[spec/tickets/the-fleet-verb-watches-boxes]]
const (
	wakeIdle    = "idle"
	wakeStopped = "stopped"
	wakeFailed  = "failed"
)

// One wake a box that stalls. [[spec/tickets/the-fleet-verb-watches-boxes]]
func wakesOf(_ []boxRow, _ int64) []wake {
	return nil
}

// One row a work branch, off its group's record. [[spec/tickets/boxes-write-their-final-record]]
func fleetRows(stood []stand, standing map[string]string) []boxRow {
	out := make([]boxRow, 0, len(stood))
	for _, one := range stood {
		row := boxRow{Branch: one.Branch, Standing: standing[one.Branch]}
		for _, entry := range recordIn(one.Ticket) {
			if hand := entryField(entry, "hand"); hand != "" {
				row.Hand, row.Session = hand, entryField(entry, "session")
				row.Model, row.Cost, row.Final = entryField(entry, "model"), entryField(entry, "cost"), entryField(entry, "final")
			}
		}
		out = append(out, row)
	}
	return out
}
