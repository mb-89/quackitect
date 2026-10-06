// The placements put each instance in no list in a process of its own, and a
// list in one process. A module process commits its instance off the inputs
// the index answers.
// [[spec/design_output/model#the-placements]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
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
	t.Parallel()
	got := commandsOf(placementsOf(placedWiring, map[string]q.Writer{}, [][]string{{"ticket"}}, "quack"))
	if strings.Join(got, " | ") != "quack module ticket | quack module tickets | quack module queue" {
		t.Fatalf("the placements run %q, and want tickets and queue apart, with the clock left to the IO process and the hooks and http listeners to the index", got)
	}
}

func TestThePlacementsKeyReadsItsListsOffTheTree(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	at := filepath.Join(root, "spec", "config", "level0.json")
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(`{"processes": {"placements": [["tickets", "queue"]]}}`), 0o644); err != nil {
		t.Fatal(err)
	}
	if got := placementLists(root); len(got) != 1 || strings.Join(got[0], ", ") != "tickets, queue" {
		t.Fatalf("the placements key reads %v, and wants one list of tickets and queue", got)
	}
}

func TestAListOfInstancesSharesOneProcess(t *testing.T) {
	t.Parallel()
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

// A module process running a doubler wired to a source, whose inputs the index's side answers at 21, the index's side, and each commit the process publishes. [[spec/design_output/model#the-placements]]
func doublerRuns(t *testing.T) (*index.Peer, chan map[string]json.RawMessage) {
	t.Helper()
	w := q.Wiring{Instances: []q.Instance{{Name: "source", Module: "source"}, {Name: "doubler", Module: "doubler"}}, Wires: map[string]string{"doubler.all": "source.all"}}
	types := map[string]func(*q.Catalog){
		"source": func(c *q.Catalog) { q.OutIn(c, "all", 0, q.IO(), q.Doc("the source's count")) },
		"doubler": func(c *q.Catalog) {
			q.DerivedIn(c, "twice", 0, func(in twiceOf) int { return 2 * in.All }, q.Doc("twice the count"))
		},
	}
	moduleSide, err := q.Start(w, types)
	if err != nil {
		t.Fatal(err)
	}
	bus, err := index.StartBus()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(bus.Close)
	peer, err := index.Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatalf("the index's side meets %v", err)
	}
	t.Cleanup(peer.Close)
	saved := []byte(`{"source/all": {"type": "int", "value": 21}}`)
	answered, err := peer.AnswersInputs("doubler", func() ([]byte, error) { return saved, nil })
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(answered)
	heard := make(chan map[string]json.RawMessage, 4)
	done, err := peer.Commits("doubler", func(values map[string]json.RawMessage) { heard <- values })
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(done)
	stop, err := runsModule(bus.URL(), bus.Token(), moduleSide, []string{"doubler"}, os.Stderr)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	return peer, heard
}

// The process runs once at its start with no run sent, and a run over the same inputs answers an empty commit. [[spec/tickets/the-split-deployment-takes-over]]
func TestAModuleProcessAnswersAnEmptyCommitWhereNothingMoved(t *testing.T) {
	t.Parallel()
	peer, heard := doublerRuns(t)
	select {
	case values := <-heard:
		if string(values["doubler/twice"]) != "42" {
			t.Fatalf("the run at the start commits %s", values)
		}
	case <-time.After(10 * time.Second):
		t.Fatal("the run at the start commits nothing")
	}
	if err := peer.Run("doubler"); err != nil {
		t.Fatal(err)
	}
	select {
	case values := <-heard:
		if len(values) != 0 {
			t.Fatalf("a second run over the same inputs commits %s", values)
		}
	case <-time.After(10 * time.Second):
		t.Fatal("a second run answers nothing")
	}
}

func TestAModuleProcessCommitsItsInstanceOffTheInputs(t *testing.T) {
	t.Parallel()
	peer, heard := doublerRuns(t)
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
