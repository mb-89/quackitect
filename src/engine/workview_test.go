package main

import (
	"path/filepath"
	"testing"
)

// EVERY STATE A WORKER HOLDS DRAWS UNDER A GROUP THAT SAYS SO.
//
// THE PERSON'S WORDS: the in work group does not show up as in work, the in
// works I see only under here.
//
// A DECLARED GROUP IS A QUERY AND NOT A PLACE, so a row draws under every
// group whose filter takes it. That is why the fix is one of declaration: a
// state with no group of its own is visible only under here, which says four
// states at once.
//
// THE RENDERER IS ASKED, not the file. Re-reading the filters here would
// re-implement the drawing and could agree with itself while the page
// disagreed.
func TestEveryStateAWorkerHoldsDrawsUnderAGroupSayingSo(t *testing.T) {
	b, err := LoadBase(filepath.Join("..", "..", "util", "views", "work.base"))
	if err != nil {
		t.Fatal(err)
	}
	states := append(HandedOut(RoleWorker), HeldBy(RoleWorker)...)
	if len(states) == 0 {
		t.Fatal("the engine named no state a worker is handed or holds, so this has nothing to ask")
	}
	var rows []Row
	for _, s := range states {
		rows = append(rows, row("id", "wk-"+string(s), "type", "work",
			"title", "one in "+string(s), "status", string(s), "assignee", "main"))
	}
	tab, err := Render(b, b.Views[0], rows)
	if err != nil {
		t.Fatal(err)
	}
	drawnIn := map[string][]string{}
	var walk func(gs []Group)
	walk = func(gs []Group) {
		for _, g := range gs {
			for _, l := range g.Lines {
				drawnIn[l.ID] = append(drawnIn[l.ID], g.Name)
			}
			walk(g.Groups)
		}
	}
	walk(tab.Pinned)
	walk(tab.Groups)
	for _, s := range states {
		id, saysSo := "wk-"+string(s), false
		for _, name := range drawnIn[id] {
			if name == string(s) {
				saysSo = true
			}
		}
		if len(drawnIn[id]) == 0 {
			t.Errorf("a token in %s draws in no group at all, so a person cannot see it", s)
			continue
		}
		if !saysSo {
			t.Errorf("a token in %s draws under %v and under no group named %s, so the page never says what state it is in",
				s, drawnIn[id], s)
		}
	}
}
