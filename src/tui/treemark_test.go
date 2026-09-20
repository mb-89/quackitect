// The marks, and the fill that reads them. Every case holds memory and no file.
// [[spec/design_output/tree-view#a-fill-reaches-the-marks]]

package main

import (
	"strings"
	"testing"
)

func markItems() []Item {
	return []Item{
		{Name: "one", Keys: map[string]string{"state": "open", "queue": "1"}},
		{Name: "two", Keys: map[string]string{"state": "open", "queue": "2"}},
		{Name: "three", Keys: map[string]string{"state": "open", "queue": "3"}},
		{Name: "four", Keys: map[string]string{"state": "closed", "queue": "4"}},
	}
}

func markTree() *Tree {
	return NewTree(sortCols(), markItems(), false)
}

func fillWith(t *testing.T, tree *Tree, key, said string) {
	t.Helper()
	if !tree.Open(1) {
		t.Fatal("a cell opens for the edit")
	}
	tree.edit.key = key
	tree.edit.input.SetValue(said)
	tree.Fill()
}

// [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func TestAPressMarksARowAndTheSamePressTakesItOff(t *testing.T) {
	t.Parallel()
	tree := markTree()
	tree.MoveTo(1)
	tree.Mark()
	if tree.Marks() != 1 {
		t.Fatalf("one mark stands, and %d do", tree.Marks())
	}
	if !strings.Contains(tree.Rows(60, 4), "● two") {
		t.Fatalf("the mark draws on its row, and the rows read %q", tree.Rows(60, 4))
	}
	tree.Mark()
	if tree.Marks() != 0 {
		t.Fatalf("the same press takes it off, and %d stand", tree.Marks())
	}
}

// [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func TestShiftAndARowMarksTheRunFromTheLastMark(t *testing.T) {
	t.Parallel()
	tree := markTree()
	tree.MoveTo(0)
	tree.Mark()
	tree.MoveTo(2)
	tree.MarkRun()
	if tree.Marks() != 3 {
		t.Fatalf("the run from the first to the third marks three, and %d stand", tree.Marks())
	}

	bare := markTree()
	bare.MoveTo(2)
	bare.MarkRun()
	if bare.Marks() != 1 {
		t.Fatalf("a run with no mark behind it marks the row alone, and %d stand", bare.Marks())
	}
}

// [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func TestAFillOverMarksReachesTheMarkedRowsAlone(t *testing.T) {
	t.Parallel()
	tree := markTree()
	tree.MoveTo(0)
	tree.Mark()
	tree.MoveTo(2)
	tree.Mark()

	fillWith(t, tree, "state", "held")
	said := []string{"held", "open", "held", "closed"}
	for at, want := range said {
		if tree.Items[at].Keys["state"] != want {
			t.Fatalf("%s reads %q, and it stands %q", tree.Items[at].Name, tree.Items[at].Keys["state"], want)
		}
	}
}

// [[spec/design_output/tree-view#the-fill-reaches-the-view]]
func TestAFillWithNoMarkStandingReachesTheViewAsItDoes(t *testing.T) {
	t.Parallel()
	tree := markTree()
	fillWith(t, tree, "state", "held")
	for _, one := range tree.Items {
		if one.Keys["state"] != "held" {
			t.Fatalf("%s takes the fill, and it reads %q", one.Name, one.Keys["state"])
		}
	}
}

// [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func TestAChangeToTheFilterTakesEveryMarkOff(t *testing.T) {
	t.Parallel()
	tree := markTree()
	tree.MoveTo(0)
	tree.Mark()
	if tree.Marks() != 1 {
		t.Fatal("a mark stands before the filter moves")
	}

	held, err := ParseFilter("state: open")
	if err != nil {
		t.Fatal(err)
	}
	tree.Narrow(held)
	if tree.Marks() != 0 {
		t.Fatalf("the marks go with the filter, and %d stand", tree.Marks())
	}

	tree.MoveTo(0)
	tree.Mark()
	tree.Narrow(held)
	if tree.Marks() != 1 {
		t.Fatal("the same filter again leaves the marks as they stand")
	}
}
