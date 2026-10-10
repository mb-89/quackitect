// The tree view: its columns, its nesting, what a parent does when it shuts,
// and the room the last column takes. Every tree here reads memory and no file.

package tree

import (
	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/x/ansi"

	"quackitect/src/tui/draw"
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

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func TestTheSiblingsOfARowStandAtItsOwnLevel(t *testing.T) {
	t.Parallel()
	view := tickets()
	if said := view.Siblings("the frame"); len(said) != 2 || said[0].Name != "the frame" || said[1].Name != "the help" {
		t.Fatalf("a child stands beside its parent's other children, and reads %v", said)
	}
	if said := view.Siblings("the tree"); len(said) != 2 {
		t.Fatalf("a root stands beside the other roots, and reads %v", said)
	}
	if view.Siblings("nobody") != nil {
		t.Fatal("a name the tree holds nowhere has no siblings")
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

// [[spec/design_output/tree-view#the-columns-read-the-item]]
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
	// The gutter stands before every row, so the name starts right past it. [[spec/design_output/tree-view#the-view-draws-a-tree]]
	if strings.HasPrefix(lines[1][draw.GutterWide:], " ") {
		t.Fatalf("a flat view nests nothing, and the second row reads %q", lines[1])
	}
	view.Toggle()
	if view.Len() != 2 {
		t.Fatalf("a flat view collapses nothing, and drew %d", view.Len())
	}
}

// [[spec/design_output/tree-view#a-tab-joins-the-two]]
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
		f, err := draw.ParseFilter(said)
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
	view := narrow("bands")
	if view.Narrow(draw.Filter{}); view.Len() != 4 || view.Narrowed() {
		t.Fatalf("an empty filter keeps every row, and %d stand", view.Len())
	}
}

// [[spec/design_output/tree-view#a-parent-stands-for-it]]
func TestAParentStandsWhileAChildMatches(t *testing.T) {
	t.Parallel()
	f, err := draw.ParseFilter("three bands")
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
	f, err := draw.ParseFilter("name: /^the window$/")
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

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func TestARedrawKeepsTheGroupsAPersonOpened(t *testing.T) {
	t.Parallel()
	was := NewTree(columns(), []Item{
		item("the window", "open", "", item("the frame", "open", "")),
		item("the tree", "open", "", item("the rows", "open", "")),
	}, true)
	was.Collapse(true)
	was.MoveTo(1)
	was.Toggle()
	now := NewTree(columns(), []Item{
		item("a note", "open", ""),
		item("the window", "open", "", item("the frame", "open", "")),
		item("the tree", "open", "", item("the rows", "open", "")),
	}, true)
	now.Carry(was)
	if held := now.Selected(); held == nil || held.Name != "the tree" {
		t.Fatalf("the cursor stays on the row a person stood on, and stands on %v", held)
	}
	want := "a note|the window|the tree|the rows"
	if got := strings.Join(namesOf(now), "|"); got != want {
		t.Fatalf("a row arriving above shuts and opens nothing, and the rows read %q", got)
	}
}

// The held row is found among the rows the filter keeps, as takes lays the line on after the carry. [[spec/tickets/a-filter-keeps-the-cursor]]
func TestARedrawUnderAFilterKeepsTheCursor(t *testing.T) {
	t.Parallel()
	queued := []Item{item("a", "open", ""), item("b", "open", ""), item("q1", "open", "1"), item("c", "open", ""), item("q2", "open", "2"), item("q3", "open", "3")}
	was := NewTree(columns(), queued, true)
	if err := was.Filtering("says: /./"); err != nil {
		t.Fatal(err)
	}
	was.MoveTo(1)
	now := NewTree(columns(), append([]Item{item("d", "open", "")}, queued...), true)
	now.Carry(was)
	if !now.Narrowed() {
		t.Fatal("the carry keeps the filter the old tree held")
	}
	if err := now.Filtering("says: /./"); err != nil {
		t.Fatal(err)
	}
	if held := now.Selected(); held == nil || held.Name != "q2" {
		t.Fatalf("the cursor stays on q2 under the filter, and stands on %v", held)
	}
}

// A redraw builds the tree under the base sort, and the sort a press set stands over it. [[spec/tickets/a-redraw-keeps-the-sort]]
func TestARedrawKeepsTheSortAPersonSet(t *testing.T) {
	t.Parallel()
	based := func() *Tree {
		out := NewTree(columns(), []Item{item("b", "open", "1"), item("a", "open", "2")}, true)
		out.Sorted([]Sort{{Key: "says"}})
		return out
	}
	was := based()
	was.Sorted(nil)
	was.SortOn("name")
	now := based()
	now.Carry(was)
	if got := now.SortSays(); got != was.SortSays() {
		t.Fatalf("the sort stays %q across a redraw, and reads %q", was.SortSays(), got)
	}
	if got := strings.Join(namesOf(now), "|"); got != "a|b" {
		t.Fatalf("the rows keep the order by name, and read %q", got)
	}
	was.Sorted(nil)
	cleared := based()
	cleared.Carry(was)
	if got := cleared.SortSays(); got != "" {
		t.Fatalf("a sort the person cleared stays cleared across a redraw, and reads %q", got)
	}
}

// The edit follows its row by name, where a row arrives above it. [[spec/tickets/open-edits-outlive-redraws]]
func TestARedrawKeepsAnOpenEdit(t *testing.T) {
	t.Parallel()
	was := NewTree(columns(), []Item{item("one", "open", ""), item("two", "open", "")}, true)
	was.MoveTo(1)
	was.Open(2)
	was.Typing(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune("hi")})
	now := NewTree(columns(), []Item{item("new", "open", ""), item("one", "open", ""), item("two", "open", "")}, true)
	now.Carry(was)
	if !now.Editing() || now.Typed() != "hi" {
		t.Fatalf("the edit stands open with hi across the redraw, and editing reads %v with %q", now.Editing(), now.Typed())
	}
	now.Take()
	if said := ValueOf(now.Items[2], "says"); said != "hi" {
		t.Fatalf("the take writes two, and two says %q while new says %q", said, ValueOf(now.Items[0], "says"))
	}
}

// A fill after a redraw reaches the rows a person marked, by name. [[spec/tickets/open-edits-outlive-redraws]]
func TestARedrawKeepsTheMarksAFillReaches(t *testing.T) {
	t.Parallel()
	was := NewTree(columns(), []Item{item("one", "open", ""), item("two", "open", ""), item("three", "open", "")}, true)
	was.MoveTo(0)
	was.Mark()
	was.MoveTo(2)
	was.Mark()
	was.Open(2)
	was.Typing(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune("x")})
	now := NewTree(columns(), []Item{item("new", "open", ""), item("one", "open", ""), item("two", "open", ""), item("three", "open", "")}, true)
	now.Carry(was)
	now.Fill()
	said := []string{}
	for _, one := range now.Items {
		said = append(said, one.Name+"="+ValueOf(one, "says"))
	}
	if got := strings.Join(said, "|"); got != "new=|one=x|two=|three=x" {
		t.Fatalf("the fill reaches one and three alone, and the rows read %q", got)
	}
}

