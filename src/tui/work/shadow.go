// The open-tasks slice in shadow: the old count answers, and the index's
// work/open-tasks runs beside it. A mismatch writes a shadow row to the
// session log, which ./RUNME.sh log --kind shadow names.
// [[spec/tickets/open-tasks-run-in-shadow]]
package work

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"time"

	"quackitect/src/config"
)

// The slice, the default file's key for it, and the index name its new count reads. [[spec/tickets/open-tasks-run-in-shadow]]
const (
	openTasksSlice = "open-tasks"
	openTasksKey   = "migration.opentasks"
	openTasksName  = "work/open-tasks"
	shadowMode     = "shadow"
)

// The session log, whose folder .claude/skills/level0/lib/folders.js owns, spelled again here because a Go module imports neither. [[spec/design_output/log#one-verb-reads-the-log]]
const sessionLogAt = ".se/.log/session.jsonl"

// The stamp every session log row carries. [[spec/design_output/log#one-verb-reads-the-log]]
const rowStamp = "2006-01-02T15:04:05.000Z"

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
	if mode, _ := config.Value(root, openTasksKey); mode != shadowMode {
		return nil
	}
	count, answered := askOpenTasks(root)
	if !answered || count == old {
		return nil
	}
	row, err := json.Marshal(map[string]any{
		"at": now.UTC().Format(rowStamp), "level": "info", "kind": shadowMode,
		"said":  fmt.Sprintf("%s in shadow: the old count reads %d, the new one %d", openTasksSlice, old, count),
		"slice": openTasksSlice, "old": old, "new": count,
	})
	if err != nil {
		return err
	}
	path := filepath.Join(root, filepath.FromSlash(sessionLogAt))
	if err := makeDir(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	return appendFile(path, append(row, '\n'))
}
