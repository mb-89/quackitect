// The order the tree's rows stand in. Every case here holds memory and no file.
// [[spec/design_output/tree-view#a-sort-holds-several-keys]]

package tree

import (
	"quackitect/tui/draw"

	"strings"
	"testing"
)

func sortCols() []Column {
	return []Column{
		{Name: "name", Key: "name", Wide: 10},
		{Name: "state", Key: "state", Wide: 6},
		{Name: "queue", Key: "queue", Wide: 5},
	}
}

func sortItems() []Item {
	return []Item{
		{Name: "beta", Keys: map[string]string{"state": "open", "queue": "10"}},
		{Name: "alpha", Keys: map[string]string{"state": "open", "queue": "2"}},
		{Name: "gamma", Keys: map[string]string{"state": "closed", "queue": ""}},
	}
}

func namesOf(t *Tree) []string {
	out := make([]string, 0, t.Len())
	for at := 0; at < t.Len(); at++ {
		t.MoveTo(at)
		out = append(out, t.Selected().Name)
	}
	return out
}

func sameNames(t *testing.T, said, want []string) {
	t.Helper()
	if strings.Join(said, ",") != strings.Join(want, ",") {
		t.Fatalf("the rows stand %v, and they read %v", want, said)
	}
}

// An outline place reads segment by segment, so a person's negative place stands first and a tenth child after the second. [[spec/design_output/pull#the-queue-is-an-outline]]
func TestAnOutlinePlaceReadsSegmentBySegment(t *testing.T) {
	t.Parallel()
	for _, pair := range [][2]string{{"-2", "-1"}, {"-1", "1"}, {"1", "1.1"}, {"1.2", "1.10"}, {"1.10", "2"}, {"2", "10"}} {
		if !under(pair[0], pair[1]) || under(pair[1], pair[0]) {
			t.Fatalf("%s stands under %s", pair[0], pair[1])
		}
	}
	if under("1", "1") || !under("alpha", "beta") {
		t.Fatal("equal places stand level, and words read as words")
	}
}

// [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func TestASortOrdersTheRowsAndANumberReadsAsANumber(t *testing.T) {
	t.Parallel()
	tree := NewTree(sortCols(), sortItems(), false)
	sameNames(t, namesOf(tree), []string{"beta", "alpha", "gamma"})

	tree.SortOn("queue")
	sameNames(t, namesOf(tree), []string{"alpha", "beta", "gamma"})
}

// [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func TestAPressTurnsAKeyAroundAndAThirdDropsIt(t *testing.T) {
	t.Parallel()
	tree := NewTree(sortCols(), sortItems(), false)

	tree.SortOn("name")
	sameNames(t, namesOf(tree), []string{"alpha", "beta", "gamma"})
	if said := tree.Sorts(); len(said) != 1 || said[0].Down {
		t.Fatalf("one key stands, and it reads up: %v", said)
	}

	tree.SortOn("name")
	sameNames(t, namesOf(tree), []string{"gamma", "beta", "alpha"})
	if said := tree.Sorts(); len(said) != 1 || !said[0].Down {
		t.Fatalf("the same key turns around: %v", said)
	}

	tree.SortOn("name")
	if len(tree.Sorts()) != 0 {
		t.Fatalf("a third press drops the key, and %v stand", tree.Sorts())
	}
	sameNames(t, namesOf(tree), []string{"beta", "alpha", "gamma"})
}

// [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func TestALaterKeyBreaksTheTiesTheFirstLeaves(t *testing.T) {
	t.Parallel()
	tree := NewTree(sortCols(), sortItems(), false)
	tree.SortOn("state")
	tree.SortOn("queue")

	sameNames(t, namesOf(tree), []string{"gamma", "alpha", "beta"})
	if said := tree.Sorts(); len(said) != 2 || said[0].Key != "state" || said[1].Key != "queue" {
		t.Fatalf("the second key stands under the first: %v", said)
	}
	if !strings.Contains(tree.SortSays(), "state") {
		t.Fatalf("the mark names the keys, and it reads %q", tree.SortSays())
	}
}

// The nesting survives the order, and the items stay as they stand. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func TestTheNestingSurvivesTheOrderAndTheItemsStayAsTheyStand(t *testing.T) {
	t.Parallel()
	items := []Item{
		{Name: "zulu", Keys: map[string]string{"queue": "2"}, Kids: []Item{
			{Name: "second", Keys: map[string]string{"queue": "9"}},
			{Name: "first", Keys: map[string]string{"queue": "1"}},
		}},
		{Name: "alpha", Keys: map[string]string{"queue": "1"}},
	}
	tree := NewTree(sortCols(), items, true)
	tree.SortOn("queue")

	sameNames(t, namesOf(tree), []string{"alpha", "zulu", "first", "second"})
	if items[0].Kids[0].Name != "second" {
		t.Fatal("the sort leaves the items as they stand")
	}
}

// [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func TestAPressOnAColumnHeadNamesTheKeyUnderIt(t *testing.T) {
	t.Parallel()
	tree := NewTree(sortCols(), sortItems(), false)
	// The gutter stands before the first column, and a press on it names none. [[spec/design_output/tree-view#the-view-draws-a-tree]]
	if said := tree.ColumnAt(0, 40); said != "" {
		t.Fatalf("the gutter names no column, and it reads %q", said)
	}
	if said := tree.ColumnAt(draw.GutterWide, 40); said != "name" {
		t.Fatalf("the first column reads name, and it reads %q", said)
	}
	if said := tree.ColumnAt(draw.GutterWide+11, 40); said != "state" {
		t.Fatalf("the second column reads state, and it reads %q", said)
	}
	if said := tree.ColumnAt(400, 40); said != "" {
		t.Fatalf("a press past the last column names none, and it reads %q", said)
	}
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func TestABaseFileNamesTheOrderAViewOpensOn(t *testing.T) {
	t.Parallel()
	views, err := ReadBase(workBase + "    sort:\n      - key: state\n      - key: name\n        down: true\n")
	if err != nil {
		t.Fatalf("the base file reads, and answered %v", err)
	}
	said := views[len(views)-1].Sorts
	if len(said) != 2 || said[0].Key != "state" || said[1].Key != "name" || !said[1].Down {
		t.Fatalf("the view opens on the keys the file names, and read %v", said)
	}
	if len(views[0].Sorts) != 0 {
		t.Fatalf("a view naming no order opens on none, and read %v", views[0].Sorts)
	}
}
