// The place chord. A person presses p, then a digit, and the selected ticket
// takes that place in the queue: its todo names the row standing there now,
// or reads true for the first place. The queue verb reads the todo and moves
// the row, and the tab draws what the verb answers.
// [[spec/design_output/pull#the-queue-is-an-outline]]

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
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
	one := m.work.Selected()
	if one == nil {
		return
	}
	n := int(key[0] - '0')
	mine := m.work.PlaceOf(one.Name)
	value := flagOn
	switch {
	// The same place again takes the todo off, so the score places the row once more. [[spec/design_output/pull#a-todo-forces-a-place]]
	case one.Keys[todoKey] != "" && one.Keys[todoKey] != flagOff && mine == n:
		value = flagOff
	case mine == n:
		m.workNotice = fmt.Sprintf("%s stands at %d already", one.Name, n)
		return
	case n == 1:
	default:
		value = m.work.anchorFor(one.Name, n, mine)
		if value == "" {
			m.workNotice = fmt.Sprintf("the places at this level end at %d, so no row stands at %d", m.work.LastPlace(one.Name), n)
			return
		}
	}
	// The override lands in the plan file on this box, so the ticket's front stays as it is and nothing travels. [[spec/design_output/pull#a-todo-forces-a-place]]
	setValue(one, todoKey, flagOf(value != flagOff))
	if err := writePlace(workRoot(m.path), one.Name, value); err != nil {
		m.workNotice = err.Error()
		return
	}
	m.workNotice = fmt.Sprintf("%s takes place %d once the queue reads it", one.Name, n)
}

// The plan file this box holds, whose folder folders.js owns and whose name lib/runs.js owns, spelled again here because a Go module imports neither. [[spec/design_output/stop#the-plan]]
const planAt = ".se/.runtime/plan.json"

// The override lands under places in the plan file, and the same place again takes it out. [[spec/design_output/pull#a-todo-forces-a-place]]
func writePlace(root, name, value string) error {
	file := filepath.Join(root, filepath.FromSlash(planAt))
	plan := map[string]any{}
	if text, err := os.ReadFile(file); err == nil {
		_ = json.Unmarshal(text, &plan)
	}
	places, _ := plan["places"].(map[string]any)
	if places == nil {
		places = map[string]any{}
	}
	if value == flagOff {
		delete(places, name)
	} else {
		places[name] = value
	}
	plan["places"] = places
	said, err := json.MarshalIndent(plan, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(file), 0o755); err != nil {
		return err
	}
	return os.WriteFile(file, append(said, '\n'), 0o644)
}

// The place a row holds at its own level: the last segment of its queue number, and zero where it holds none or stands ahead of one. [[spec/design_output/pull#a-todo-forces-a-place]]
func (t Tree) PlaceOf(name string) int {
	for _, held := range t.Siblings(name) {
		if held.Name == name {
			return placeNumber(held.Keys[queueKey])
		}
	}
	return 0
}

// The row a place stands before: the row at n where the row moves up, the row past n where it moves down, and last past the end. [[spec/design_output/pull#a-todo-forces-a-place]]
func (t Tree) anchorFor(name string, n, mine int) string {
	if mine == 0 || n < mine {
		return t.SiblingAt(name, n)
	}
	if at := t.SiblingAt(name, n+1); at != "" {
		return at
	}
	if t.LastPlace(name) >= n {
		return lastPlaceWord
	}
	return ""
}

// The sibling standing at that place, by its own number, and nothing where none does. [[spec/design_output/pull#a-todo-forces-a-place]]
func (t Tree) SiblingAt(name string, n int) string {
	for _, held := range t.Siblings(name) {
		if held.Name != name && placeNumber(held.Keys[queueKey]) == n {
			return held.Name
		}
	}
	return ""
}

// The highest place any sibling holds, so a press one past it means last. [[spec/design_output/pull#a-todo-forces-a-place]]
func (t Tree) LastPlace(name string) int {
	last := 0
	for _, held := range t.Siblings(name) {
		if held.Name != name {
			last = max(last, placeNumber(held.Keys[queueKey]))
		}
	}
	return last
}

// The number a place ends on, so `2.3` reads three, and a negative or empty place reads zero. [[spec/design_output/pull#a-todo-forces-a-place]]
func placeNumber(place string) int {
	segments := strings.Split(place, ".")
	n, err := strconv.Atoi(segments[len(segments)-1])
	if err != nil || n < 0 || strings.HasPrefix(place, "-") {
		return 0
	}
	return n
}
