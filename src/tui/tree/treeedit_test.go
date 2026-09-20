// The edit standing open on a cell: what Enter writes, what Escape puts back,
// how far the fill reaches, and what the completion offers.

package tree

import (
	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/tui/draw"
)

type states struct{ allowed []string }

func (s states) Takes(key string) []string {
	if key == "state" {
		return s.allowed
	}
	return nil
}

func typeInto(view *Tree, said string) {
	for _, one := range said {
		view.Typing(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{one}})
	}
}

func clear(view *Tree) {
	for range view.Typed() {
		view.Typing(tea.KeyMsg{Type: tea.KeyBackspace})
	}
}

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func TestEnterWritesTheValueAndTheCellStandsAsItReads(t *testing.T) {
	t.Parallel()
	view := tickets()
	view.MoveTo(1)
	if !view.Open(1) {
		t.Fatal("the edit opens on the state of the selected row")
	}
	if view.Typed() != "closed" {
		t.Fatalf("the edit opens on the value the cell holds, and holds %q", view.Typed())
	}
	if !strings.Contains(view.Rows(60, 4), "closed") {
		t.Fatalf("the edit draws in the cell holding it, and the rows read:\n%s", view.Rows(60, 4))
	}
	clear(view)
	typeInto(view, "open")
	if left := view.Take(); len(left) != 0 {
		t.Fatalf("no row stays behind, and these do: %v", left)
	}
	if view.Editing() {
		t.Fatal("enter closes the edit")
	}
	if got := view.Items[0].Kids[0].Keys["state"]; got != "open" {
		t.Fatalf("enter writes the value, and the cell holds %q", got)
	}
}

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func TestEscapePutsTheOldValueBack(t *testing.T) {
	t.Parallel()
	view := tickets()
	view.MoveTo(1)
	view.Open(1)
	clear(view)
	typeInto(view, "open")
	view.Drop()
	if view.Editing() {
		t.Fatal("escape closes the edit")
	}
	if got := view.Items[0].Kids[0].Keys["state"]; got != "closed" {
		t.Fatalf("escape puts the old value back, and the cell holds %q", got)
	}
}

// [[spec/design_output/tree-view#the-fill-reaches-the-view]]
func TestTheFillWritesIntoEveryRowTheViewHolds(t *testing.T) {
	t.Parallel()
	view := tickets()
	view.Open(1)
	clear(view)
	typeInto(view, "dropped")
	if left := view.Fill(); len(left) != 0 {
		t.Fatalf("no row stays behind, and these do: %v", left)
	}
	for _, one := range []Item{view.Items[0], view.Items[0].Kids[0], view.Items[0].Kids[1], view.Items[1]} {
		if one.Keys["state"] != "dropped" {
			t.Fatalf("the fill reaches %q, and it holds %q", one.Name, one.Keys["state"])
		}
	}
}

// [[spec/design_output/tree-view#the-fill-reaches-the-view]]
func TestAFilterSaysHowFarTheFillGoes(t *testing.T) {
	t.Parallel()
	f, err := draw.ParseFilter("state: closed")
	if err != nil {
		t.Fatal(err)
	}
	view := tickets()
	view.Narrow(f)
	view.Open(1)
	clear(view)
	typeInto(view, "dropped")
	view.Fill()
	if view.Items[1].Keys["state"] != "open" {
		t.Fatalf("a row the filter drops keeps its value, and it holds %q", view.Items[1].Keys["state"])
	}
	if view.Items[0].Kids[0].Keys["state"] != "dropped" {
		t.Fatalf("a row the filter keeps takes the value, and it holds %q", view.Items[0].Kids[0].Keys["state"])
	}
}

// [[spec/design_output/tree-view#a-schema-refuses-a-value]]
func TestARowWhoseSchemaRefusesTheValueKeepsTheOneItCarries(t *testing.T) {
	t.Parallel()
	view := tickets()
	view.Schema = states{allowed: []string{"open", "closed"}}
	view.MoveTo(1)
	view.Open(1)
	clear(view)
	typeInto(view, "dropped")
	left := view.Take()
	if len(left) != 1 || left[0] != "the frame" {
		t.Fatalf("the view says which row stays behind, and says %v", left)
	}
	if got := view.Items[0].Kids[0].Keys["state"]; got != "closed" {
		t.Fatalf("the row keeps the value it carries, and holds %q", got)
	}
}

// [[spec/design_output/tree-view#the-completion-knows-the-field]]
func TestTheCompletionReadsTheSchemaOfAFieldOrTheDataOtherwise(t *testing.T) {
	t.Parallel()
	view := tickets()
	view.Schema = states{allowed: []string{"open", "closed", "dropped"}}
	view.Open(1)
	clear(view)
	if got := view.Offer(); strings.Join(got, " ") != "open closed dropped" {
		t.Fatalf("a field with a schema offers the values it names, and offers %v", got)
	}
	typeInto(view, "op")
	if got := view.Offer(); strings.Join(got, " ") != "open dropped" {
		t.Fatalf("the offer keeps every value holding what a person types, and offers %v", got)
	}
	typeInto(view, "e")
	if got := view.Offer(); strings.Join(got, " ") != "open" {
		t.Fatalf("another key narrows it to one, and it offers %v", got)
	}
	view.Drop()

	bare := tickets()
	bare.Open(1)
	clear(bare)
	if got := bare.Offer(); strings.Join(got, " ") != "closed open" {
		t.Fatalf("a field with no schema offers the values standing in the data, and offers %v", got)
	}
	typeInto(bare, "brand new")
	if left := bare.Take(); len(left) != 0 {
		t.Fatalf("a free field takes a value a person types, and left %v", left)
	}
	if got := bare.Items[0].Keys["state"]; got != "brand new" {
		t.Fatalf("a free field keeps what a person types, and holds %q", got)
	}
}
