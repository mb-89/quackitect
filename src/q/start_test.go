// The start resolves the wiring in any order, and refuses loudly on each
// fault, naming the port. An instance that runs nowhere leaves its readers
// the built-in value. [[spec/design_output/model#the-index-resolves-in-passes]]
package q

import (
	"strings"
	"testing"
)

type labelOf struct {
	Rows string `q:"rows"`
}

var labeller = func(c *Catalog) {
	DerivedIn(c, "label", "", func(in labelOf) string { return in.Rows })
}

// Starts the wiring, and answers the store and the writer each source instance hands back. [[spec/design_output/model#the-index-resolves-in-passes]]
func started(t *testing.T, w Wiring) (*Store, map[string]Writer) {
	t.Helper()
	hands := map[string]Writer{}
	types := map[string]func(*Catalog){
		"source":  func(c *Catalog) { source(c, hands) },
		"counter": func(c *Catalog) { counter(c, hands) },
	}
	s, err := Start(w, types)
	if err != nil || s == nil {
		t.Fatalf("the start refuses: %v", err)
	}
	return s, hands
}

func refused(t *testing.T, w Wiring, types map[string]func(*Catalog), names ...string) {
	t.Helper()
	s, err := Start(w, types)
	if s != nil || err == nil {
		t.Fatalf("the start answers a store and %v", err)
	}
	for _, name := range names {
		if !strings.Contains(err.Error(), name) {
			t.Fatalf("the refusal names no %s: %v", name, err)
		}
	}
}

func TestAReaderRegisteredBeforeItsWriterStarts(t *testing.T) {
	w := Wiring{
		Instances: []Instance{{"queue", "counter"}, {"tickets", "source"}},
		Wires:     map[string]string{"queue.rows": "tickets.all"},
	}
	s, hands := started(t, w)
	seed(t, s, hands["source"], "tickets/all", 5)
	if got := run(t, s, "queue/count"); got != 5 {
		t.Fatalf("queue/count reads %v off a writer registered after it", got)
	}
}

func TestAnInPortWithNoWireAndNoBuiltInRefusesNamingThePort(t *testing.T) {
	w := Wiring{Instances: []Instance{{"queue", "counter"}}}
	refused(t, w, map[string]func(*Catalog){"counter": func(c *Catalog) { counter(c, nil) }}, "queue.rows")
}

func TestTwoOutPortsOnOneStandardNameRefuseNamingBoth(t *testing.T) {
	w := Wiring{
		Instances: []Instance{{"tickets", "source"}, {"backlog", "source"}},
		Wires:     map[string]string{"tickets.all": "tickets/all", "backlog.all": "tickets/all"},
	}
	hands := map[string]Writer{}
	refused(t, w, map[string]func(*Catalog){"source": func(c *Catalog) { source(c, hands) }}, "tickets.all", "backlog.all")
}

func TestAnInPortWiredToAnotherTypeRefusesNamingBothTypes(t *testing.T) {
	w := Wiring{
		Instances: []Instance{{"tickets", "source"}, {"queue", "labeller"}},
		Wires:     map[string]string{"queue.rows": "tickets.all"},
	}
	hands := map[string]Writer{}
	types := map[string]func(*Catalog){"source": func(c *Catalog) { source(c, hands) }, "labeller": labeller}
	refused(t, w, types, "queue.rows", "string", "int")
}

func TestAnInstanceThatRunsNowhereReadsTheBuiltInMarkedNotProvided(t *testing.T) {
	w := Wiring{
		Instances: []Instance{{"tickets", "source"}, {"queue", "counter"}},
		Wires:     map[string]string{"queue.rows": "tickets.all"},
	}
	s, hands := started(t, w)
	seed(t, s, hands["source"], "tickets/all", 5)
	if err := s.Down("tickets"); err != nil {
		t.Fatalf("the down of tickets answers %v", err)
	}
	snap := s.Snapshot()
	if got := snap.Read("tickets/all"); got != 0 || !snap.NotProvided("tickets/all") {
		t.Fatalf("tickets/all reads %v, marked not provided %v", got, snap.NotProvided("tickets/all"))
	}
	if got := run(t, s, "queue/count"); got != 0 {
		t.Fatalf("queue/count reads %v off an instance that runs nowhere", got)
	}
	said, err := s.Why("tickets/all")
	if err != nil || said.State != "not provided" {
		t.Fatalf("why tickets/all reads %q and %v", said.State, err)
	}
}

func TestTheDownOfAnInstanceTheWiringLoadsNowhereRefuses(t *testing.T) {
	w := Wiring{Instances: []Instance{{"tickets", "source"}}}
	s, _ := started(t, w)
	if err := s.Down("backlog"); err == nil || !strings.Contains(err.Error(), "backlog") {
		t.Fatalf("the down of backlog answers %v", err)
	}
	if s.Snapshot().NotProvided("tickets/all") {
		t.Fatalf("tickets/all reads not provided after the down of another instance")
	}
}
