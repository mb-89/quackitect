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
	r := row("status", "open", "assignee", "main", "bucket", "", "form", "write the thing")
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
		`form.contains("write")`,
		`form.startsWith("write")`,
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
  form:
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
      - form
      - status
    columnSize:
      form: 620
    pinned:
      - name: yours
        filter: assignee == "human"
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
	if b.Display["form"] != "what" || !b.Opens["form"] {
		t.Fatalf("properties read as %v %v", b.Display, b.Opens)
	}
	if len(b.Views) != 1 {
		t.Fatalf("%d views", len(b.Views))
	}
	v := b.Views[0]
	if len(v.Order) != 2 || v.Order[0] != "form" || v.Widths["form"] != 620 {
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
func TestPinnedGroupsTakeTheirRowsOutOfTheGrouping(t *testing.T) {
	p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - form
    pinned:
      - name: yours
        filter: assignee == "human"
      - name: also-yours
        filter: assignee == "human"
    groupBy:
      - property: if(bucket, bucket, status)
        sets: bucket
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	rows := []Row{
		row("id", "1", "assignee", "human", "status", "open", "form", "theirs"),
		row("id", "2", "assignee", "main", "status", "open", "form", "mine"),
		row("id", "3", "assignee", "main", "status", "open", "bucket", "later", "form", "filed"),
	}
	tab, err := Render(b, b.Views[0], rows)
	if err != nil {
		t.Fatal(err)
	}
	if len(tab.Pinned) != 2 || tab.Pinned[0].Count != 1 {
		t.Fatalf("pinned %v", tab.Pinned)
	}
	// The second pin has the same filter and gets nothing, because the first
	// one already took the row.
	if tab.Pinned[1].Count != 0 {
		t.Fatalf("a row landed in two pinned groups")
	}
	// What is left groups by the computed level: one bucket, one status.
	names := map[string]int{}
	for _, g := range tab.Groups {
		names[g.Name] = g.Count
	}
	if names["later"] != 1 || names["open"] != 1 || len(names) != 2 {
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
      - form
    collapsed:
      - backlogged
    groupBy:
      - property: status
`)
	b, _ := LoadBase(p)
	tab, err := Render(b, b.Views[0], []Row{
		row("id", "1", "status", "backlogged", "form", "a"),
		row("id", "2", "status", "open", "form", "b"),
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
