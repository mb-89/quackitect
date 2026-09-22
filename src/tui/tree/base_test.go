// The base file a view comes from: the columns it names, their room, what it
// nests by and the tests a row passes. Every read here holds memory and no
// file.

package tree

import (
	"strings"
	"testing"
)

const workBase = `filters:
  - kind: ticket
properties:
  name:
    opensNote: true
columnSize:
  name: 30
  state: 8
views:
  - type: table
    name: every ticket
    order:
      - name
      - state
      - says
    nest: group
    collapsed:
      - closed
  - type: table
    name: open alone
    filters:
      - state: open
    order:
      - name
      - says
    columnSize:
      name: 40
`

func baseHere(t *testing.T) []View {
	t.Helper()
	views, err := ReadBase(workBase)
	if err != nil {
		t.Fatalf("the base file reads, and answered %v", err)
	}
	return views
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func TestABaseFileHoldsEveryViewItNames(t *testing.T) {
	t.Parallel()
	views := baseHere(t)
	if len(views) != 2 {
		t.Fatalf("the file names 2 views, and read %d", len(views))
	}
	if views[0].Name != "every ticket" || views[1].Name != "open alone" {
		t.Fatalf("each view carries its name, and they read %q and %q", views[0].Name, views[1].Name)
	}
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func TestOrderNamesTheColumnsAndColumnSizeTheirRoom(t *testing.T) {
	t.Parallel()
	cols := baseHere(t)[0].Cols
	if len(cols) != 3 {
		t.Fatalf("order names 3 columns, and read %d", len(cols))
	}
	for at, want := range []Column{
		{Name: "name", Key: "name", Wide: 30},
		{Name: "state", Key: "state", Wide: 8},
		{Name: "says", Key: "says", Wide: 0},
	} {
		if cols[at] != want {
			t.Fatalf("column %d reads %+v, and the file says %+v", at, cols[at], want)
		}
	}
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func TestAViewsOwnKeysWinOverTheFilesKeys(t *testing.T) {
	t.Parallel()
	views := baseHere(t)
	if views[1].Cols[0].Wide != 40 {
		t.Fatalf("the view's own room wins, and the column opens at %d", views[1].Cols[0].Wide)
	}
	if views[1].Cols[1].Key != "says" {
		t.Fatalf("the view's own order wins, and the second column reads %q", views[1].Cols[1].Key)
	}
	if views[1].Filters != "kind: ticket and state: open" {
		t.Fatalf("the file's tests and the view's join with and, and read %q", views[1].Filters)
	}
	if views[0].Filters != "kind: ticket" {
		t.Fatalf("a view adding no test keeps the file's, and reads %q", views[0].Filters)
	}
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func TestNestAndCollapsedAndOpensNoteReadOffTheFile(t *testing.T) {
	t.Parallel()
	views := baseHere(t)
	if !views[0].Nests || views[1].Nests {
		t.Fatalf("a view naming nest nests, and one naming none stands flat, and they read %v and %v", views[0].Nests, views[1].Nests)
	}
	if len(views[0].Collapsed) != 1 || views[0].Collapsed[0] != "closed" {
		t.Fatalf("collapsed reads off the file, and reads %v", views[0].Collapsed)
	}
	if views[0].Opens != "name" {
		t.Fatalf("the property carrying opensNote says what a click opens, and reads %q", views[0].Opens)
	}
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func TestABaseFileSayingTooLittleSaysWhy(t *testing.T) {
	t.Parallel()
	for said, want := range map[string]string{
		"- one\n- two\n":            "holds a map",
		"":                          "under views",
		"views:\n  - type: table\n": "names itself nowhere",
		"views:\n  - name: one\n":   "names no column",
	} {
		_, err := ReadBase(said)
		if err == nil || !strings.Contains(err.Error(), want) {
			t.Fatalf("%q answers an error naming %q, and answered %v", said, want, err)
		}
	}
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func TestAViewOffTheFileDrawsAsATree(t *testing.T) {
	t.Parallel()
	one := baseHere(t)[0]
	view := NewTree(one.Cols, []Item{
		item("the window", "open", "the frame", item("the frame", "closed", "the strip")),
	}, one.Nests)
	if !strings.Contains(view.Header(60), "state") {
		t.Fatalf("the view's columns name the header, and it reads %q", view.Header(60))
	}
	if view.Len() != 2 {
		t.Fatalf("the view nests, and %d rows stand", view.Len())
	}
}
