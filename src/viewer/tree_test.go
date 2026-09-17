// The tree view: its columns, its nesting, what a parent does when it shuts,
// and the room the last column takes. Every tree here reads memory and no file.

package main

import (
	"strings"
	"testing"

	"github.com/charmbracelet/x/ansi"
)

func item(name, state, says string, kids ...Item) Item {
	return Item{
		Name: name,
		Keys: map[string]string{"state": state, "says": says},
		Kids: kids,
	}
}

func columns() []Column {
	return []Column{
		{Name: "name", Key: "name", Wide: 20},
		{Name: "state", Key: "state", Wide: 6},
		{Name: "says", Key: "says"},
	}
}

func tickets() *Tree {
	return NewTree(columns(), []Item{
		item("the window", "open", "the frame of tabs",
			item("the frame", "closed", "the strip and the footer"),
			item("the help", "closed", "three bands of keys"),
		),
		item("the tree", "open", "items and columns"),
	}, true)
}

// [[spec/design_output/tree-view#the-columns-read-the-item]]
func TestAColumnReadsTheKeyItNames(t *testing.T) {
	t.Parallel()
	view := tickets()
	drawn := view.Rows(60, 4)
	for _, want := range []string{"the window", "open", "the frame of tabs", "items and columns"} {
		if !strings.Contains(drawn, want) {
			t.Fatalf("the rows read %q, and draw:\n%s", want, drawn)
		}
	}
	names := view.Header(60)
	for _, want := range []string{"name", "state", "says"} {
		if !strings.Contains(names, want) {
			t.Fatalf("the column names read %q, and draw %q", want, names)
		}
	}
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func TestAParentCollapsesAndExpands(t *testing.T) {
	t.Parallel()
	view := tickets()
	if view.Len() != 4 {
		t.Fatalf("the tree opens with 4 rows, and holds %d", view.Len())
	}
	view.Toggle()
	if view.Len() != 2 {
		t.Fatalf("the parent collapses to 2 rows, and holds %d", view.Len())
	}
	if !strings.Contains(view.Rows(60, 2), "▸") {
		t.Fatalf("a collapsed parent wears a shut mark, and draws:\n%s", view.Rows(60, 2))
	}
	view.Toggle()
	if view.Len() != 4 || !strings.Contains(view.Rows(60, 4), "▾") {
		t.Fatalf("the parent expands again to 4 rows, and holds %d", view.Len())
	}
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func TestOneKeyCollapsesEveryRowAndOneExpandsThem(t *testing.T) {
	t.Parallel()
	view := tickets()
	view.Collapse(true)
	if view.Len() != 2 {
		t.Fatalf("every parent collapses and 2 rows stand, and %d do", view.Len())
	}
	view.Expand(true)
	if view.Len() != 4 {
		t.Fatalf("every parent expands and 4 rows stand, and %d do", view.Len())
	}
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func TestCollapseOnAChildGoesToItsParentAndShutsIt(t *testing.T) {
	t.Parallel()
	view := tickets()
	view.MoveTo(2)
	view.Collapse(false)
	if view.At() != 0 || view.Len() != 2 {
		t.Fatalf("a child collapses into its parent at row 0, and stands at %d of %d", view.At(), view.Len())
	}
}

// [[spec/design_output/tree-view#the-name-column-nests]]
func TestTheFirstColumnCarriesTheNestingAndTheName(t *testing.T) {
	t.Parallel()
	lines := strings.Split(tickets().Rows(60, 4), "\n")
	if strings.HasPrefix(lines[0], " ") {
		t.Fatalf("a root stands at the left, and reads %q", lines[0])
	}
	if !strings.HasPrefix(lines[1], strings.Repeat(" ", nestWide)) {
		t.Fatalf("a child stands one nest in, and reads %q", lines[1])
	}
	if !strings.Contains(lines[1], "the frame") {
		t.Fatalf("the first column carries the name, and reads %q", lines[1])
	}
}

// [[spec/design_output/tree-view#the-last-column-takes-what-is-left]]
func TestTheLastColumnTakesTheRoomAndCutsItsText(t *testing.T) {
	t.Parallel()
	view := NewTree(columns(), []Item{
		item("one", "open", strings.Repeat("a long word ", 20)),
	}, true)
	for _, w := range []int{40, 60, 100} {
		line := strings.Split(view.Rows(w, 1), "\n")[0]
		if ansi.StringWidth(line) != w {
			t.Fatalf("a row fills %d columns, and fills %d", w, ansi.StringWidth(line))
		}
		if !strings.Contains(line, "…") {
			t.Fatalf("the last column cuts its text at %d columns, and reads %q", w, line)
		}
	}
}

// [[spec/design_output/tree-view#a-flat-view-nests-nothing]]
func TestADeclarationSayingFlatNestsNothing(t *testing.T) {
	t.Parallel()
	view := NewTree(columns(), []Item{
		item("the window", "open", "the frame",
			item("the frame", "closed", "the strip"),
		),
	}, false)
	if view.Len() != 2 {
		t.Fatalf("a flat view draws every item as a row, and drew %d", view.Len())
	}
	lines := strings.Split(view.Rows(60, 2), "\n")
	if strings.HasPrefix(lines[1], " ") {
		t.Fatalf("a flat view nests nothing, and the second row reads %q", lines[1])
	}
	view.Toggle()
	if view.Len() != 2 {
		t.Fatalf("a flat view collapses nothing, and drew %d", view.Len())
	}
}

// [[spec/design_output/tree-view#the-columns-stand-still]]
func TestTheRowsScrollAndTheColumnNamesHold(t *testing.T) {
	t.Parallel()
	many := make([]Item, 0, 30)
	for at := 1; at <= 30; at++ {
		many = append(many, item("row "+strings.Repeat("x", at%3), "open", "says"))
	}
	view := NewTree(columns(), many, true)
	names := view.Header(60)
	view.MoveTo(29)
	view.Scroll(10)
	drawn := view.Rows(60, 10)
	if strings.Count(drawn, "\n") != 9 {
		t.Fatalf("ten rows draw ten lines, and drew %d", strings.Count(drawn, "\n")+1)
	}
	if view.Header(60) != names {
		t.Fatalf("the column names hold while the rows scroll, and read %q", view.Header(60))
	}
}

// [[spec/design_output/tree-view#the-filter-reads-an-item]]
func TestTheFilterReadsAnItemInTheLanguageTheLogReads(t *testing.T) {
	t.Parallel()
	narrow := func(said string) *Tree {
		f, err := ParseFilter(said)
		if err != nil {
			t.Fatalf("%q reads as a filter, and answered %v", said, err)
		}
		view := tickets()
		view.Narrow(f)
		return view
	}
	if view := narrow("state: closed"); view.Len() != 3 {
		t.Fatalf("one column narrows to the two closed rows and their parent, and %d stand", view.Len())
	}
	if view := narrow("bands"); view.Len() != 2 {
		t.Fatalf("a bare word reaches every value, and %d rows stand", view.Len())
	}
	if view := narrow("name: /^the tree$/"); view.Len() != 1 {
		t.Fatalf("a pattern over the name keeps one row, and %d stand", view.Len())
	}
	if view := narrow("nothing matches this"); view.Len() != 0 {
		t.Fatalf("a filter nothing matches keeps no row, and %d stand", view.Len())
	}
	if !narrow("bands").Narrowed() || tickets().Narrowed() {
		t.Fatal("a held filter says so, and an empty one says not")
	}
}

// [[spec/design_output/tree-view#a-parent-stands-for-it]]
func TestAParentStandsWhileAChildMatches(t *testing.T) {
	t.Parallel()
	f, err := ParseFilter("three bands")
	if err != nil {
		t.Fatal(err)
	}
	view := tickets()
	view.Narrow(f)
	drawn := view.Rows(60, 2)
	if view.Len() != 2 {
		t.Fatalf("the matching child and its parent stand, and %d rows do", view.Len())
	}
	for _, want := range []string{"the window", "the help"} {
		if !strings.Contains(drawn, want) {
			t.Fatalf("the rows hold %q, and draw:\n%s", want, drawn)
		}
	}
	if strings.Contains(drawn, "the strip and the footer") {
		t.Fatalf("a child matching nothing goes, and the rows draw:\n%s", drawn)
	}
	if !strings.Contains(drawn, "▾") {
		t.Fatalf("the parent stands open over its match, and draws:\n%s", drawn)
	}
}

// [[spec/design_output/tree-view#a-parent-stands-for-it]]
func TestAParentOverNoMatchCarriesNoMark(t *testing.T) {
	t.Parallel()
	f, err := ParseFilter("name: /^the window$/")
	if err != nil {
		t.Fatal(err)
	}
	view := tickets()
	view.Narrow(f)
	if view.Len() != 1 {
		t.Fatalf("the parent alone stands, and %d rows do", view.Len())
	}
	if strings.ContainsAny(view.Rows(60, 1), "▾▸") {
		t.Fatalf("a parent the filter empties carries no mark, and draws:\n%s", view.Rows(60, 1))
	}
}
