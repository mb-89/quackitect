// The order a press on a column name puts the rows in, driven through Update
// the way the terminal drives it. Every model here reads memory and no file.

package log // level0: InPackageTest - the cases build their rows through row, the helper the in-package detail tests share

import (
	"strings"
	"testing"

	"quackitect/src/tui/draw"
	"quackitect/src/tui/frame"
)

func threeLevels() frame.Model {
	m := window(0)
	logTab(m).Floor = "debug"
	for at, one := range []struct{ level, kind, said string }{
		{"warn", "vale", "c"},
		{"debug", "bash", "a"},
		{"error", "work", "b"},
	} {
		r := row(at+1, one.kind, one.said)
		r.Level = one.level
		logTab(m).All = append(logTab(m).All, r)
	}
	logTab(m).Rebuild(m.Rows())
	return m
}

func saidIn(m frame.Model) string {
	out := make([]string, 0, len(logTab(m).View))
	for _, index := range logTab(m).View {
		out = append(out, logTab(m).All[index].Said)
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
		{draw.GutterWide + StampWide - 1, 0},
		{draw.GutterWide + StampWide, SortNone},
		{draw.GutterWide + StampWide + 1, 1},
		{draw.GutterWide + StampWide + 1 + LevelWide + 1, 2},
		{draw.GutterWide + StampWide + 1 + LevelWide + 1 + KindWide + 1, 3},
		{0, SortNone},
	} {
		if got := ColumnAt(one.x, w); got != one.want {
			t.Fatalf("case %d: column %d stands under x %d, and ColumnAt answers %d", at, one.want, one.x, got)
		}
	}
}

func TestAPressSortsThenFlipsThenPutsTheArrivalOrderBack(t *testing.T) {
	t.Parallel()
	m := threeLevels()
	if saidIn(m) != "cab" {
		t.Fatalf("the log arrives in its own order, and reads %q", saidIn(m))
	}

	said := draw.GutterWide + StampWide + 1 + LevelWide + 1 + KindWide + 1
	m = click(m, said, frame.NamesRow)
	if saidIn(m) != "abc" {
		t.Fatalf("a press on said sorts up, and reads %q", saidIn(m))
	}
	m = click(m, said, frame.NamesRow)
	if !logTab(m).SortDown || saidIn(m) != "cba" {
		t.Fatalf("a second press flips it down, and reads %q", saidIn(m))
	}
	m = click(m, said, frame.NamesRow)
	if logTab(m).SortAt != SortNone || saidIn(m) != "cab" {
		t.Fatalf("a third press puts the arrival order back, and reads %q", saidIn(m))
	}
}

func TestSortingByLevelReadsTheLadderAndTheFooterNamesIt(t *testing.T) {
	t.Parallel()
	m := threeLevels()
	if logTab(m).SortSays() != "" {
		t.Fatalf("no column sorts at the start, and the footer says %q", logTab(m).SortSays())
	}
	m = click(m, draw.GutterWide+StampWide+1, frame.NamesRow)
	if logTab(m).SortSays() != "▲ level" || saidIn(m) != "acb" {
		t.Fatalf("debug, warn then error is the ladder's order under ▲ level, and the rows read %q under %q", saidIn(m), logTab(m).SortSays())
	}
	if !strings.Contains(logTab(m).RenderNames(m.W), draw.Bar.Render(draw.Pad("level", LevelWide))) {
		t.Fatalf("the sorted column lights up, and the names read %q", logTab(m).RenderNames(m.W))
	}
	m = click(m, draw.GutterWide+StampWide+1, frame.NamesRow)
	if logTab(m).SortSays() != "▼ level" || saidIn(m) != "bca" {
		t.Fatalf("a flipped sort runs the ladder down under ▼ level, and the rows read %q under %q", saidIn(m), logTab(m).SortSays())
	}
}

func TestAPressOnTheNamesRowHoldsTheSelectedRowThroughTheReorder(t *testing.T) {
	t.Parallel()
	m := threeLevels()
	m = click(m, 10, frame.FirstRow())
	held := logTab(m).All[logTab(m).Sel].Said
	m = click(m, draw.GutterWide+StampWide+1+LevelWide+1+KindWide+1, frame.NamesRow)
	if logTab(m).All[logTab(m).Sel].Said != held {
		t.Fatalf("the cursor holds the row it stood on, and now stands on %q", logTab(m).All[logTab(m).Sel].Said)
	}
}
