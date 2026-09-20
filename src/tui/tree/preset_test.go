// A preset and a slice, over a tree a case writes. Every case holds memory.
// [[spec/design_output/tree-view#a-preset-carries-its-sort]]

package tree

import (
	"testing"
)

func presetItems() []Item {
	return []Item{
		{Name: "open-one", Keys: map[string]string{"state": "open", "queue": "2", "person": ""}},
		{Name: "shut-one", Keys: map[string]string{"state": "closed", "queue": "", "person": ""}},
		{Name: "mine", Keys: map[string]string{"state": "open", "queue": "1", "person": "person"}},
	}
}

func presetTree() *Tree {
	return NewTree(sortCols(), presetItems(), false)
}

// The line is the whole filter, and a preset is what wrote it. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func TestTheLineIsTheWholeFilterAndAnEmptyLineKeepsEveryRow(t *testing.T) {
	t.Parallel()
	tree := presetTree()
	tree.Presets([]Preset{{Name: "not done", Filters: "not state: closed", Pressed: true}})
	sameNames(t, namesOf(tree), []string{"open-one", "shut-one", "mine"})

	if err := tree.Filtering(tree.Opening()); err != nil {
		t.Fatal(err)
	}
	sameNames(t, namesOf(tree), []string{"open-one", "mine"})

	if err := tree.Filtering("person: person"); err != nil {
		t.Fatal(err)
	}
	sameNames(t, namesOf(tree), []string{"mine"})

	if err := tree.Filtering(""); err != nil {
		t.Fatal(err)
	}
	sameNames(t, namesOf(tree), []string{"open-one", "shut-one", "mine"})
}

// The preset the file presses opens the line, and its sort takes hold at the start. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func TestThePressedPresetOpensTheLineAndItsSortTakesHold(t *testing.T) {
	t.Parallel()
	tree := presetTree()
	tree.Presets([]Preset{
		{Name: "not done", Filters: "not state: closed"},
		{Name: "queue", Filters: "queue: /./", Sorts: []Sort{{Key: "queue"}}, Pressed: true},
	})
	if said := tree.Opening(); said != "queue: /./" {
		t.Fatalf("the pressed preset's filter opens the line, and it reads %q", said)
	}
	if said := tree.Sorts(); len(said) != 1 || said[0].Key != "queue" {
		t.Fatalf("the pressed preset's sort takes hold, and it reads %v", said)
	}
	if said := presetTree().Opening(); said != "" {
		t.Fatalf("a tree with no pressed preset opens on an empty line, and it reads %q", said)
	}
}

// A line that parses not says why, and the last good filter stands. [[spec/design_output/tui#the-filter-language]]
func TestALineThatParsesNotKeepsTheLastGoodFilter(t *testing.T) {
	t.Parallel()
	tree := presetTree()
	if err := tree.Filtering("state: open"); err != nil {
		t.Fatal(err)
	}
	if err := tree.Filtering("state: /("); err == nil {
		t.Fatal("a pattern that compiles not answers why")
	}
	sameNames(t, namesOf(tree), []string{"open-one", "mine"})
}

// A column's values answer the buttons, so a slice costs no line. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func TestAColumnsValuesDrawAsSlicesWithNoLineInTheFile(t *testing.T) {
	t.Parallel()
	tree := presetTree()
	said := tree.Slices("state")
	if len(said) != 2 || said[0].Name != "closed" || said[1].Name != "open" {
		t.Fatalf("the column's values stand as presets, and they read %v", said)
	}
	if said[1].Filters != "state: open" {
		t.Fatalf("a slice keeps the rows carrying its value, and it reads %q", said[1].Filters)
	}
	if len(tree.Slices("nothing")) != 0 {
		t.Fatal("a column nobody carries answers no slice")
	}
}
