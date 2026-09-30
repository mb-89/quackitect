// The log tab's road to the index: the rows log/rows answers, each change
// the watch sends, and a row of the log module read as a record.
// [[spec/tickets/the-log-tab-reads-v1]]

package log

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
)

// The name the index answers the session rows under. [[spec/design_output/model#the-log-is-a-view]]
const rowsName = "log/rows"

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

// The watch ends, and the tab says why and watches again after a pause. [[spec/tickets/log-tab-takes-its-rows]]
type watchEnded registry.Ended

type watchAgain struct{}

// A row of the log module, read as the record the tab draws. A broken row keeps its line as the raw text, and any other shows its JSON. [[spec/tickets/the-log-tab-reads-v1]]
func RecordOf(row IndexRow) Record {
	r := Record{Level: row.Level, Kind: row.Kind, Said: row.Said, Text: row.Text, Extra: row.Extra, Broken: row.Broken}
	if at, err := time.Parse(time.RFC3339Nano, row.At); err == nil {
		r.At = at
	}
	if row.Broken {
		r.Raw = row.Said
		return r
	}
	raw, _ := json.Marshal(row)
	r.Raw = string(raw)
	return r
}

// Every row as a record, and a row with no time takes the one before it. [[spec/design_output/tui#one-row]]
func asRecords(rows []IndexRow) []Record {
	out := make([]Record, 0, len(rows))
	var last time.Time
	for _, row := range rows {
		r := RecordOf(row)
		if r.At.IsZero() {
			r.At = last
		}
		last = r.At
		out = append(out, r)
	}
	return out
}

// The tab takes log/rows alone, since it stands first and the frame hands each message to the first tab taking it. A log shorter than the one held is a new session, so the tab starts again. [[spec/tickets/log-tab-takes-its-rows]]
func (t *Tab) changes(m *frame.Model, msg registry.Change) (bool, tea.Cmd) {
	if msg.Name != rowsName {
		return false, nil
	}
	var rows []IndexRow
	if err := json.Unmarshal(msg.Value, &rows); err != nil {
		t.Err = err
		return true, t.next()
	}
	all := asRecords(rows)
	if len(all) < len(t.All) {
		t.Sel, t.Top, t.Follow = -1, 0, true
	}
	t.All, t.Err = all, nil
	t.Rebuild(m.Rows())
	m.LoadPane()
	if t.stream == nil {
		return true, t.watches()
	}
	return true, t.next()
}

// The watch over log/rows, whose first event carries every row. [[spec/tickets/the-log-tab-reads-v1]]
func (t *Tab) watches() tea.Cmd {
	if t.From == nil {
		return nil
	}
	t.stream = registry.Stream(context.Background(), t.From, []string{rowsName})
	return t.next()
}

// The next message off the tab's own stream, whose end lands as the tab's own message. [[spec/tickets/log-tab-takes-its-rows]]
func (t *Tab) next() tea.Cmd {
	armed := registry.Next(t.stream)
	return func() tea.Msg {
		said := armed()
		if ended, over := said.(registry.Ended); over {
			return watchEnded(ended)
		}
		return said
	}
}

// A watch that ends shows its reason where the rows stand, and the tab watches again after a pause. [[spec/tickets/the-log-tab-reads-v1]]
func (t *Tab) ended(msg watchEnded) tea.Cmd {
	if msg.Why != "" {
		t.Err = errors.New(msg.Why)
	}
	t.stream = nil
	return tea.Tick(frame.Poll, func(time.Time) tea.Msg { return watchAgain{} })
}
