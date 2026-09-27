// The wiring binds each local port to a name: a standard name, the name of a
// writer, or `<instance>/<port>`, and one type loads as many instances.
// [[spec/design_output/model#the-wiring-file]]
package q

import "testing"

type rowsOf struct {
	Rows int `q:"rows"`
}

type weightOf struct {
	Weight int `q:"config/weight"`
}

// Loads the wiring, and answers the store and the writer each instance's given port hands back.
func loaded(t *testing.T, w Wiring, types map[string]func(*Catalog, map[string]Writer), instance ...string) (*Store, map[string]Writer) {
	t.Helper()
	hands := map[string]Writer{}
	registers := map[string]func(*Catalog){}
	for name, register := range types {
		registers[name] = func(c *Catalog) { register(c, hands) }
	}
	c, faults := Load(w, registers)
	if len(faults) > 0 {
		t.Fatalf("the load refuses: %v", faults)
	}
	if faults := c.Check(nil); len(faults) > 0 {
		t.Fatalf("the catalog refuses: %v", faults)
	}
	return NewStore(c, nil), hands
}

func seed(t *testing.T, s *Store, hand Writer, name string, value any) {
	t.Helper()
	if _, err := s.Commit(s.Snapshot().Revision, hand, map[string]any{name: value}); err != nil {
		t.Fatalf("the seed of %s answers %v", name, err)
	}
}

func run(t *testing.T, s *Store, name string) any {
	t.Helper()
	if err := s.Run(name); err != nil {
		t.Fatalf("the run of %s answers %v", name, err)
	}
	return s.Snapshot().Read(name)
}

var source = func(c *Catalog, hands map[string]Writer) { hands["source"] = GivenIn(c, "all", 0) }

var counter = func(c *Catalog, _ map[string]Writer) {
	DerivedIn(c, "count", 0, func(in rowsOf) int { return in.Rows })
}

func TestAStandardNameCarriesTheValueFromOutPortToInPort(t *testing.T) {
	w := Wiring{
		Instances: []Instance{{"tickets", "source"}, {"queue", "counter"}},
		Wires:     map[string]string{"tickets.all": "tickets/all", "queue.rows": "tickets/all"},
	}
	s, hands := loaded(t, w, map[string]func(*Catalog, map[string]Writer){"source": source, "counter": counter})
	seed(t, s, hands["source"], "tickets/all", 3)
	if got := run(t, s, "queue/count"); got != 3 {
		t.Fatalf("queue/count reads %v off tickets/all", got)
	}
}

func TestAPortToPortWireReadsTheWritersName(t *testing.T) {
	w := Wiring{
		Instances: []Instance{{"tickets", "source"}, {"queue", "counter"}},
		Wires:     map[string]string{"queue.rows": "tickets.all"},
	}
	s, hands := loaded(t, w, map[string]func(*Catalog, map[string]Writer){"source": source, "counter": counter})
	seed(t, s, hands["source"], "tickets/all", 4)
	if got := run(t, s, "queue/count"); got != 4 {
		t.Fatalf("queue/count reads %v off the writer tickets/all", got)
	}
}

func TestAnUnwiredOutPortReadsAsInstanceAndPort(t *testing.T) {
	clock := func(c *Catalog, _ map[string]Writer) { GivenIn(c, "minute", int64(7)) }
	w := Wiring{Instances: []Instance{{"clock", "clock"}}}
	s, _ := loaded(t, w, map[string]func(*Catalog, map[string]Writer){"clock": clock})
	if got := s.Snapshot().Read("clock/minute"); got != int64(7) {
		t.Fatalf("clock/minute reads %v", got)
	}
}

func TestOneTypeLoadsAsTwoInstancesEachWithItsConfig(t *testing.T) {
	count := 0
	weighed := func(c *Catalog, hands map[string]Writer) {
		count++
		hands[string(rune('a'+count-1))] = CfgIn(c, "weight", 1)
		DerivedIn(c, "score", 0, func(in weightOf) int { return in.Weight })
	}
	w := Wiring{Instances: []Instance{{"queue", "weighed"}, {"backlog", "weighed"}}}
	s, hands := loaded(t, w, map[string]func(*Catalog, map[string]Writer){"weighed": weighed})
	seed(t, s, hands["a"], "queue/config/weight", 2)
	seed(t, s, hands["b"], "backlog/config/weight", 5)
	if queue, backlog := run(t, s, "queue/score"), run(t, s, "backlog/score"); queue != 2 || backlog != 5 {
		t.Fatalf("queue/score reads %v and backlog/score reads %v", queue, backlog)
	}
}

func TestAnUnwiredInPortAnswersAFault(t *testing.T) {
	w := Wiring{Instances: []Instance{{"queue", "counter"}}}
	_, faults := Load(w, map[string]func(*Catalog){"counter": func(c *Catalog) { counter(c, nil) }})
	if len(faults) != 1 || faults[0].Kind != Unwired || faults[0].Name != "queue/count" {
		t.Fatalf("the load answers %v", faults)
	}
}

func TestABuiltInInPortKeepsItsZeroValue(t *testing.T) {
	w := Wiring{Instances: []Instance{{"queue", "counter"}}, Wires: map[string]string{"queue.rows": BuiltIn}}
	s, _ := loaded(t, w, map[string]func(*Catalog, map[string]Writer){"counter": counter})
	if got := run(t, s, "queue/count"); got != 0 {
		t.Fatalf("queue/count reads %v off a built-in in-port", got)
	}
}

func TestReadWiringReadsInstancesAndWires(t *testing.T) {
	text := "instances:\n  queue:\n    module: queue\n  tickets:\n    module: tickets\nwires:\n  tickets.all: tickets/all\n  queue.rows: tickets/all\n"
	w, err := ReadWiring(text)
	if err != nil {
		t.Fatal(err)
	}
	if len(w.Instances) != 2 || w.Instances[0] != (Instance{"queue", "queue"}) || w.Instances[1] != (Instance{"tickets", "tickets"}) {
		t.Fatalf("the instances read %v", w.Instances)
	}
	if len(w.Wires) != 2 || w.Wires["queue.rows"] != "tickets/all" || w.Wires["tickets.all"] != "tickets/all" {
		t.Fatalf("the wires read %v", w.Wires)
	}
}
