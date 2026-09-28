// The shadow stage of a migration slice: the old path answers, the new one
// runs beside it, and every mismatch writes a shadow row to the session log,
// which ./RUNME.sh log --kind shadow names.
// [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
package shadow

import (
	"encoding/json"
	"path/filepath"
	"time"

	"quackitect/src/config"
)

// The mode a slice key reads while old and new both run. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
const Mode = "shadow"

// The session log, whose folder .claude/skills/level0/lib/folders.js owns, spelled again here because a Go package imports no JavaScript. [[spec/design_output/log#one-verb-reads-the-log]]
const LogAt = ".se/.log/session.jsonl"

// The stamp every session log row carries. [[spec/design_output/log#one-verb-reads-the-log]]
const rowStamp = "2006-01-02T15:04:05.000Z"

// Whether a slice runs in shadow, read off its key under migration. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
func On(root, key string) bool {
	mode, _ := config.Value(root, "migration."+key)
	return mode == Mode
}

// One mismatch of a slice: what the owner reads, and the two answers. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
type Row struct {
	Slice string
	Said  string
	Old   any
	New   any
	More  map[string]any
}

// Appends one shadow row to the session log. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
func Write(root string, row Row, now time.Time) error {
	fields := map[string]any{}
	for name, value := range row.More {
		fields[name] = value
	}
	fields["at"] = now.UTC().Format(rowStamp)
	fields["level"] = "info"
	fields["kind"] = Mode
	fields["said"] = row.Said
	fields["slice"] = row.Slice
	fields["old"] = row.Old
	fields["new"] = row.New
	line, err := json.Marshal(fields)
	if err != nil {
		return err
	}
	path := filepath.Join(root, filepath.FromSlash(LogAt))
	return appendLine(path, append(line, '\n'))
}
