// The log tab draws off log/rows, starts again on a shorter log, and reads a
// row whole for the details.
// [[spec/tickets/the-log-tab-reads-v1]]

package log

import (
	"encoding/json"
	"path/filepath"
	"testing"
	"time"

	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
)

// A change carrying these rows, as the watch sends it. [[spec/tickets/the-log-tab-reads-v1]]
func changeOf(t *testing.T, rows ...IndexRow) registry.Change {
	t.Helper()
	value, err := json.Marshal(rows)
	if err != nil {
		t.Fatal(err)
	}
	return registry.Change{Name: rowsName, Revision: int64(len(rows)), Value: value}
}

// A tab over a fake catalog, and the window holding it. [[spec/tickets/the-log-tab-reads-v1]]
func v1Tab(t *testing.T) (*Tab, *frame.Model) {
	t.Helper()
	tab := New(filepath.Join(t.TempDir(), "session.jsonl"), time.UTC)
	tab.From = registry.Fake{}
	m := frame.New(tab.Path, time.UTC, []frame.Tab{tab})
	return tab, &m
}

var (
	rowOne   = IndexRow{At: "2026-09-30T01:00:00Z", Level: "info", Kind: "prompt", Said: "one"}
	rowTwo   = IndexRow{At: "2026-09-30T01:00:01Z", Level: "warn", Kind: "tool", Said: "two"}
	rowThree = IndexRow{At: "2026-09-30T01:00:02Z", Level: "info", Kind: "reply", Said: "three"}
)

func TestTheLogTabDrawsOffLogRows(t *testing.T) {
	t.Parallel()
	tab, m := v1Tab(t)
	handled, next := tab.Update(m, changeOf(t, rowOne, rowTwo))
	if !handled || next == nil {
		t.Fatalf("the change lands %v, and wants the tab to take it and watch on", handled)
	}
	if len(tab.All) != 2 || tab.All[1].Said != "two" || tab.All[1].Level != "warn" {
		t.Fatalf("the tab holds %+v, and wants both rows", tab.All)
	}
}

func TestAShorterLogReadsAsANewSession(t *testing.T) {
	t.Parallel()
	tab, m := v1Tab(t)
	tab.Update(m, changeOf(t, rowOne, rowTwo, rowThree))
	tab.Follow = false
	tab.Update(m, changeOf(t, rowOne))
	if len(tab.All) != 1 || !tab.Follow || tab.Sel != -1 {
		t.Fatalf("the tab holds %d rows, follow %v, at %d, and wants a fresh start", len(tab.All), tab.Follow, tab.Sel)
	}
}

func TestTheDetailsDrawARowWhole(t *testing.T) {
	t.Parallel()
	row := IndexRow{At: "2026-09-30T01:00:00Z", Level: "info", Kind: "tool", Said: "ran", Text: "the body", Extra: map[string]string{"ticket": "a-ticket"}}
	one := RecordOf(row)
	if one.Kind != "tool" || one.Text != "the body" || one.Extra["ticket"] != "a-ticket" || one.At.IsZero() || one.Raw == "" {
		t.Fatalf("the record reads %+v, and wants the row whole", one)
	}
}
