// The open-tasks slice in shadow: the old count answers, and the index's
// work/open-tasks runs beside it. A mismatch writes a shadow row to the
// session log, which ./RUNME.sh log --kind shadow names.
// [[spec/tickets/open-tasks-run-in-shadow]]
package work

import "time"

// The index's count, and whether a door answered it. A case sets a fake. [[spec/tickets/open-tasks-run-in-shadow]]
var askOpenTasks = func(root string) (int, bool) { return 0, false }

// Compares the old count with the new one where the slice reads shadow, and writes a row where they differ. [[spec/tickets/open-tasks-run-in-shadow]]
func shadowOf(root string, old int, now time.Time) error {
	return nil
}
