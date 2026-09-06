package main

import (
	"testing"

	"quackitect/engine/internal/expr"
)

// A DECLARED GROUP IS DRAWN WITH NOTHING IN IT, PINNED OR NOT.
//
// The .base file rules it in its opening lines: what a declared group names
// goes on existing whether or not a row is in that state today, and a heading
// that comes and goes is a heading nobody can aim at. A person loses the
// heading they drop work onto at the moment it empties, which is when they most
// want somewhere to drop onto.
//
// The engine kept only the pinned ones at zero, so two declared groups with
// nothing matching were dropped from the pane and the file and the program
// disagreed in writing.
//
// A GROUP THE DATA MADE IS THE OTHER HALF OF THE SAME SENTENCE, and it still
// goes the moment it empties. Nobody declared it, so nothing says it should
// exist tomorrow.
func TestADeclaredGroupIsDrawnWithNothingInIt(t *testing.T) {
	t.Parallel()
	p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - title
    groups:
      - name: yours
        filter: assignee == "human"
      - name: mine
        filter: assignee == "main"
      - name: noted
        filter: status == "noted"
    pinned:
      - yours
    groupBy:
      - property: bucket
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	tab, err := Render(b, b.Views[0], []expr.Row{
		row("id", "1", "assignee", "main", "status", "open", "title", "a"),
	})
	if err != nil {
		t.Fatal(err)
	}

	// noted is declared, unpinned, and nothing matches it. It is drawn, and it
	// says how many rows it holds, which is none.
	var noted *Group
	for i := range tab.Groups {
		if tab.Groups[i].Name == "noted" {
			noted = &tab.Groups[i]
		}
	}
	if noted == nil {
		t.Fatalf("a declared group with nothing matching is not in the answer: %v", names(tab.Groups))
	}
	if noted.Count != 0 {
		t.Errorf("the empty declared group says it holds %d rows", noted.Count)
	}
	if !noted.Declared {
		t.Error("it does not say it is declared, so it draws no pin")
	}

	// AND THE ORDER IS THE FILE'S. mine is declared before noted and holds the
	// row, so an empty group does not climb over a full one.
	var order []string
	for _, g := range tab.Groups {
		if g.Declared {
			order = append(order, g.Name)
		}
	}
	if len(order) != 2 || order[0] != "mine" || order[1] != "noted" {
		t.Errorf("the declared groups drew as %v", order)
	}
}
