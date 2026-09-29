// The module reads a row off each line the way ParseRecord in
// src/tui/log/record.go reads it, and ranks it on one ladder.
// [[spec/tickets/the-log-topic-lands]]
package log

import (
	"reflect"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The session port a case feeds, as the wiring binds it. [[spec/design_output/model#the-fake-index]]
func fed(c *q.Catalog) q.Writer {
	hand := q.OutIn(c, SessionPort, q.Content{}, q.Doc("the session log, as the case seeds it"))
	Registers(c)
	return hand
}

func rowsOver(t *testing.T, text string) []Row {
	t.Helper()
	var hand q.Writer
	index := qtest.New(t, func(c *q.Catalog) { hand = fed(c) })
	index.SeedAs(hand, map[string]any{SessionPort: q.Content{Hash: "h", Text: text}})
	said, _ := index.Run(RowsPort).([]Row)
	return said
}

func TestTheLadderRanksAnUnknownLevelAsInfo(t *testing.T) {
	want := []string{"debug", "info", "warn", "error", "fatal"}
	if !reflect.DeepEqual(Ladder, want) {
		t.Fatalf("the ladder reads %v, and wants %v", Ladder, want)
	}
	for level, rank := range map[string]int{"debug": 0, "warn": 2, "WARN": 2, "fatal": 4, "": 1, "loud": 1} {
		if got := Rank(level); got != rank {
			t.Errorf("%q ranks %d, and wants %d", level, got, rank)
		}
	}
}

func TestARowCarriesItsFieldsOffTheLine(t *testing.T) {
	rows := rowsOver(t, `{"at":"2026-01-02T03:04:05.000Z","level":"warn","kind":"tool","said":"ran","tool":"Bash","n":3}

{"door":"write","said":"the write lands"}
`)
	want := []Row{
		{At: "2026-01-02T03:04:05.000Z", Level: "warn", Kind: "tool", Said: "ran", Extra: map[string]string{"tool": "Bash", "n": "3"}},
		{Level: "info", Kind: "write", Said: "the write lands"},
	}
	if !reflect.DeepEqual(rows, want) {
		t.Fatalf("the rows read %+v, and want %+v", rows, want)
	}
}

func TestABrokenLineStandsAsARowAtError(t *testing.T) {
	rows := rowsOver(t, "not json at all\n")
	want := []Row{{Level: "error", Kind: "unparsed", Said: "not json at all", Broken: true}}
	if !reflect.DeepEqual(rows, want) {
		t.Fatalf("the rows read %+v, and want %+v", rows, want)
	}
}
