// The order a press on a column name puts the rows in, and what the names row
// and the footer say about it.

package main

import (
	"quackitect/tui/draw"

	"quackitect/tui/frame"
	"quackitect/tui/log"

	"strings"
	"testing"
	"time"
)

func threeLevels() frame.Model {
	m := newModel("no/such/log.jsonl", time.UTC)
	m.W, m.H = 120, 10+frame.NamesWide+frame.HeadWide+frame.FootWide
	theLog(m).Floor = "debug"
	for at, one := range []struct{ level, kind, said string }{
		{"warn", "vale", "c"},
		{"debug", "bash", "a"},
		{"error", "work", "b"},
	} {
		r := row(at+1, one.kind, one.said)
		r.Level = one.level
		theLog(m).All = append(theLog(m).All, r)
	}
	theLog(m).Rebuild(m.Rows())
	return m
}

func saidIn(m frame.Model) string {
	out := make([]string, 0, len(theLog(m).View))
	for _, index := range theLog(m).View {
		out = append(out, theLog(m).All[index].Said)
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
		{draw.GutterWide, 0},
		{draw.GutterWide + 8 - 1, 0},
		{draw.GutterWide + 8, -1},
		{draw.GutterWide + 8 + 1, 1},
		{draw.GutterWide + 8 + 1 + 5 + 1, 2},
		{draw.GutterWide + 8 + 1 + 5 + 1 + 10 + 1, 3},
		{0, -1},
	} {
		if got := log.ColumnAt(one.x, w); got != one.want {
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

	said := draw.GutterWide + 8 + 1 + 5 + 1 + 10 + 1
	m = click(m, said, frame.NamesRow)
	if saidIn(m) != "abc" {
		t.Fatalf("a press on said sorts up, and reads %q", saidIn(m))
	}
	m = click(m, said, frame.NamesRow)
	if !theLog(m).SortDown || saidIn(m) != "cba" {
		t.Fatalf("a second press flips it down, and reads %q", saidIn(m))
	}
	m = click(m, said, frame.NamesRow)
	if theLog(m).SortAt != -1 || saidIn(m) != "cab" {
		t.Fatalf("a third press puts the arrival order back, and reads %q", saidIn(m))
	}
}

func TestSortingByLevelReadsTheLadderAndNotTheLetters(t *testing.T) {
	t.Parallel()
	level := draw.GutterWide + 8 + 1
	m := click(threeLevels(), level, frame.NamesRow)
	if saidIn(m) != "acb" {
		t.Fatalf("debug, warn then error is the ladder's order, and the rows read %q", saidIn(m))
	}
	if saidIn(click(m, level, frame.NamesRow)) != "bca" {
		t.Fatalf("a flipped sort runs the ladder down, and the rows read %q", saidIn(click(m, level, frame.NamesRow)))
	}
}

func TestTheNamesRowLightsTheSortedColumnAndTheFooterNamesIt(t *testing.T) {
	t.Parallel()
	m := threeLevels()
	if theLog(m).SortSays() != "" {
		t.Fatalf("no column sorts at the start, and the footer says %q", theLog(m).SortSays())
	}
	m = click(m, draw.GutterWide+8+1, frame.NamesRow)
	if theLog(m).SortSays() != "▲ level" {
		t.Fatalf("the footer names the column and the direction, and says %q", theLog(m).SortSays())
	}
	if !strings.Contains(theLog(m).RenderNames(m.W), draw.Bar.Render(draw.Pad("level", 5))) {
		t.Fatalf("the sorted column lights up, and the names read %q", theLog(m).RenderNames(m.W))
	}
	m = click(m, draw.GutterWide+8+1, frame.NamesRow)
	if theLog(m).SortSays() != "▼ level" {
		t.Fatalf("a flipped sort turns the arrow over, and the footer says %q", theLog(m).SortSays())
	}
}

func TestAPressOnTheNamesRowHoldsTheSelectedRowThroughTheReorder(t *testing.T) {
	t.Parallel()
	m := threeLevels()
	m = click(m, 10, frame.FirstRow())
	held := theLog(m).All[theLog(m).Sel].Said
	m = click(m, draw.GutterWide+8+1+5+1+10+1, frame.NamesRow)
	if theLog(m).All[theLog(m).Sel].Said != held {
		t.Fatalf("the cursor holds the row it stood on, and now stands on %q", theLog(m).All[theLog(m).Sel].Said)
	}
}
