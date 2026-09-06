package main

import (
	"quackitect/engine/internal/expr"
	"testing"
)

// A NESTED CHILD IS A ROW A PERSON CAN SEE, SO THE GROUP THAT HOLDS IT COUNTS IT.
//
// Group.Count was len(Lines) taken after nesting, and nesting drops every child
// whose parent is on the same page, so the count answered the TOP LEVEL where
// Total answers the TOKENS. The moment somebody minted a sub-token of an open
// parent the two stopped agreeing, and the sentence on the rule, that the
// buckets below add to this number, stopped being true.
//
// MEASURED ON THE RECORD BEFORE THE FIX: left total 200 against 199 in the
// buckets, and taking the one nested child out of a copy answered 199 and 199.

func aNestingBase(t *testing.T) Base {
	t.Helper()
	p := writeBase(t, t.TempDir(), "z.base", `
views:
  - name: left
    order:
      - title
    groupBy:
      - property: bucket
        sets: bucket
`)
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	return b
}

// A GROUP COUNTS A NESTED CHILD.
func TestAGroupCountsANestedChild(t *testing.T) {
	t.Parallel()
	b := aNestingBase(t)
	rows := []expr.Row{
		row("id", "wk-parent", "assignee", "main", "status", "open", "title", "a parent"),
		row("id", "wk-child", "parent", "wk-parent", "assignee", "main", "status", "open", "title", "a child"),
	}
	tab, err := Render(b, b.Views[0], rows)
	if err != nil {
		t.Fatal(err)
	}
	// THE FIXTURE HAS TO HAVE NESTED, or this counts a flat list and proves
	// nothing about the thing it is named for.
	if !somethingIsNested(tab) {
		t.Fatal("the fixture drew no nested child, so nothing here is about nesting")
	}
	for _, g := range tab.Groups {
		if g.Count != len(rows) {
			t.Errorf("the group %q counts %d and holds %d tokens, one of them nested",
				g.Name, g.Count, len(rows))
		}
	}
}

// THE BUCKETS ADD UP TO THE TOTAL, WHATEVER IS NESTED.
//
// BOTH DIRECTIONS IN ONE FIXTURE. A count that misses a nested child sums under
// the total, and a count that counts one twice sums over it, so the equality is
// what makes the number on the rule true rather than decorative.
func TestTheBucketsAddUpToTheTotal(t *testing.T) {
	t.Parallel()
	b := aNestingBase(t)
	rows := []expr.Row{
		row("id", "wk-parent", "assignee", "main", "status", "open", "title", "a parent"),
		row("id", "wk-child", "parent", "wk-parent", "assignee", "main", "status", "open", "title", "a child"),
		row("id", "wk-alone", "assignee", "main", "status", "open", "title", "an unrelated one"),
	}
	tab, err := Render(b, b.Views[0], rows)
	if err != nil {
		t.Fatal(err)
	}
	if !somethingIsNested(tab) {
		t.Fatal("the fixture drew no nested child, so nothing here is about nesting")
	}
	sum := 0
	for _, g := range tab.Groups {
		sum += g.Count
	}
	if sum != tab.Total {
		t.Errorf("the buckets add to %d and the rule says %d, so the number on the rule is not "+
			"what the buckets below it hold", sum, tab.Total)
	}
}

// somethingIsNested answers whether any line was drawn under another, which is
// the condition both fixtures rest on.
func somethingIsNested(t Table) bool {
	var any func(ls []Line) bool
	any = func(ls []Line) bool {
		for _, l := range ls {
			if len(l.Under) > 0 || any(l.Under) {
				return true
			}
		}
		return false
	}
	for _, g := range t.Groups {
		if any(g.Lines) {
			return true
		}
	}
	for _, g := range t.Pinned {
		if any(g.Lines) {
			return true
		}
	}
	return false
}
