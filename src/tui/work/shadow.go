// The open-tasks slice in shadow: the old count answers, and the index's
// work/open-tasks runs beside it. A mismatch writes a shadow row to the
// session log, which ./RUNME.sh log --kind shadow names.
// [[spec/tickets/open-tasks-run-in-shadow]]
package work

import (
	"encoding/json"
	"fmt"
	"time"

	"quackitect/src/shadow"
)

// The slice, the default file's key for it, and the index name its new count reads. [[spec/tickets/open-tasks-run-in-shadow]]
const (
	openTasksSlice = "open-tasks"
	openTasksKey   = "opentasks"
	openTasksName  = "work/open-tasks"
)

// The index's count, and whether a door answered it. A door standing nowhere answers nothing, and starts nothing. [[spec/tickets/open-tasks-run-in-shadow]]
var askOpenTasks = func(root string) (int, bool) {
	said, err := postIndex(root, "value", map[string]string{"name": openTasksName})
	if err != nil {
		return 0, false
	}
	var count int
	if json.Unmarshal(said, &count) != nil {
		return 0, false
	}
	return count, true
}

// Compares the old count with the new one where the slice reads shadow, and writes a row where they differ. [[spec/tickets/open-tasks-run-in-shadow]]
func shadowOf(root string, old int, now time.Time) error {
	if !shadow.On(root, openTasksKey) {
		return nil
	}
	count, answered := askOpenTasks(root)
	if !answered || count == old {
		return nil
	}
	return shadow.Write(root, shadow.Row{
		Slice: openTasksSlice, Old: old, New: count,
		Said: fmt.Sprintf("%s in shadow: the old count reads %d, the new one %d", openTasksSlice, old, count),
	}, now)
}
