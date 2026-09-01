package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func row(pairs ...string) Row {
	r := Row{}
	for i := 0; i+1 < len(pairs); i += 2 {
		r[pairs[i]] = vs(pairs[i+1])
	}
	return r
}

// The expression language, at the width the views actually use.
func TestWhatAFilterCanSay(t *testing.T) {
	r := row("status", "open", "assignee", "main", "bucket", "", "title", "write the thing")
	r["rounds"] = vn(2)
	r["subs"] = vl([]string{"wk-1", "wk-2"})

	yes := []string{
		`status == "open"`,
		`status != "closed"`,
		`assignee == "main" && status == "open"`,
		`status == "closed" || assignee == "main"`,
		`!bucket`,
		`assignee`,
		`rounds > 1`,
		`rounds >= 2`,
		`title.contains("write")`,
		`title.startsWith("write")`,
		`bucket.isEmpty()`,
		`subs.contains("wk-2")`,
		`(status == "open" || status == "closed") && assignee == "main"`,
	}
	for _, src := range yes {
		e, err := Parse(src)
		if err != nil {
			t.Fatalf("%s: %v", src, err)
		}
		v, err := e.Eval(r)
		if err != nil {
			t.Fatalf("%s: %v", src, err)
		}
		if !v.Truthy() {
			t.Errorf("%s answered false", src)
		}
	}

	// A dotted name is one property, not a method call on the name to its left.
	e, _ := Parse(`state.current`)
	if v, err := e.Eval(r); err != nil || v.Truthy() {
		t.Fatalf("an absent dotted property answered %v %v", v, err)
	}

	// if() is what makes a group level computed.
	e, err := Parse(`if(bucket, bucket, status)`)
	if err != nil {
		t.Fatal(err)
	}
	if v, _ := e.Eval(r); v.Text() != "open" {
		t.Fatalf("with no bucket it fell back to %q", v.Text())
	}
	r["bucket"] = vs("later")
	if v, _ := e.Eval(r); v.Text() != "later" {
		t.Fatalf("with a bucket it answered %q", v.Text())
	}
}

// EVERYTHING OUTSIDE THE SUBSET REFUSES BY NAME. A query language that ignores
// a clause it cannot read answers with a table that looks complete and is
// wrong, and nobody reading the table can tell.
func TestAnUnknownConstructRefusesByName(t *testing.T) {
	for _, c := range []struct{ src, says string }{
		{`status.sortBackwards()`, "sortBackwards"},
		{`nonsense(status)`, "nonsense"},
		{`status ==`, "a value"},
		{`(status == "open"`, "never closes"},
		{`status $ "open"`, `"$"`},
	} {
		e, err := Parse(c.src)
		if err == nil {
			_, err = e.Eval(Row{"status": vs("open")})
		}
		if err == nil {
			t.Errorf("%s was accepted", c.src)
			continue
		}
		if !strings.Contains(err.Error(), c.says) {
			t.Errorf("%s refused with %q, which does not name %q", c.src, err, c.says)
		}
	}
}

