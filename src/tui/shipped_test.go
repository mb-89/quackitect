// The base file this tree ships, read through the work tab's loader: the
// presets, the letters and the tones it names. Each case reads a folder a
// case writes.
// [[spec/design_output/tree-view#a-base-file-says-it]]

package main

import (
	"strings"
	"testing"

	"quackitect/tui/tree"
	"quackitect/tui/work"
)

// [[spec/design_output/tree-view#a-base-file-says-it]]
func TestABaseFileNamesThePresetsUnderGroups(t *testing.T) {
	t.Parallel()
	root := workTree(t)
	tree, err := work.Load(strings.Join([]string{root, ".se", ".log", "session.jsonl"}, "/"))
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
	if urgent := said[3]; urgent.Name != "urgent" || !strings.Contains(urgent.Filters, "not state: closed") {
		t.Fatalf("urgent keeps the open tickets alone, and it reads %v", urgent)
	}
	// The todos preset keeps every row a todo places, the sentence todos among them. [[spec/design_output/stop#the-plan]]
	if todos := said[4]; todos.Name != "todos" || todos.Filters != "todo: true" {
		t.Fatalf("the todos preset stands on alt+5, and it reads %v", todos)
	}
	// The open preset keeps every row a hand still works, and the notes preset the notes, which take no place. [[spec/design_output/pull#the-queue-is-an-outline]]
	if open := said[5]; open.Name != "open" || open.Filters != "not state: closed" {
		t.Fatalf("the open preset stands on alt+6, and it reads %v", open)
	}
	if notes := said[6]; notes.Name != "notes" || notes.Filters != "route: note" {
		t.Fatalf("the notes preset stands on alt+7, and it reads %v", notes)
	}
}

// Adding a letter costs a line in the base file. [[spec/design_output/tree-view#a-base-file-says-it]]
func TestABaseFileNamesTheLettersAndTheKeysTheyRead(t *testing.T) {
	t.Parallel()
	root := workTree(t)
	tree, err := work.Load(strings.Join([]string{root, ".se", ".log", "session.jsonl"}, "/"))
	if err != nil {
		t.Fatal(err)
	}
	said := tree.Flags()
	if len(said) == 0 {
		t.Fatal("this tree's own base file names its letters")
	}
	// The state leads the flags as the first letter of its value, and the marks follow. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
	if said[0].Key != "state" || !said[0].Value {
		t.Fatalf("the first flag draws the state's first letter, and it reads %v", said[0])
	}
	// The route stands second as a value, so a note reads N and a trivial ticket T. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
	if said[1].Key != "route" || !said[1].Value {
		t.Fatalf("the second flag draws the route's first letter, and it reads %v", said[1])
	}
	if said[2].Letter != "U" || said[2].Key != "urgent" {
		t.Fatalf("the third letter reads the urgent mark, and it reads %v", said[2])
	}
	for _, one := range said {
		if (one.Letter == "" && !one.Value) || one.Key == "" {
			t.Fatalf("every letter names its key, and %v names none", one)
		}
	}
}

// The shipped base file tones open and closed apart. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func TestTheShippedBaseFileTonesOpenAndClosedApart(t *testing.T) {
	t.Parallel()
	root := workTree(t)
	shipped, err := work.Load(logOf(root))
	if err != nil {
		t.Fatal(err)
	}
	if said := shipped.Flags()[0].Tones; said["open"] != tree.ToneGood || said["closed"] == tree.ToneGood {
		t.Fatalf("this tree's base file tones open and closed apart, and reads %v", said)
	}
}
