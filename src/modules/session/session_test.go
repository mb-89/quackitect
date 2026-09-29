// The folds over a session's events: the fill the newest event naming one
// says, and the place and kind of the newest event.
// [[spec/design_output/model#a-fold-keeps-its-state]]
package session

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestTheFillReadsTheNewestEventNamingOne(t *testing.T) {
	ix := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	if fill := ix.Land("s1/fill", q.Event{Seq: 1, Kind: "tool.call", Fields: map[string]any{"fill": float64(1200)}}); fill != 1200 {
		t.Fatalf("the fill reads %v, and wants 1200", fill)
	}
	if fill := ix.Land("s1/fill", q.Event{Seq: 2, Kind: "prompt.submit"}); fill != 1200 {
		t.Fatalf("the fill reads %v past an event naming none, and wants 1200 kept", fill)
	}
}

func TestTheLastReadsThePlaceAndKindOfTheNewestEvent(t *testing.T) {
	ix := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	ix.Land("s1/last", q.Event{Seq: 1, Kind: "tool.call"})
	if last := ix.Land("s1/last", q.Event{Seq: 2, Kind: "classic.Stop"}); last != (Last{Seq: 2, Kind: "classic.Stop"}) {
		t.Fatalf("the last reads %+v, and wants seq 2, classic.Stop", last)
	}
}

func TestTheFillTakesAWholeNumberAsTheDoorHandsIt(t *testing.T) {
	ix := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	if fill := ix.Land("s1/fill", q.Event{Seq: 1, Kind: "tool.call", Fields: map[string]any{"fill": 900}}); fill != 900 {
		t.Fatalf("the fill reads %v, and wants 900", fill)
	}
}
