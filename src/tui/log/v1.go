// The log tab's road to the index: the rows log/rows answers, each change
// the watch sends, and a row of the log module read as a record.
// [[spec/tickets/the-log-tab-reads-v1]]

package log

import "quackitect/src/tui/registry"

// What the tab reads through: the /v1 door, or the fake a case seeds. [[spec/tickets/the-log-tab-reads-v1]]
type Watched interface {
	registry.Catalog
	registry.Watcher
}

// One row of log/rows, whole, the way the log module answers it. [[spec/tickets/the-log-tab-reads-v1]]
type IndexRow struct {
	At     string            `json:"at"`
	Level  string            `json:"level"`
	Kind   string            `json:"kind"`
	Said   string            `json:"said"`
	Text   string            `json:"text,omitempty"`
	Extra  map[string]string `json:"extra,omitempty"`
	Broken bool              `json:"broken,omitempty"`
}

// A row of the log module, read as the record the tab draws. [[spec/tickets/the-log-tab-reads-v1]]
func RecordOf(_ IndexRow) Record { return Record{} }
