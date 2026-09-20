// A preset and a slice, over a tree a case writes. Every case holds memory.
// [[spec/design_output/tree-view#a-preset-carries-its-sort]]

package main

import (
	"strings"
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

// [[spec/design_output/tree-view#a-base-file-says-it]]
func TestABaseFileNamesThePresetsUnderGroups(t *testing.T) {
	t.Parallel()
	root := workTree(t)
	tree, err := loadWork(strings.Join([]string{root, ".se", ".log", "session.jsonl"}, "/"))
	if err != nil {
		t.Fatal(err)
	}
	said := tree.PresetList()
	if len(said) == 0 {
		t.Fatal("this tree's own base file names its presets")
	}
	// The queue opens the tab: the placed rows, sorted by place. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
	if said[0].Name != "queue" || !said[0].Pressed || said[0].Filters != "queue: /./" || len(said[0].Sorts) == 0 {
		t.Fatalf("the queue stands in when the tab opens, and it reads %v", said[0])
	}
	for _, one := range said {
		if strings.TrimSpace(one.Filters) == "" {
			t.Fatalf("every other preset carries a filter, and %s carries none", one.Name)
		}
	}
	// The urgent preset keeps the open ones, because a closed ticket asks nothing of anybody. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
	urgent := said[len(said)-2]
	if urgent.Name != "urgent" || !strings.Contains(urgent.Filters, "not state: closed") {
		t.Fatalf("urgent keeps the open tickets alone, and it reads %v", urgent)
	}
	// The todos preset keeps every row a todo places, the sentence todos among them. [[spec/design_output/stop#the-plan]]
	if last := said[len(said)-1]; last.Name != "todos" || last.Filters != "todo: true" {
		t.Fatalf("the todos preset stands last on alt+5, and it reads %v", last)
	}
}
