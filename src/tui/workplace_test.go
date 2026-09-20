// The place chord: p, then a digit, writes the todo the queue reads.
// [[spec/design_output/pull#the-queue-is-an-outline]]

package main

import (
	"quackitect/tui/tree"

	"quackitect/tui/frame"
	"quackitect/tui/work"

	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A window whose roots carry places, with every ticket on disk. [[spec/design_output/tui#the-work-tab-takes-edits]]
func placedWindow(t *testing.T) (frame.Model, string) {
	t.Helper()
	m, root := editWindow(t)
	writeAt(t, root, "spec/tickets/a-loose-one.md", strings.Replace(childNote, "group: one-group\n", "", 1))
	writeAt(t, root, "spec/tickets/one-group.md", strings.Replace(childNote, "group: one-group\n", "", 1))
	places, _ := work.PlacesIn([]byte(`{"branches":[{"name":"one-group","queue":"1","tickets":[{"name":"a-child","queue":"1.1"}]}],"loose":[{"name":"a-loose-one","queue":"2"}]}`))
	work.Placed(theWork(m).Tree, places)
	return m, root
}

// The override a place writes, off the plan file on this box, and nothing where none stands. [[spec/design_output/pull#a-todo-forces-a-place]]
func placeIn(t *testing.T, root, name string) string {
	t.Helper()
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(work.PlanAt)))
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
	if !theWork(m).Placing || !strings.Contains(theWork(m).Notice, "1 to 9") {
		t.Fatalf("p opens the chord and says what it waits for, and the tab says %q", theWork(m).Notice)
	}
	m = pressed(m, "1")
	if theWork(m).Placing || placeIn(t, root, "a-loose-one") != "true" || strings.Contains(frontAt(t, root, "a-loose-one"), "todo") {
		t.Fatalf("place 1 writes a bare todo, and the front reads:\n%s", frontAt(t, root, "a-loose-one"))
	}
	m = pressed(toRow(m, "one-group"), "p", "2")
	if placeIn(t, root, "one-group") != "last" {
		t.Fatalf("the last place reads last, and the front reads:\n%s", frontAt(t, root, "one-group"))
	}
	m = pressed(toRow(m, "a-child"), "p", "1")
	m = pressed(toRow(m, "a-loose-one"), "p", "1")
	m = pressed(toRow(m, "one-group"), "p", "1")
	theWork(m).Tree.Items[0].Keys[work.QueueKey], theWork(m).Tree.Items[1].Keys[work.QueueKey] = "2", "1"
	// The same place again takes the todo off, whatever rows stand ahead. [[spec/design_output/pull#a-todo-forces-a-place]]
	m = pressed(toRow(m, "one-group"), "p", "2")
	if placeIn(t, root, "one-group") != "" || theWork(m).Tree.Items[0].Keys[work.TodoKey] != work.FlagOff {
		t.Fatalf("the same digit again clears the todo, and the plan reads %q", placeIn(t, root, "one-group"))
	}
	m = pressed(toRow(m, "one-group"), "p", "2")
	if !strings.Contains(theWork(m).Notice, "already") {
		t.Fatalf("a row at its own place with no todo says so, and the tab says %q", theWork(m).Notice)
	}
	theWork(m).Tree.Append(tree.Item{Name: "third", Keys: map[string]string{work.QueueKey: "3", "path": "spec/tickets/third.md"}})
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
	if !strings.Contains(theWork(m).Notice, "no row stands at 5") {
		t.Fatalf("a place past the level says so, and the tab says %q", theWork(m).Notice)
	}
	m = pressed(toRow(m, "a-child"), "p", "x")
	if theWork(m).Placing || theWork(m).Notice != "" {
		t.Fatalf("a key that is no digit drops the chord, and the tab says %q", theWork(m).Notice)
	}
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func TestTheSiblingsOfARowStandAtItsOwnLevel(t *testing.T) {
	t.Parallel()
	m, _ := placedWindow(t)
	if said := theWork(m).Tree.Siblings("a-child"); len(said) != 1 || said[0].Name != "a-child" {
		t.Fatalf("a ticket under a group stands beside its group's other tickets, and reads %v", said)
	}
	if said := theWork(m).Tree.Siblings("a-loose-one"); len(said) != 2 {
		t.Fatalf("a root stands beside the other roots, and reads %v", said)
	}
	if theWork(m).Tree.Siblings("nobody") != nil {
		t.Fatal("a name the tree holds nowhere has no siblings")
	}
	if work.SiblingAt(theWork(m).Tree, "a-loose-one", 1) != "one-group" || work.SiblingAt(theWork(m).Tree, "a-loose-one", 2) != "" || work.LastPlace(theWork(m).Tree, "a-loose-one") != 1 {
		t.Fatal("a sibling stands at its own number, and the last place reads the highest beside the row")
	}
	if work.PlaceNumber("2.3") != 3 || work.PlaceNumber("-2") != 0 || work.PlaceNumber("") != 0 || work.PlaceNumber("0") != 0 {
		t.Fatal("a place number reads the last segment, and a negative or empty place reads zero")
	}
}
