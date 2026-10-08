// quack log: every row of the session log as the log module reads it, as
// JSON. The log verb reads it beside its own rows while the log slice runs in
// shadow.
// [[spec/tickets/the-log-topic-lands]]
package main

import (
	"encoding/json"
	"errors"
	"io/fs"
	"path/filepath"

	logmodule "quackitect/src/modules/log"
)

// The session log under the root, in the log folder src/modules/check/folders.go owns. [[spec/design_output/log#what-one-line-looks-like]]
const sessionLog = ".se/.log/session.jsonl"

// The rows the module reads off one session log's text. [[spec/tickets/the-log-topic-lands]]
func logRows(text string) []logmodule.Row {
	return logmodule.RowsOf(text)
}

// Prints every row of the session log under the root, and no row where no log stands. [[spec/tickets/the-log-topic-lands]]
func logs(box boxDoors, root string) error {
	body, err := box.disk.read(filepath.Join(root, filepath.FromSlash(sessionLog)))
	if err != nil && !errors.Is(err, fs.ErrNotExist) {
		return err
	}
	text, err := json.Marshal(logRows(string(body)))
	if err != nil {
		return err
	}
	_, err = box.out.Write(append(text, '\n'))
	return err
}
