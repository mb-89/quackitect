// The place chord: p, then a digit, writes the todo the queue reads.
// [[spec/design_output/pull#the-queue-is-an-outline]]

package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A window whose roots carry places, with every ticket on disk. [[spec/design_output/tui#the-work-tab-takes-edits]]
func placedWindow(t *testing.T) (model, string) {
	t.Helper()
	m, root := editWindow(t)
	writeAt(t, root, "spec/tickets/a-loose-one.md", strings.Replace(childNote, "group: one-group\n", "", 1))
	writeAt(t, root, "spec/tickets/one-group.md", strings.Replace(childNote, "group: one-group\n", "", 1))
	places, _ := placesIn([]byte(`{"branches":[{"name":"one-group","queue":"1","tickets":[{"name":"a-child","queue":"1.1"}]}],"loose":[{"name":"a-loose-one","queue":"2"}]}`))
	m.work.Placed(places)
	return m, root
}

// The override a place writes, off the plan file on this box, and nothing where none stands. [[spec/design_output/pull#a-todo-forces-a-place]]
func placeIn(t *testing.T, root, name string) string {
	t.Helper()
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(planAt)))
	if err != nil {
		return ""
	}
	var plan struct {
		Places map[string]string `json:"places"`
	}
	if err := json.Unmarshal(text, &plan); err != nil {
		t.Fatal(err)
	}
	return plan.Places[name]
}

func frontAt(t *testing.T, root, name string) string {
	t.Helper()
	said, err := os.ReadFile(filepath.Join(root, "spec", "tickets", name+".md"))
	if err != nil {
		t.Fatal(err)
	}
	return string(said)
}

// [[spec/design_output/pull#the-queue-is-an-outline]]
func TestPThenADigitWritesTheTodoTheQueueReads(t *testing.T) {
	t.Parallel()
	m, root := placedWindow(t)
	m = toRow(m, "a-loose-one")
	m = pressed(m, "p")
	if !m.placing || !strings.Contains(m.workNotice, "1 to 9") {
		t.Fatalf("p opens the chord and says what it waits for, and the tab says %q", m.workNotice)
	}
	m = pressed(m, "1")
	if m.placing || placeIn(t, root, "a-loose-one") != "true" || strings.Contains(frontAt(t, root, "a-loose-one"), "todo") {
		t.Fatalf("place 1 writes a bare todo, and the front reads:\n%s", frontAt(t, root, "a-loose-one"))
	}
	m = pressed(toRow(m, "one-group"), "p", "2")
	if placeIn(t, root, "one-group") != "last" {
		t.Fatalf("the last place reads last, and the front reads:\n%s", frontAt(t, root, "one-group"))
	}
	m = pressed(toRow(m, "a-child"), "p", "1")
	m = pressed(toRow(m, "a-loose-one"), "p", "1")
	m = pressed(toRow(m, "one-group"), "p", "1")
	m.work.Items[0].Keys[queueKey], m.work.Items[1].Keys[queueKey] = "2", "1"
	// The same place again takes the todo off, whatever rows stand ahead. [[spec/design_output/pull#a-todo-forces-a-place]]
	m = pressed(toRow(m, "one-group"), "p", "2")
	if placeIn(t, root, "one-group") != "" || m.work.Items[0].Keys[todoKey] != flagOff {
		t.Fatalf("the same digit again clears the todo, and the plan reads %q", placeIn(t, root, "one-group"))
	}
	m = pressed(toRow(m, "one-group"), "p", "2")
	if !strings.Contains(m.workNotice, "already") {
		t.Fatalf("a row at its own place with no todo says so, and the tab says %q", m.workNotice)
	}
	m.work.Items = append(m.work.Items, Item{Name: "third", Keys: map[string]string{queueKey: "3", "path": "spec/tickets/third.md"}})
	m.work.rebuild()
	// A row moving up stands before the row at that place, and one moving down stands before the row past it. [[spec/design_output/pull#a-todo-forces-a-place]]
	m = pressed(toRow(m, "third"), "p", "2")
	if placeIn(t, root, "third") != "one-group" {
		t.Fatalf("place 2 from below names the row standing at 2, and the plan reads %q", placeIn(t, root, "third"))
	}
	m = pressed(toRow(m, "a-loose-one"), "p", "3")
	if placeIn(t, root, "a-loose-one") != "last" {
		t.Fatalf("place 3 from above, past every row, reads last, and the plan reads %q", placeIn(t, root, "a-loose-one"))
	}
	m = pressed(toRow(m, "one-group"), "p", "5")
	if !strings.Contains(m.workNotice, "no row stands at 5") {
		t.Fatalf("a place past the level says so, and the tab says %q", m.workNotice)
	}
	m = pressed(toRow(m, "a-child"), "p", "x")
	if m.placing || m.workNotice != "" {
		t.Fatalf("a key that is no digit drops the chord, and the tab says %q", m.workNotice)
	}
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func TestTheSiblingsOfARowStandAtItsOwnLevel(t *testing.T) {
	t.Parallel()
	m, _ := placedWindow(t)
	if said := m.work.Siblings("a-child"); len(said) != 1 || said[0].Name != "a-child" {
		t.Fatalf("a ticket under a group stands beside its group's other tickets, and reads %v", said)
	}
	if said := m.work.Siblings("a-loose-one"); len(said) != 2 {
		t.Fatalf("a root stands beside the other roots, and reads %v", said)
	}
	if m.work.Siblings("nobody") != nil {
		t.Fatal("a name the tree holds nowhere has no siblings")
	}
	if m.work.SiblingAt("a-loose-one", 1) != "one-group" || m.work.SiblingAt("a-loose-one", 2) != "" || m.work.LastPlace("a-loose-one") != 1 {
		t.Fatal("a sibling stands at its own number, and the last place reads the highest beside the row")
	}
	if placeNumber("2.3") != 3 || placeNumber("-2") != 0 || placeNumber("") != 0 || placeNumber("0") != 0 {
		t.Fatal("a place number reads the last segment, and a negative or empty place reads zero")
	}
}
