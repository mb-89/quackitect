package main

import (
	"quackitect/engine/internal/expr"
	"testing"
)

// A CHILD DRAWS UNDER ITS PARENT.
//
// A sub-token sat in the list beside every other token, so the breakdown of a
// piece of work was invisible and the parent looked like one more row.
//
// IT IS A TREE RATHER THAN A GROUPING. The editor draws groups from a
// property's value. A parent is not a value, it is a link from one row to
// another, and a parent is itself a row, so grouping by parent would draw the
// parent twice.
func TestAChildDrawsUnderItsParent(t *testing.T) {
	t.Parallel()
	p := writeBase(t, t.TempDir(), "w.base", `
views:
  - type: table
    name: left
    order:
      - title
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	tab, err := Render(b, b.Views[0], []expr.Row{
		row("id", "wk-parent", "title", "the whole thing"),
		row("id", "wk-one", "title", "the first half", "parent", "wk-parent"),
		row("id", "wk-two", "title", "the second half", "parent", "wk-parent"),
		row("id", "wk-alone", "title", "somebody else's work"),
	})
	if err != nil {
		t.Fatal(err)
	}

	var top []Line
	for _, g := range tab.Groups {
		top = append(top, g.Lines...)
	}
	if len(top) != 2 {
		t.Fatalf("%d rows are drawn at the top, and two of the four are children: %v", len(top), ids(top))
	}
	var parent *Line
	for i := range top {
		if top[i].ID == "wk-parent" {
			parent = &top[i]
		}
	}
	if parent == nil {
		t.Fatalf("the parent is not drawn: %v", ids(top))
	}
	if len(parent.Under) != 2 {
		t.Fatalf("the parent carries %d children", len(parent.Under))
	}
	// AND A CHILD IS DRAWN ONCE. It is under its parent and nowhere else.
	for _, l := range top {
		if l.ID == "wk-one" || l.ID == "wk-two" {
			t.Fatalf("%s is drawn at the top as well as under its parent", l.ID)
		}
	}
	// THE CHILD KNOWS HOW DEEP IT IS, so the page can draw it nested.
	for _, l := range parent.Under {
		if l.Depth != 1 {
			t.Fatalf("%s is drawn at depth %d", l.ID, l.Depth)
		}
	}
}

// A CHILD WHOSE PARENT IS NOT ON THE PAGE DRAWS WHERE IT ALWAYS DID.
//
// A filter or a page can leave the parent out, and a row that vanishes because
// its parent did is a row nobody can find.
func TestAChildWithNoParentHereDrawsOnItsOwn(t *testing.T) {
	t.Parallel()
	p := writeBase(t, t.TempDir(), "w.base", `
views:
  - type: table
    name: left
    order:
      - title
`)
	b, _ := LoadBase(p)
	tab, err := Render(b, b.Views[0], []expr.Row{
		row("id", "wk-one", "title", "the first half", "parent", "wk-elsewhere"),
	})
	if err != nil {
		t.Fatal(err)
	}
	var top []Line
	for _, g := range tab.Groups {
		top = append(top, g.Lines...)
	}
	if len(top) != 1 || top[0].ID != "wk-one" {
		t.Fatalf("a child whose parent is elsewhere was not drawn: %v", ids(top))
	}
	if top[0].Depth != 0 {
		t.Fatalf("it is drawn at depth %d", top[0].Depth)
	}
}

// A CHILD UNDER A PINNED GROUP IS STILL DRAWN ONCE.
//
// A sub-token that also matches a pin would otherwise appear under the pin and
// under its parent, and the page stops being a partition.
func TestAChildIsDrawnOnceEvenUnderAPin(t *testing.T) {
	t.Parallel()
	p := writeBase(t, t.TempDir(), "w.base", `
groups:
  - name: backlogged
    filter: status == "backlogged"
pinned:
  - backlogged

views:
  - type: table
    name: left
    order:
      - title
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	tab, err := Render(b, b.Views[0], []expr.Row{
		row("id", "wk-parent", "title", "the whole thing", "status", "open"),
		row("id", "wk-one", "title", "the first half", "parent", "wk-parent", "status", "backlogged"),
	})
	if err != nil {
		t.Fatal(err)
	}
	seen := 0
	var walk func([]Line)
	walk = func(ls []Line) {
		for _, l := range ls {
			if l.ID == "wk-one" {
				seen++
			}
			walk(l.Under)
		}
	}
	for _, g := range tab.Pinned {
		walk(g.Lines)
	}
	for _, g := range tab.Groups {
		walk(g.Lines)
	}
	if seen != 1 {
		t.Fatalf("the child is drawn %d times", seen)
	}
}

func ids(ls []Line) []string {
	var out []string
	for _, l := range ls {
		out = append(out, l.ID)
	}
	return out
}