func writeBase(t *testing.T, dir, name, text string) string {
	t.Helper()
	os.MkdirAll(dir, 0o755)
	p := filepath.Join(dir, name)
	if err := os.WriteFile(p, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

// The format is the owner's and we render it, so the shapes the owner writes
// have to read.
func TestAViewFileReads(t *testing.T) {
	p := writeBase(t, t.TempDir(), "x.base", `
properties:
  title:
    displayName: what
    opensNote: true
filters:
  and:
    - type == "work"
    - status != "closed"
views:
  - type: table
    name: left
    order:
      - title
      - status
    columnSize:
      title: 620
    groups:
      - name: yours
        filter: assignee == "human"
    pinned:
      - yours
    groupBy:
      - property: if(bucket, bucket, status)
        sets: bucket
        direction: ASC
    collapsed:
      - backlogged
    sort:
      - property: opened
        direction: ASC
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	if b.Display["title"] != "what" || !b.Opens["title"] {
		t.Fatalf("properties read as %v %v", b.Display, b.Opens)
	}
	if len(b.Views) != 1 {
		t.Fatalf("%d views", len(b.Views))
	}
	v := b.Views[0]
	if len(v.Order) != 2 || v.Order[0] != "title" || v.Widths["title"] != 620 {
		t.Fatalf("order %v widths %v", v.Order, v.Widths)
	}
	if len(v.Pinned) != 1 || v.Pinned[0].Name != "yours" {
		t.Fatalf("pinned %v", v.Pinned)
	}
	if len(v.Group) != 1 || v.Group[0].Sets != "bucket" {
		t.Fatalf("group %v", v.Group)
	}
	if len(v.Collapsed) != 1 || v.Collapsed[0] != "backlogged" {
		t.Fatalf("collapsed %v", v.Collapsed)
	}
	if len(v.Sort) != 1 || v.Sort[0].Property != "opened" {
		t.Fatalf("sort %v", v.Sort)
	}
}

// A key nobody implemented refuses rather than being read past.
func TestAViewFileRefusesWhatItCannotDraw(t *testing.T) {
	dir := t.TempDir()
	for _, c := range []struct{ text, says string }{
		{"views:\n  - type: pivot\n    name: p\n", "table"},
		{"summaries:\n  x: y\nviews:\n  - name: a\n", "summaries"},
		{"views:\n  - name: a\n    limitless: true\n", "limitless"},
		{"properties:\n  a:\n    displayName: b\n", "no views"},
	} {
		p := writeBase(t, dir, "y.base", c.text)
		_, err := LoadBase(p)
		if err == nil {
			t.Errorf("%q was accepted", c.text)
			continue
		}
		if !strings.Contains(err.Error(), c.says) {
			t.Errorf("%q refused with %q, which does not name %q", c.text, err, c.says)
		}
	}
}

// PINNED GROUPS ARE A PARTITION. A row goes to the first one that matches and
// is not repeated below, so the top is not a second copy of the same rows.
func TestAQueryTakesNoRowOutOfTheGrouping(t *testing.T) {
	p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - title
    groups:
      - name: yours
        filter: assignee == "human"
      - name: also-yours
        filter: assignee == "human"
    pinned:
      - yours
      - also-yours
    groupBy:
      - property: if(bucket, bucket, status)
        sets: bucket
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	rows := []Row{
		row("id", "1", "assignee", "human", "status", "open", "title", "theirs"),
		row("id", "2", "assignee", "main", "status", "open", "title", "mine"),
		row("id", "3", "assignee", "main", "status", "open", "bucket", "later", "title", "filed"),
	}
	tab, err := Render(b, b.Views[0], rows)
	if err != nil {
		t.Fatal(err)
	}
	if len(tab.Pinned) != 2 || tab.Pinned[0].Count != 1 {
		t.Fatalf("pinned %v", tab.Pinned)
	}
	// THE SECOND QUERY ASKS THE SAME QUESTION AND GETS THE SAME ANSWER.
	// Under the partition it got nothing, because the first had taken the
	// row. A query takes nothing away, so two queries that agree agree.
	if tab.Pinned[1].Count != 1 {
		t.Fatalf("two queries with one filter answered %d and %d",
			tab.Pinned[0].Count, tab.Pinned[1].Count)
	}
	// AND THE GROUPING DRAWS EVERY ROW, not what the queries left. One
	// bucket and one status, with all three rows between them.
	names := map[string]int{}
	for _, g := range tab.Groups {
		names[g.Name] = g.Count
	}
	if names["later"] != 1 || names["open"] != 2 || len(names) != 2 {
		t.Fatalf("the grouping is %v", names)
	}
	// The level says what a drop would write, because a computed level cannot
	// say it from the expression alone.
	for _, g := range tab.Groups {
		if g.Sets != "bucket" {
			t.Fatalf("group %q says a drop writes %q", g.Name, g.Sets)
		}
	}
	if tab.Total != 3 {
		t.Fatalf("total %d", tab.Total)
	}
}

// A collapsed group ships folded, and it is a declaration in the file rather
// than a name in the renderer.
func TestACollapsedGroupIsDeclaredInTheFile(t *testing.T) {
	p := writeBase(t, t.TempDir(), "c.base", `
views:
  - name: left
    order:
      - title
    collapsed:
      - backlogged
    groupBy:
      - property: status
`)
	b, _ := LoadBase(p)
	tab, err := Render(b, b.Views[0], []Row{
		row("id", "1", "status", "backlogged", "title", "a"),
		row("id", "2", "status", "open", "title", "b"),
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, g := range tab.Groups {
		if (g.Name == "backlogged") != g.Shut {
			t.Fatalf("group %q ships shut=%v", g.Name, g.Shut)
		}
	}
}

// EVERY GROUP CARRIES A PIN, AND THE EMPTY ONE IS A GROUP.
//
// Rows that lack the grouping property fall into a group whose name is empty.
// It is usually the biggest one on the page, and it was the one group a person
// could not pin, because the pin was guarded on the name being non-empty.
//
// It is reachable from a shipped control: the Sort popover's group-by level
// writes se view --group <column>, and any column some rows lack makes it.
func TestTheGroupWithNoNameCarriesAPinLikeEveryOther(t *testing.T) {
	p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - title
    groupBy:
      - property: holder
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	tab, err := Render(b, b.Views[0], []Row{
		row("id", "1", "holder", "main", "title", "held"),
		row("id", "2", "title", "nobody holds this"),
		row("id", "3", "title", "nor this"),
	})
	if err != nil {
		t.Fatal(err)
	}
	var empty *Group
	for i := range tab.Groups {
		if tab.Groups[i].Name == "" {
			empty = &tab.Groups[i]
		}
	}
	if empty == nil {
		t.Fatalf("no group with an empty name: %v", tab.Groups)
	}
	if empty.Count != 2 {
		t.Fatalf("the empty group holds %d rows", empty.Count)
	}
	// THE PIN IS THE FILTER THAT WOULD KEEP THOSE ROWS, so it has to be the
	// same expression the engine reads back.
	want := `holder == ""`
	if empty.Pins != want {
		t.Fatalf("the empty group pins with %q rather than %q", empty.Pins, want)
	}
	// AND THE EXPRESSION HAS TO WORK. A pin nobody can evaluate is a pin that
	// empties the pane the moment it is clicked.
	e, err := Parse(empty.Pins)
	if err != nil {
		t.Fatalf("the engine cannot read its own pin %q: %v", empty.Pins, err)
	}
	kept := 0
	for _, r := range []Row{
		row("id", "1", "holder", "main"),
		row("id", "2"),
		row("id", "3"),
	} {
		ok, err := truthy(e, r)
		if err != nil {
			t.Fatal(err)
		}
		if ok {
			kept++
		}
	}
	if kept != 2 {
		t.Fatalf("the pin keeps %d rows rather than 2", kept)
	}
}

// EVERY GROUP MEANS EVERY GROUP, so the count is asserted rather than read.
func TestEveryGroupOnThePageCarriesAPin(t *testing.T) {
	p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - title
    groupBy:
      - property: status
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	tab, err := Render(b, b.Views[0], []Row{
		row("id", "1", "status", "open", "title", "a"),
		row("id", "2", "status", "submitted", "title", "b"),
		row("id", "3", "title", "c"),
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(tab.Groups) != 3 {
		t.Fatalf("%d groups", len(tab.Groups))
	}
	for _, g := range tab.Groups {
		if g.Pins == "" {
			t.Fatalf("the group named %q carries no pin", g.Name)
		}
	}
}

// A PINNED FUNCTIONAL GROUP IS DRAWN WITH NOTHING IN IT, and an unpinned one
// hides at zero and comes back when its filter returns a row.
//
// Pinning is the person saying they want to see it. One they did not pin is an
// empty heading they did not ask for.
func TestAPinnedFunctionalGroupIsDrawnEvenWithNoRows(t *testing.T) {
	p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - title
    groups:
      - name: yours
        filter: assignee == "human"
      - name: mine
        filter: assignee == "main"
    pinned:
      - yours
    groupBy:
      - property: bucket
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	tab, err := Render(b, b.Views[0], []Row{
		row("id", "1", "assignee", "main", "title", "a"),
		row("id", "2", "assignee", "main", "bucket", "later", "title", "b"),
	})
	if err != nil {
		t.Fatal(err)
	}
	// The pinned one is empty and it is still there.
	if len(tab.Pinned) != 1 || tab.Pinned[0].Name != "yours" || tab.Pinned[0].Count != 0 {
		t.Fatalf("the pinned groups are %v", tab.Pinned)
	}
	// The unpinned declared one has rows, so it draws, before anything the data
	// made.
	if len(tab.Groups) == 0 || tab.Groups[0].Name != "mine" {
		t.Fatalf("the groups are %v", names(tab.Groups))
	}
	if !tab.Groups[0].Declared {
		t.Fatal("a declared group does not say it is declared, so it draws no pin")
	}
	if tab.Groups[0].Count != 2 {
		t.Fatalf("mine holds %d rows", tab.Groups[0].Count)
	}
	// AND THE GROUPING DRAWS THOSE ROWS TOO, because a query takes nothing
	// away. Under the partition this asserted the opposite, that nothing was
	// left for the grouping to make a group out of.
	if len(tab.Groups) < 2 {
		t.Fatalf("the query took the rows out of the grouping: %v", names(tab.Groups))
	}
}

func names(gs []Group) []string {
	var out []string
	for _, g := range gs {
		out = append(out, g.Name)
	}
	return out
}

// AN UNPINNED FUNCTIONAL GROUP HIDES AT ZERO AND COMES BACK. It has not been
// asked for, so an empty heading is noise, and the declaration is what brings
// it back the moment the filter returns a row.
func TestAnUnpinnedFunctionalGroupHidesAtZeroAndComesBack(t *testing.T) {
	p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - title
    groups:
      - name: yours
        filter: assignee == "human"
      - name: mine
        filter: assignee == "main"
    pinned:
      - yours
    groupBy:
      - property: bucket
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	draw := func(rows ...Row) ([]string, []string) {
		tab, err := Render(b, b.Views[0], rows)
		if err != nil {
			t.Fatal(err)
		}
		return names(tab.Pinned), names(tab.Groups)
	}

	// Nothing at all. The pinned one is there, the unpinned one is not.
	pinned, groups := draw()
	if len(pinned) != 1 || pinned[0] != "yours" {
		t.Fatalf("the pinned groups are %v", pinned)
	}
	if len(groups) != 0 {
		t.Fatalf("an unpinned functional group drew at zero: %v", groups)
	}

	// One row for it, and it is back. THE GROUPING DRAWS THAT ROW AS WELL,
	// because a query takes nothing away, so this asks whether mine is among
	// the groups rather than whether it is the only one.
	pinned, groups = draw(row("id", "1", "assignee", "main", "title", "a"))
	if !contains(groups, "mine") {
		t.Fatalf("it did not come back: %v", groups)
	}
	if len(pinned) != 1 || pinned[0] != "yours" {
		t.Fatalf("the pinned groups are %v", pinned)
	}
}

// A GROUP THE DATA MADE IS DRAWN WHILE IT HAS ROWS AND NOT AFTER, pinned or
// not. Pinning one writes its filter into the pin and declares nothing, so an
// invented group goes on disappearing when it empties.
func TestPinningAnInventedGroupDoesNotMakeItPermanent(t *testing.T) {
	dir := t.TempDir()
	p := writeBase(t, dir, "z.base", `
views:
  - name: left
    order:
      - title
    groupBy:
      - property: bucket
`)
	if err := AddPin(p, "left", "later", `bucket == "later"`); err != nil {
		t.Fatal(err)
	}
	// THE FILE DECLARES NOTHING ABOUT IT. A declaration would make it permanent.
	text, _ := os.ReadFile(p)
	if strings.Contains(string(text), "groups:") {
		t.Fatalf("pinning an invented group declared it:\n%s", text)
	}

	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	tab, err := Render(b, b.Views[0], []Row{row("id", "1", "bucket", "later", "title", "a")})
	if err != nil {
		t.Fatal(err)
	}
	if len(tab.Pinned) != 1 || tab.Pinned[0].Name != "later" || tab.Pinned[0].Count != 1 {
		t.Fatalf("the pinned groups are %v", tab.Pinned)
	}

	// Empty it, and it is gone even though the pin is still in the file.
	tab, err = Render(b, b.Views[0], []Row{row("id", "1", "title", "a")})
	if err != nil {
		t.Fatal(err)
	}
	if len(tab.Pinned) != 0 {
		t.Fatalf("an invented group survived emptying: %v", names(tab.Pinned))
	}

	// And unpinning takes the whole entry, because nothing else named it.
	if err := DropPinNamed(p, "left", "later"); err != nil {
		t.Fatal(err)
	}
	text, _ = os.ReadFile(p)
	if strings.Contains(string(text), "later") {
		t.Fatalf("unpinning left the invented group behind:\n%s", text)
	}
}

// A PIN DOES NOT DECIDE WHO TAKES A ROW. The file's order does.
//
// yours is a subset of here. here is declared second, so if a pin moved here
// to the front of the partition it took every row yours would have had, and
// yours then had none. None is what hides an unpinned group, so unpinning
// yours hid it forever and no row could bring it back.
//
// The owner's rule is that the moment its function produces more than zero it
// shows again, and this is the case that broke it.
// A PIN IS AN ORDERING AND A QUERY IS A QUESTION.
//
// Getting this wrong hid a group forever under the partition: yours is a subset
// of here, and here was declared second, so unpinning yours let here take every
// row yours would have had. It then had none, and none is what hides it. Under
// queries neither takes anything, and the pin decides only where a group draws.
func TestAPinDecidesOrderAndNotMembership(t *testing.T) {
	write := func(pins string) Base {
		p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - title
    groups:
      - name: yours
        filter: assignee == "human"
      - name: here
        filter: status == "open"
`+pins)
		b, err := LoadBase(p)
		if err != nil {
			t.Fatal(err)
		}
		return b
	}
	// A row that both filters keep. yours is the narrower of the two.
	rows := []Row{
		row("id", "1", "assignee", "human", "status", "open", "title", "a"),
		row("id", "2", "assignee", "main", "status", "open", "title", "b"),
	}
	find := func(tab Table, name string) *Group {
		for i := range tab.Pinned {
			if tab.Pinned[i].Name == name {
				return &tab.Pinned[i]
			}
		}
		for i := range tab.Groups {
			if tab.Groups[i].Name == name {
				return &tab.Groups[i]
			}
		}
		return nil
	}

	// Both pinned: yours is declared first, so it takes the row it shares.
	b := write("    pinned:\n      - yours\n      - here\n")
	tab, err := Render(b, b.Views[0], rows)
	if err != nil {
		t.Fatal(err)
	}
	if g := find(tab, "yours"); g == nil || g.Count != 1 {
		t.Fatalf("yours is %v", g)
	}
	// BOTH PINNED, AND BOTH ANSWER. yours matches one row and here matches
	// both. Under the partition here answered one, because yours was declared
	// first and had taken the row they share.
	if g := find(tab, "here"); g == nil || g.Count != 2 {
		t.Fatalf("here is %v", g)
	}

	// UNPIN YOURS AND IT KEEPS ITS ROW. The pin was an ordering, and the file
	// still says yours comes first.
	b = write("    pinned:\n      - here\n")
	tab, err = Render(b, b.Views[0], rows)
	if err != nil {
		t.Fatal(err)
	}
	g := find(tab, "yours")
	if g == nil {
		t.Fatal("unpinning yours made it disappear while its filter still matched a row")
	}
	if g.Count != 1 {
		t.Fatalf("yours holds %d rows after unpinning", g.Count)
	}
	if g.Pinned {
		t.Fatal("it is still pinned")
	}
	// And it draws in line rather than at the top.
	if len(tab.Pinned) != 1 || tab.Pinned[0].Name != "here" {
		t.Fatalf("the pinned groups are %v", names(tab.Pinned))
	}
}

// GROUPS DECLARED AT THE TOP ARE EVERY VIEW'S. A bucket is a fact about a token
// rather than about a pane, so a group made in one pane has to show in the
// other. Declaring them twice made that a copy, and the panes drew different
// groups the first time somebody edited one.
func TestAViewInheritsTheFilesGroups(t *testing.T) {
	p := writeBase(t, t.TempDir(), "z.base", `
groups:
  - name: yours
    filter: assignee == "human"
  - name: mine
    filter: assignee == "main"
pinned:
  - yours
views:
  - name: left
    order:
      - title
  - name: right
    order:
      - title
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	for _, v := range b.Views {
		if len(v.Groups) != 2 || len(v.Pinned) != 1 {
			t.Fatalf("%s got %d groups and %d pins", v.Name, len(v.Groups), len(v.Pinned))
		}
	}
	rows := []Row{row("id", "1", "assignee", "main", "title", "a")}
	var drew [][]string
	for _, v := range b.Views {
		tab, err := Render(b, v, rows)
		if err != nil {
			t.Fatal(err)
		}
		drew = append(drew, append(names(tab.Pinned), names(tab.Groups)...))
	}
	if len(drew) != 2 || strings.Join(drew[0], " ") != strings.Join(drew[1], " ") {
		t.Fatalf("the panes drew different groups: %v against %v", drew[0], drew[1])
	}
}

// A VIEW THAT DECLARES ITS OWN KEEPS ITS OWN, and it inherits each list on its
// own. Taking both together wiped a view's pins when it declared pins and no
// groups, which is what an ad-hoc pin on a group the data made looks like.
func TestAViewKeepsWhatItDeclaresForItself(t *testing.T) {
	p := writeBase(t, t.TempDir(), "z.base", `
groups:
  - name: yours
    filter: assignee == "human"
pinned:
  - yours
views:
  - name: left
    order:
      - title
  - name: right
    order:
      - title
    groups:
      - name: mine
        filter: assignee == "main"
    pinned:
      - mine
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	if b.Views[0].Groups[0].Name != "yours" || b.Views[0].Pinned[0].Name != "yours" {
		t.Fatalf("the inheriting view got %v", b.Views[0].Groups)
	}
	if len(b.Views[1].Groups) != 1 || b.Views[1].Groups[0].Name != "mine" {
		t.Fatalf("the declaring view got %v", b.Views[1].Groups)
	}
	if len(b.Views[1].Pinned) != 1 || b.Views[1].Pinned[0].Name != "mine" {
		t.Fatalf("the declaring view's pins are %v", b.Views[1].Pinned)
	}
}

// A QUERY IS A QUESTION ASKED OF EVERY ROW, NOT A PLACE A ROW LIVES.
//
// THE OWNER'S RULING: the groups that are not defined by a user defined bucket
// are queries, and they can overlap with user defined groups, and the queries
// can also overlap with themselves, and an item could be found by a query and
// at the same time be in a user defined group.
//
// WHAT THE PARTITION COST. here was declared as one state and claimed those
// rows first, so a group for that state below it could never draw anything.
// The owner read three rows under here where the queue held nine, and saw no
// group for the state at all. Under the partition there was no way to have both.
func TestARowIsInEveryQueryThatMatchesIt(t *testing.T) {
	p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - title
    groupBy:
      - property: bucket
        sets: bucket
    groups:
      - name: yours
        filter: assignee == "human"
      - name: here
        filter: status == "open"
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	// ONE ROW THAT BOTH QUERIES MATCH, AND IT SITS IN A BUCKET.
	rows := []Row{
		row("id", "1", "assignee", "human", "status", "open", "bucket", "later", "title", "a"),
	}
	tab, err := Render(b, b.Views[0], rows)
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"yours", "here"} {
		found := false
		for _, g := range append(append([]Group{}, tab.Pinned...), tab.Groups...) {
			if g.Name == want && g.Count == 1 {
				found = true
			}
		}
		if !found {
			t.Errorf("the row matches the query %q and it is not drawn there", want)
		}
	}
	// AND IT IS STILL IN ITS BUCKET, which is where it actually lives.
	if !inABucketNamed(tab, "later") {
		t.Errorf("the row is in the bucket later and the grouping drew it nowhere")
	}
}

// inABucketNamed answers whether the grouping drew a row under that key.
func inABucketNamed(tab Table, name string) bool {
	var walk func([]Group) bool
	walk = func(gs []Group) bool {
		for _, g := range gs {
			if g.Declared {
				continue
			}
			if g.Name == name && (g.Count > 0 || len(g.Lines) > 0) {
				return true
			}
			if walk(g.Groups) {
				return true
			}
		}
		return false
	}
	return walk(tab.Groups)
}
