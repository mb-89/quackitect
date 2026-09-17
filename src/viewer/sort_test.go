// The order a press on a column name puts the rows in, and what the names row
// and the footer say about it.

package main

import (
	"strings"
	"testing"
	"time"
)

func threeLevels() model {
	m := newModel("no/such/log.jsonl", time.UTC)
	m.w, m.h = 120, 10+namesWide+headWide+footWide
	m.floor = "debug"
	for at, one := range []struct{ level, kind, said string }{
		{"warn", "vale", "c"},
		{"debug", "bash", "a"},
		{"error", "work", "b"},
	} {
		r := row(at+1, one.kind, one.said)
		r.Level = one.level
		m.all = append(m.all, r)
	}
	m.rebuild()
	return m
}

func saidIn(m model) string {
	out := make([]string, 0, len(m.view))
	for _, index := range m.view {
		out = append(out, m.all[index].Said)
	}
	return strings.Join(out, "")
}

func TestTheColumnAPressLandsOnAndTheOneItMisses(t *testing.T) {
	t.Parallel()
	w := 120
	for at, one := range []struct {
		x    int
		want int
	}{
		{gutterWide, 0},
		{gutterWide + stampWide - 1, 0},
		{gutterWide + stampWide, sortNone},
		{gutterWide + stampWide + 1, 1},
		{gutterWide + stampWide + 1 + levelWide + 1, 2},
		{gutterWide + stampWide + 1 + levelWide + 1 + kindWide + 1, 3},
		{0, sortNone},
	} {
		if got := columnAt(one.x, w); got != one.want {
			t.Fatalf("case %d: column %d stands under x %d, and columnAt answers %d", at, one.want, one.x, got)
		}
	}
}

func TestAPressSortsThenFlipsThenPutsTheArrivalOrderBack(t *testing.T) {
	t.Parallel()
	m := threeLevels()
	if saidIn(m) != "cab" {
		t.Fatalf("the log arrives in its own order, and reads %q", saidIn(m))
	}

	said := gutterWide + stampWide + 1 + levelWide + 1 + kindWide + 1
	m = click(m, said, namesRow)
	if saidIn(m) != "abc" {
		t.Fatalf("a press on said sorts up, and reads %q", saidIn(m))
	}
	m = click(m, said, namesRow)
	if !m.sortDown || saidIn(m) != "cba" {
		t.Fatalf("a second press flips it down, and reads %q", saidIn(m))
	}
	m = click(m, said, namesRow)
	if m.sortAt != sortNone || saidIn(m) != "cab" {
		t.Fatalf("a third press puts the arrival order back, and reads %q", saidIn(m))
	}
}

func TestSortingByLevelReadsTheLadderAndNotTheLetters(t *testing.T) {
	t.Parallel()
	level := gutterWide + stampWide + 1
	m := click(threeLevels(), level, namesRow)
	if saidIn(m) != "acb" {
		t.Fatalf("debug, warn then error is the ladder's order, and the rows read %q", saidIn(m))
	}
	if saidIn(click(m, level, namesRow)) != "bca" {
		t.Fatalf("a flipped sort runs the ladder down, and the rows read %q", saidIn(click(m, level, namesRow)))
	}
}

func TestTheNamesRowLightsTheSortedColumnAndTheFooterNamesIt(t *testing.T) {
	t.Parallel()
	m := threeLevels()
	if m.sortSays() != "" {
		t.Fatalf("no column sorts at the start, and the footer says %q", m.sortSays())
	}
	m = click(m, gutterWide+stampWide+1, namesRow)
	if m.sortSays() != "▲ level" {
		t.Fatalf("the footer names the column and the direction, and says %q", m.sortSays())
	}
	if !strings.Contains(m.renderNames(m.w), barStyle.Render(pad("level", levelWide))) {
		t.Fatalf("the sorted column lights up, and the names read %q", m.renderNames(m.w))
	}
	m = click(m, gutterWide+stampWide+1, namesRow)
	if m.sortSays() != "▼ level" {
		t.Fatalf("a flipped sort turns the arrow over, and the footer says %q", m.sortSays())
	}
}

func TestAPressOnTheNamesRowHoldsTheSelectedRowThroughTheReorder(t *testing.T) {
	t.Parallel()
	m := threeLevels()
	m = click(m, 10, firstRow())
	held := m.all[m.sel].Said
	m = click(m, gutterWide+stampWide+1+levelWide+1+kindWide+1, namesRow)
	if m.all[m.sel].Said != held {
		t.Fatalf("the cursor holds the row it stood on, and now stands on %q", m.all[m.sel].Said)
	}
}
