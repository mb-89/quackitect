// The places, the count and the cloud letter, off the rows and the count the
// watch hands the tab through the window.
// [[spec/tickets/the-work-tab-reads-v1]]

package main

import (
	"encoding/json"
	"strings"
	"testing"

	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
	"quackitect/src/tui/work"
)

// A group on the cloud at its place, its ticket under it, and a person's row placed first. [[spec/design_output/pull#the-queue-is-an-outline]]
const placedRowsSaid = `[
  {"name": "one-group", "kind": "group", "route": "group", "state": "open", "queue": "2", "cloud": true},
  {"name": "a-child", "kind": "ticket", "route": "trivial", "state": "open", "group": "one-group", "queue": "2.1", "cloud": true},
  {"name": "a-loose-one", "kind": "ticket", "route": "trivial", "state": "open", "queue": "-1"}
]`

// The rows land through the window, the queue column draws their places, the strip the count, and the cloud letter lights on the group. [[spec/design_output/tui#the-work-tab]]
func TestTheRowsCarryThePlacesTheCountAndTheCloudLetter(t *testing.T) {
	t.Parallel()
	m := press(workWindow(t, 3), "2")
	theWork(m).From = workCatalog(t, placedRowsSaid)
	out, _ := m.Update(registry.Change{Name: "work/rows", Revision: 2, Value: json.RawMessage(placedRowsSaid)})
	out, _ = out.(frame.Model).Update(registry.Change{Name: "work/open-tasks", Revision: 2, Value: json.RawMessage("3")})
	m = out.(frame.Model)
	group := theWork(m).Tree.Items[0]
	if group.Name != "one-group" || group.Keys[work.QueueKey] != "2" {
		t.Fatalf("the group carries its place, and the rows read:\n%s", theWork(m).Tree.Rows(120, 8))
	}
	// The strip draws the count the index answers behind the tab's name. [[spec/tickets/the-count-chain-leaves]]
	if !strings.Contains(m.RenderStrip(), "work (3)") {
		t.Fatalf("the strip counts the takeable rows, and reads %q", m.RenderStrip())
	}
	// A person's row carries a negative place, so the queue sort puts it first. [[spec/design_output/pull#the-queue-is-an-outline]]
	if said := namesOf(theWork(m).Tree); strings.Join(said, " ") != "a-loose-one one-group a-child" {
		t.Fatalf("the person's row stands first, then the group and its ticket, and the rows read %v", said)
	}
	if group.Keys[work.CloudKey] != "true" || group.Kids[0].Keys[work.CloudKey] != "true" {
		t.Fatal("the group lights the cloud letter, and so does its ticket")
	}
	if !strings.Contains(theWork(m).Tree.Letters(group), "C") {
		t.Fatalf("the base file draws the cloud letter, and the letters read %q", theWork(m).Tree.Letters(group))
	}
}