// A take whose row left the view writes nothing, and names the row with the reason. [[spec/tickets/open-edits-outlive-redraws]]
func TestATakeOnARowThatLeftSaysSo(t *testing.T) {
	t.Parallel()
	was := NewTree(columns(), []Item{item("one", "open", ""), item("two", "open", "")}, true)
	was.MoveTo(1)
	was.Open(2)
	now := NewTree(columns(), []Item{item("one", "open", "")}, true)
	now.Carry(was)
	left := now.Take()
	if len(left) != 1 || left[0] != "two" || now.Refused() != RowLeft || len(now.Written()) != 0 {
		t.Fatalf("the take names two with the reason it left, and names %v with %q", left, now.Refused())
	}
}

// [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func TestARedrawKeepsTheOrderUnlessAPlaceChanges(t *testing.T) {
	t.Parallel()
	queued := func(items ...Item) *Tree {
		out := NewTree(columns(), items, true)
		out.Sorted([]Sort{{Key: "says"}})
		return out
	}
	was := queued(item("one", "open", "1"), item("two", "open", ""), item("three", "open", ""))
	now := queued(item("a note", "open", ""), item("one", "open", "1"), item("two", "open", ""), item("three", "open", ""))
	now.Carry(was)
	if got := strings.Join(namesOf(now), "|"); got != "one|a note|two|three" {
		t.Fatalf("a redraw keeps the order of the rows, and they read %q", got)
	}
	moved := queued(item("one", "open", "2"), item("two", "open", "1"), item("three", "open", ""))
	moved.Carry(was)
	if got := strings.Join(namesOf(moved), "|"); got != "two|one|three" {
		t.Fatalf("a place that changes moves its row, and the rows read %q", got)
	}
}
