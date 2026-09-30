// The place chord. A person presses p, then a digit, and the tab posts the
// place the base file names for p. The verb holds the place rule and writes
// the plan file, and the watch on work/rows draws the row at its new place.
// [[spec/design_output/pull#the-queue-is-an-outline]]

package work

import (
	tea "github.com/charmbracelet/bubbletea"
)

// The key opening the chord, and the digits closing it. [[spec/design_output/tui#the-work-tab-takes-edits]]
const (
	placeKey   = "p"
	firstPlace = '1'
	lastPlace  = '9'
)

// The input of a place, as the verb reads it. [[spec/design_output/pull#a-todo-forces-a-place]]
type placed struct {
	Name string `json:"name"`
	N    int    `json:"n"`
}

// The chord opens on p, and the tab says what it waits for. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (t *Tab) openPlace() {
	if t.Tree == nil || t.Tree.Selected() == nil {
		return
	}
	t.Placing = true
	t.Notice = "place: press 1 to 9"
}

// The digit closes the chord and posts the place, and any other key drops it. [[spec/design_output/pull#a-todo-forces-a-place]]
func (t *Tab) placeAt(key string) tea.Cmd {
	t.Placing = false
	t.Notice = ""
	if len(key) != 1 || key[0] < firstPlace || key[0] > lastPlace {
		return nil
	}
	one := t.Tree.Selected()
	if one == nil {
		return nil
	}
	name, err := t.keyAction(placeKey)
	if err != nil {
		t.Notice = err.Error()
		return nil
	}
	return t.posts(name, []any{placed{Name: one.Name, N: int(key[0] - '0')}}, "")
}
