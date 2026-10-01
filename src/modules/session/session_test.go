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

// The module keeps the fill, the last and the reports alone, since the holds fold stands in the hooks module that reads it. [[spec/tickets/cage-call-holds-port]]
func TestTheModuleKeepsTheFillTheLastAndTheReportsAlone(t *testing.T) {
	c := q.New()
	Registers(c)
	if folds := q.NewStore(c).Folds(""); len(folds) != 3 || folds[0] != FillName || folds[1] != LastName || folds[2] != ReportsName {
		t.Fatalf("the module keeps the folds %v, and wants %s, %s and %s", folds, FillName, LastName, ReportsName)
	}
}

// A helper's stop lands its agent on the reports, and the session's own stop and a helper's other events pass by. [[spec/tickets/find-and-wait-in-go]]
func TestAHelpersStopLandsItsReport(t *testing.T) {
	ix := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	for seq, event := range []q.Event{
		{Kind: "tool.call", Hand: q.Hand{Session: "s1", Agent: "a0"}},
		{Kind: "classic.Stop", Hand: q.Hand{Session: "s1"}},
		{Kind: "classic.Stop", Hand: q.Hand{Session: "s1", Agent: "a1"}},
	} {
		event.Seq = int64(seq + 1)
		if err := ix.Store().Land("s1/reports", event); err != nil {
			t.Fatalf("the %s event lands on s1/reports with %v, and wants the fold to take it", event.Kind, err)
		}
	}
	if got, ok := ix.Read("s1/reports").([]string); !ok || len(got) != 1 || got[0] != "a1" {
		t.Errorf("s1/reports reads %v, and wants the helper a1 alone", ix.Read("s1/reports"))
	}
}

// The reports read every session's helpers, so a wait hears a helper whatever session it stops in. [[spec/tickets/find-and-wait-in-go]]
func TestTheReportsReadEverySession(t *testing.T) {
	ix := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	for seq, hand := range []q.Hand{{Session: "s1", Agent: "a1"}, {Session: "s2", Agent: "a2"}} {
		event := q.Event{Seq: int64(seq + 1), Kind: "classic.Stop", Hand: hand}
		if err := ix.Store().Land(hand.Session+"/reports", event); err != nil {
			t.Fatalf("the stop lands on %s/reports with %v, and wants the fold to take it", hand.Session, err)
		}
	}
	got, ok := ix.Read("reports").([]string)
	seen := map[string]bool{}
	for _, one := range got {
		seen[one] = true
	}
	if !ok || len(got) != 2 || !seen["a1"] || !seen["a2"] {
		t.Errorf("the reports read %v, and want a1 and a2, one a session", ix.Read("reports"))
	}
}
