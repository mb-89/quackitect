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

// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func TestAPressPutsThePresetsFilterAndItsSortIn(t *testing.T) {
	t.Parallel()
	tree := presetTree()
	tree.Presets([]Preset{
		{Name: "not done", Filters: "not state: closed"},
		{Name: "queue", Filters: "queue: /./", Sorts: []Sort{{Key: "queue"}}},
	})
	sameNames(t, namesOf(tree), []string{"open-one", "shut-one", "mine"})

	tree.Press("queue")
	sameNames(t, namesOf(tree), []string{"mine", "open-one"})
	if said := tree.Sorts(); len(said) != 1 || said[0].Key != "queue" {
		t.Fatalf("the press puts the preset's sort in, and it reads %v", said)
	}
}

// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func TestASecondPresetNarrowsBothAndAPressAgainTakesItOff(t *testing.T) {
	t.Parallel()
	tree := presetTree()
	tree.Presets([]Preset{
		{Name: "not done", Filters: "not state: closed", Pressed: true},
		{Name: "yours", Filters: "person: person"},
	})
	sameNames(t, namesOf(tree), []string{"open-one", "mine"})

	tree.Press("yours")
	sameNames(t, namesOf(tree), []string{"mine"})

	tree.Press("yours")
	sameNames(t, namesOf(tree), []string{"open-one", "mine"})

	tree.Press("not done")
	sameNames(t, namesOf(tree), []string{"open-one", "shut-one", "mine"})
}

// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func TestAPersonChangingTheSortAfterAPressKeepsThatSort(t *testing.T) {
	t.Parallel()
	tree := presetTree()
	tree.Presets([]Preset{{Name: "queue", Filters: "state: open", Sorts: []Sort{{Key: "queue"}}}})
	tree.Press("queue")
	tree.SortOn("name")

	said := tree.Sorts()
	if len(said) != 2 || said[1].Key != "name" {
		t.Fatalf("the person's key stands under the preset's, and they read %v", said)
	}
	tree.Press("queue")
	if len(tree.Sorts()) != 2 {
		t.Fatalf("taking the filter off leaves the sort, and it reads %v", tree.Sorts())
	}
}

// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func TestATypedLineJoinsThePressesAndNarrowsWithThem(t *testing.T) {
	t.Parallel()
	tree := presetTree()
	tree.Presets([]Preset{{Name: "not done", Filters: "not state: closed", Pressed: true}})

	tree.Filtering("person: person")
	sameNames(t, namesOf(tree), []string{"mine"})

	tree.Filtering("")
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
	tree, err := loadWork(strings.Join([]string{root, ".se", "log", "session.jsonl"}, "/"))
	if err != nil {
		t.Fatal(err)
	}
	said := tree.PresetList()
	if len(said) == 0 {
		t.Fatal("this tree's own base file names its presets")
	}
	if said[0].Name != "not done" || !said[0].Pressed {
		t.Fatalf("not done stands in when the tab opens, and it reads %v", said[0])
	}
	for _, one := range said {
		if strings.TrimSpace(one.Filters) == "" {
			t.Fatalf("every preset carries a filter, and %s carries none", one.Name)
		}
	}
}
