// The place chord. A person presses p, then a digit, and the selected ticket
// takes that place in the queue: its todo names the row standing there now,
// or reads true for the first place. The queue verb reads the todo and moves
// the row, and the tab draws what the verb answers.
// [[spec/design_output/pull#the-queue-is-an-outline]]

package main

import (
	"fmt"
	"sort"
)

// The key opening the chord, and the digits closing it. [[spec/design_output/tui#the-work-tab-takes-edits]]
const (
	placeKey   = "p"
	firstPlace = '1'
	lastPlace  = '9'
	// The word a todo carries for the last place, which src/scripts/pull-outline.js owns and a Go module spells again. [[spec/design_output/pull#the-queue-is-an-outline]]
	lastPlaceWord = "last"
)

// The chord opens on p, and the tab says what it waits for. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (m *model) openPlace() {
	if m.work == nil || m.work.Selected() == nil {
		return
	}
	m.placing = true
	m.workNotice = "place: press 1 to 9"
}

// The digit closes the chord, and any other key drops it. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (m *model) placeAt(key string) {
	m.placing = false
	m.workNotice = ""
	if len(key) != 1 || key[0] < firstPlace || key[0] > lastPlace {
		return
	}
	if why := m.ticketRules().refuses(todoKey); why != "" {
		m.workNotice = why
		return
	}
	one := m.work.Selected()
	if one == nil {
		return
	}
	n := int(key[0] - '0')
	beside := m.work.PlacedBeside(one.Name)
	value := flagOn
	switch {
	case n == 1:
	case n-1 < len(beside):
		value = beside[n-1].Name
	case n-1 == len(beside):
		value = lastPlaceWord
	default:
		m.workNotice = fmt.Sprintf("%d rows stand at this level, so no row stands at %d", len(beside)+1, n)
		return
	}
	setValue(one, todoKey, value)
	setValue(one, editedKey, todoKey)
	if err := writeTicket(workRoot(m.path), *one); err != nil {
		m.workNotice = err.Error()
		return
	}
	m.workNotice = fmt.Sprintf("%s takes place %d once the queue reads it", one.Name, n)
}

// The rows beside one at its own level that hold a place, in place order, without the row itself. [[spec/design_output/pull#the-queue-is-an-outline]]
func (t Tree) PlacedBeside(name string) []Item {
	out := []Item{}
	for _, held := range t.Siblings(name) {
		if held.Name != name && held.Keys[queueKey] != "" {
			out = append(out, held)
		}
	}
	sort.SliceStable(out, func(a, b int) bool {
		return under(out[a].Keys[queueKey], out[b].Keys[queueKey])
	})
	return out
}
