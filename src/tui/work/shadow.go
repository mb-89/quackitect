// The work view in shadow: the rows and the badge the tab draws, read beside
// the rows under work/rows and the badge off index/names. Each pair read apart
// becomes one shadow row in the session log.
// [[spec/tickets/the-work-view-gains-actions]]

package work

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/src/tui/frame"
	"quackitect/src/tui/tree"
)

// The name the index answers the badges under, and the slice a mismatch names. [[spec/tickets/the-work-view-gains-actions]]
const (
	namesName   = "index/names"
	windowSlice = "window"
	modeShadow  = "shadow"
	looksCount  = "count"
)

// One row of index/names, on the fields the badge reads. [[spec/tickets/the-work-view-gains-actions]]
type NameRow struct {
	Name  string `json:"name"`
	Label string `json:"label"`
	Icon  string `json:"icon"`
	Looks string `json:"looks"`
	Value any    `json:"value"`
}

// A pair read apart, by name, as each path reads it. [[spec/tickets/the-work-view-gains-actions]]
type Mismatch struct {
	Name, Old, New string
}

// The shadow a work tab holds: the source, the mode the config names, and the clock the row's stamp reads. A pair already told stands once in the log. [[spec/tickets/the-work-view-gains-actions]]
type Shadow struct {
	From frame.Source
	Mode func() string
	Now  func() time.Time

	mu   sync.Mutex
	told map[string]bool
}

// The badge drawn off the label and the look the port declares and the count it holds. [[spec/tickets/the-work-view-gains-actions]]
func BadgeOf(names []NameRow, name string) string {
	for _, one := range names {
		if one.Name != name {
			continue
		}
		if one.Looks == looksCount {
			return fmt.Sprintf("%s (%v)", one.Label, one.Value)
		}
		return one.Label
	}
	return ""
}

// What a path reads of one row: its state and its place. [[spec/tickets/the-work-view-gains-actions]]
func readOf(state, queue string) string { return fmt.Sprintf("state=%s queue=%s", state, queue) }

// Every row the tab and work/rows read apart, on state and queue, and each row one path holds alone. [[spec/tickets/the-work-view-gains-actions]]
func Apart(items []tree.Item, rows []IndexRow) []Mismatch {
	standing := map[string]tree.Item{}
	var mark func([]tree.Item)
	mark = func(all []tree.Item) {
		for _, one := range all {
			standing[one.Name] = one
			mark(one.Kids)
		}
	}
	mark(items)
	var out []Mismatch
	seen := map[string]bool{}
	for _, row := range rows {
		seen[row.Name] = true
		now := readOf(row.State, row.Queue)
		one, found := standing[row.Name]
		old := ""
		if found {
			old = readOf(one.Keys["state"], one.Keys[QueueKey])
		}
		if old != now {
			out = append(out, Mismatch{Name: row.Name, Old: old, New: now})
		}
	}
	for name, one := range standing {
		if !seen[name] {
			out = append(out, Mismatch{Name: name, Old: readOf(one.Keys["state"], one.Keys[QueueKey])})
		}
	}
	return out
}

// The badge the strip draws and the index answers, where the two read apart. [[spec/tickets/the-work-view-gains-actions]]
func BadgeApart(old, now string) []Mismatch {
	if old == now {
		return nil
	}
	return []Mismatch{{Name: "badge", Old: old, New: now}}
}

// Reads work/rows and index/names, and appends one shadow row to the log at path for each pair read apart, where the mode stands at shadow. [[spec/tickets/the-work-view-gains-actions]]
func (s *Shadow) Check(path string, items []tree.Item, badge string) error {
	if s == nil || s.Mode == nil || s.Mode() != modeShadow {
		return nil
	}
	var rows []IndexRow
	if err := s.read(rowsName, &rows); err != nil {
		return err
	}
	var names []NameRow
	if err := s.read(namesName, &names); err != nil {
		return err
	}
	apart := append(Apart(items, rows), BadgeApart(badge, BadgeOf(names, badgeName))...)
	for _, one := range apart {
		line := fmt.Sprintf("%s in shadow: %s reads %q on the tab, and %q off the index", windowSlice, one.Name, one.Old, one.New)
		if s.tell(line) {
			if err := frame.WriteShadow(path, s.Now(), windowSlice, line); err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *Shadow) read(name string, into any) error {
	said, err := s.From.Read(name)
	if err != nil {
		return err
	}
	return json.Unmarshal(said, into)
}

// Whether the line is new, which it stops being once told. [[spec/tickets/the-work-view-gains-actions]]
func (s *Shadow) tell(line string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.told == nil {
		s.told = map[string]bool{}
	}
	if s.told[line] {
		return false
	}
	s.told[line] = true
	return true
}

// The compare runs beside the tab over a copy of what it draws, once the count has landed, so no later message moves a row under it. [[spec/tickets/the-work-view-gains-actions]]
func (t *Tab) check() tea.Cmd {
	if t.Shadow == nil || t.Tree == nil || !t.counted {
		return nil
	}
	var copied []tree.Item
	var take func([]tree.Item)
	take = func(all []tree.Item) {
		for _, one := range all {
			copied = append(copied, tree.Item{Name: one.Name, Keys: map[string]string{"state": one.Keys["state"], QueueKey: one.Keys[QueueKey]}})
			take(one.Kids)
		}
	}
	take(t.Tree.Items)
	badge, path, shadow := t.Label(nil), t.Path, t.Shadow
	return func() tea.Msg {
		_ = shadow.Check(path, copied, badge)
		return nil
	}
}
