// The placements put each instance in no list in a process of its own, and a
// list in one process. A module process commits its instance off the inputs
// the index answers.
// [[spec/design_output/model#the-placements]]
package main

import (
	"encoding/json"
	"strings"
	"testing"
	"time"

	"quackitect/src/index"
	"quackitect/src/q"
)

var placedWiring = q.Wiring{Instances: []q.Instance{{Name: "clock", Module: "clock"}, {Name: "tickets", Module: "tickets"}, {Name: "queue", Module: "queue"}, {Name: "hooks", Module: hooksModule}, {Name: "http", Module: "http"}, {Name: "ticket", Module: "ticket"}}}

func commandsOf(placed []index.Placed) []string {
	out := []string{}
	for _, one := range placed {
		out = append(out, strings.Join(one.Command, " "))
	}
	return out
}

func TestEachInstanceInNoListTakesAProcessOfItsOwn(t *testing.T) {
	got := commandsOf(placementsOf(placedWiring, map[string]q.Writer{}, [][]string{{"ticket"}}, "quack"))
	if strings.Join(got, " | ") != "quack module ticket | quack module tickets | quack module queue" {
		t.Fatalf("the placements run %q, and want tickets and queue apart, with the clock left to the IO process and the hooks and http listeners to the index", got)
	}
}

func TestAListOfInstancesSharesOneProcess(t *testing.T) {
	placed := placementsOf(placedWiring, map[string]q.Writer{}, [][]string{{"tickets", "queue", "ticket"}}, "quack")
	if got := commandsOf(placed); strings.Join(got, " | ") != "quack module tickets queue ticket" {
		t.Fatalf("the placements run %q, and want tickets, queue and ticket in one process", got)
	}
	if len(placed[0].Instances) != 3 || strings.Join(placed[0].Topics, ", ") != "tickets, queue, verbs" {
		t.Fatalf("the one process holds %v over topics %v", placed[0].Instances, placed[0].Topics)
	}
}

type twiceOf struct {
	All int `q:"all"`
}

func TestAModuleProcessCommitsItsInstanceOffTheInputs(t *testing.T) {
	w := q.Wiring{Instances: []q.Instance{{Name: "source", Module: "source"}, {Name: "doubler", Module: "doubler"}}, Wires: map[string]string{"doubler.all": "source.all"}}
	types := map[string]func(*q.Catalog){
		"source": func(c *q.Catalog) { q.OutIn(c, "all", 0, q.IO(), q.Doc("the source's count")) },
		"doubler": func(c *q.Catalog) {
			q.DerivedIn(c, "twice", 0, func(in twiceOf) int { return 2 * in.All }, q.Doc("twice the count"))
		},
	}
	indexSide, err := q.Start(w, types)
	if err != nil {
		t.Fatal(err)
	}
	moduleSide, err := q.Start(w, types)
	if err != nil {
		t.Fatal(err)
	}
	bus, err := index.StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	peer, err := index.Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatalf("the index's side meets %v", err)
	}
	defer peer.Close()
	saved := []byte(`{"source/all": {"type": "int", "value": 21}}`)
	answered, err := peer.AnswersInputs("doubler", func() ([]byte, error) { return saved, nil })
	if err != nil {
		t.Fatal(err)
	}
	defer answered()
	heard := make(chan map[string]json.RawMessage, 1)
	done, err := peer.Commits("doubler", func(values map[string]json.RawMessage) { heard <- values })
	if err != nil {
		t.Fatal(err)
	}
	defer done()
	_ = indexSide
	stop, err := runsModule(bus.URL(), bus.Token(), moduleSide, []string{"doubler"})
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	if err := peer.Run("doubler"); err != nil {
		t.Fatal(err)
	}
	select {
	case values := <-heard:
		if string(values["doubler/twice"]) != "42" {
			t.Fatalf("the module process commits %s", values)
		}
	case <-time.After(10 * time.Second):
		t.Fatal("the module process commits nothing")
	}
}
