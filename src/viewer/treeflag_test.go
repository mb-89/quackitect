// The flags column, read as letters. Every case holds memory and no file.
// [[spec/design_output/tree-view#a-flag-draws-a-letter]]

package main

import (
	"strings"
	"testing"
)

func flagCols() []Column {
	return []Column{
		{Name: "name", Key: "name", Wide: 10},
		{Name: "flags", Key: flagsKey, Wide: 6},
		{Name: "says", Key: "says", Wide: 0},
	}
}

func flagItems() []Item {
	return []Item{
		{Name: "lit", Keys: map[string]string{"urgent": "true", "person": "false", "held": "true"}},
		{Name: "dim", Keys: map[string]string{"urgent": "false", "person": "false", "held": "false"}},
	}
}

func flagTree() *Tree {
	tree := NewTree(flagCols(), flagItems(), false)
	tree.Flagged([]Flag{
		{Letter: "U", Key: "urgent"},
		{Letter: "Y", Key: "person"},
		{Letter: "W", Key: "held"},
		{Letter: "B", Key: "waits"},
	})
	return tree
}

// [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func TestARowDrawsEveryLetterLitOrDimInAFixedPlace(t *testing.T) {
	t.Parallel()
	tree := flagTree()
	if said := tree.Letters(flagItems()[0]); said != "UyWb" {
		t.Fatalf("the lit row reads UyWb, and it reads %q", said)
	}
	if said := tree.Letters(flagItems()[1]); said != "uywb" {
		t.Fatalf("the dim row reads uywb, and it reads %q", said)
	}
	if said := tree.Rows(60, 2); !strings.Contains(said, "UyWb") {
		t.Fatalf("the column draws the letters, and the rows read %q", said)
	}
}

// A flag no row carries draws dim on every row. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func TestAFlagNoRowCarriesDrawsDimOnEveryRow(t *testing.T) {
	t.Parallel()
	tree := flagTree()
	for _, one := range flagItems() {
		if !strings.Contains(tree.Letters(one), "b") {
			t.Fatalf("the unknown flag draws dim, and the row reads %q", tree.Letters(one))
		}
	}
}

// The keys stay ordinary keys, so the filter needs no new word. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func TestAFilterOverAFlagReadsItAsAnOrdinaryKey(t *testing.T) {
	t.Parallel()
	tree := flagTree()

	lit, err := ParseFilter("urgent: true")
	if err != nil {
		t.Fatal(err)
	}
	tree.Narrow(lit)
	sameNames(t, namesOf(tree), []string{"lit"})

	rest, err := ParseFilter("not urgent: true")
	if err != nil {
		t.Fatal(err)
	}
	tree.Narrow(rest)
	sameNames(t, namesOf(tree), []string{"dim"})
}

// Adding a letter costs a line in the base file. [[spec/design_output/tree-view#a-base-file-says-it]]
func TestABaseFileNamesTheLettersAndTheKeysTheyRead(t *testing.T) {
	t.Parallel()
	root := workTree(t)
	tree, err := loadWork(strings.Join([]string{root, ".se", ".log", "session.jsonl"}, "/"))
	if err != nil {
		t.Fatal(err)
	}
	said := tree.Flags()
	if len(said) == 0 {
		t.Fatal("this tree's own base file names its letters")
	}
	if said[0].Letter != "U" || said[0].Key != "urgent" {
		t.Fatalf("the first letter reads the urgent mark, and it reads %v", said[0])
	}
	for _, one := range said {
		if one.Letter == "" || one.Key == "" {
			t.Fatalf("every letter names its key, and %v names none", one)
		}
	}
}
