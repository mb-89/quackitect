// The work tab's road to the index: the base file, the rows and the count,
// each read off the catalog the window hands the tab, and each change the
// watch sends.
// [[spec/tickets/the-work-tab-reads-v1]]

package work

import (
	"context"
	"encoding/json"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
	"quackitect/src/tui/tree"
)

// The names the tab reads: the base file through the files module, the rows and the count. [[spec/tickets/the-work-tab-reads-v1]]
const (
	baseName  = "files/" + BaseAt
	rowsName  = "work/rows"
	badgeName = "work/open-tasks"
)

// What the tab reads through: the /v1 door, or the fake a case seeds. [[spec/tickets/the-work-tab-reads-v1]]
type Source interface {
	registry.Catalog
	registry.Watcher
	registry.Caller
}

// The watch ends, and the tab says why and watches again after a pause. [[spec/tickets/the-work-tab-reads-v1]]
type watchEnded registry.Ended

type watchAgain struct{}

// The tree the base file and work/rows draw, each name linking under the file system's root. [[spec/tickets/the-work-tab-reads-v1]]
func Read(from registry.Catalog) (*tree.Tree, error) {
	base, err := baseOf(from)
	if err != nil {
		return nil, err
	}
	rows, err := from.Read(rowsName)
	if err != nil {
		return nil, err
	}
	return drawn(base, rows, "")
}

// The base file's text, as the files module answers it. [[spec/tickets/the-work-tab-reads-v1]]
func baseOf(from registry.Catalog) (string, error) {
	said, err := from.Read(baseName)
	if err != nil {
		return "", err
	}
	var file struct {
		Text string `json:"text"`
	}
	if err := json.Unmarshal(said, &file); err != nil {
		return "", err
	}
	return file.Text, nil
}

// The tree the rows draw over the base file, each name linking under the root. [[spec/tickets/the-work-tab-reads-v1]]
func drawn(base string, rows json.RawMessage, root string) (*tree.Tree, error) {
	var held []IndexRow
	if err := json.Unmarshal(rows, &held); err != nil {
		return nil, err
	}
	out, err := ViewOver(base, held)
	if err != nil {
		return nil, err
	}
	linked(out, root)
	return out, nil
}

// A change to the rows redraws the tree, and one to the count redraws the label. Each change arms the next. [[spec/tickets/the-work-tab-reads-v1]]
func (t *Tab) changes(m *frame.Model, msg registry.Change) (bool, tea.Cmd) {
	switch msg.Name {
	case rowsName:
		t.redraws(m, msg.Value)
	case badgeName:
		if json.Unmarshal(msg.Value, &t.count) == nil {
			t.counted = true
		}
	default:
		return false, nil
	}
	if t.stream == nil {
		return true, t.watches()
	}
	return true, t.next()
}

// The rows land over the base file, read once. A change that fails to draw keeps the tree standing, and says why. [[spec/tickets/the-work-tab-reads-v1]]
func (t *Tab) redraws(m *frame.Model, rows json.RawMessage) {
	if t.base == "" {
		base, err := baseOf(t.From)
		if err != nil {
			t.Why = err.Error()
			return
		}
		t.base = base
	}
	grid, err := drawn(t.base, rows, Root(t.Path))
	if err != nil {
		t.Why = err.Error()
		return
	}
	t.takes(m, Msg{Tree: grid})
}

// The watch over the rows and the count, whose first events carry each value. [[spec/tickets/the-work-tab-reads-v1]]
func (t *Tab) watches() tea.Cmd {
	if t.From == nil {
		return nil
	}
	t.stream = registry.Stream(context.Background(), t.From, []string{rowsName, badgeName})
	return t.next()
}

// The next message off the tab's own stream, whose end lands as the tab's own message, so another tab's watch ending reaches that tab. [[spec/tickets/the-work-tab-reads-v1]]
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

// A watch that ends shows its reason, and the tab watches again after a pause, so a dead index spins nothing. [[spec/tickets/the-work-tab-reads-v1]]
func (t *Tab) ended(msg watchEnded) tea.Cmd {
	t.Why = msg.Why
	t.stream = nil
	return tea.Tick(frame.Poll, func(time.Time) tea.Msg { return watchAgain{} })
}
