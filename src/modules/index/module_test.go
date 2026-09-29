// The manager meets fake modules: the lease, the writer line, and a read
// beside a writer, each over the scripted fake.
// [[spec/design_output/model#the-index-meets-fake-modules]]
package index

import (
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// A module whose save writes and holds on git, and whose look reads. [[spec/design_output/model#one-writer-per-tree]]
var saver = qtest.Module{Type: "saver", Out: true, Acts: []qtest.Act{
	{Name: "save", Writes: true, Requests: []q.Request{{Module: "git", Verb: "commit", NoUndo: "a case"}}},
	{Name: "look", Requests: []q.Request{{Module: "disk", Verb: "read", NoUndo: "a read"}}},
}}

// Holds git until the case lets it go, and answers every other request at once. [[spec/design_output/model#one-writer-per-tree]]
func gated(gate chan struct{}) func(q.Request) (any, error) {
	return func(one q.Request) (any, error) {
		if one.Module == "git" {
			<-gate
		}
		return one.Verb, nil
	}
}

func savers(t *testing.T) *q.Store {
	t.Helper()
	c := q.New()
	saver.Register(c)
	return q.NewStore(c)
}

func TestAnExpiredLeaseMarksTheFakeModulesPortStale(t *testing.T) {
	var out q.Writer
	dog, store, now := dogOf(t, DogSettings{}, func(c *q.Catalog) { out = saver.Register(c) })
	if _, err := store.Commit(0, out, map[string]any{"out": 3}); err != nil {
		t.Fatal(err)
	}
	dog.Hold("out", 10*time.Second)
	now.pass(15 * time.Second)
	dog.Check()
	snap := store.Snapshot()
	if _, stale := snap.Stale("out"); !stale || snap.Read("out") != 3 {
		t.Fatalf("out reads %v, stale %v, past its lease", snap.Read("out"), stale)
	}
}

func TestWritingActionsOfAFakeModuleRunOneAtATime(t *testing.T) {
	b, _, _ := bookOf(t)
	s, gate := savers(t), make(chan struct{})
	first, err := Call(b, s, "save", "a", "s1", slow, gated(gate))
	if err != nil {
		t.Fatal(err)
	}
	second, err := Call(b, s, "save", "b", "s1", slow, gated(gate))
	if err != nil {
		t.Fatal(err)
	}
	if stateOf(t, b, first.Handle) != Running || stateOf(t, b, second.Handle) != Queued {
		t.Fatalf("the writers stand %s and %s", stateOf(t, b, first.Handle), stateOf(t, b, second.Handle))
	}
	close(gate)
	if one, _ := b.Wait(second.Handle, patience); one.State != Done {
		t.Fatalf("the second writer stands %s after the first lets go", one.State)
	}
}

func TestAReadAnswersWhileAFakeWriterRuns(t *testing.T) {
	b, _, _ := bookOf(t)
	s, gate := savers(t), make(chan struct{})
	defer close(gate)
	save, err := Call(b, s, "save", "a", "s1", slow, gated(gate))
	if err != nil {
		t.Fatal(err)
	}
	look, err := Call(b, s, "look", "a", "s1", quick, gated(gate))
	if err != nil || look.Running || look.Result != "read" {
		t.Fatalf("the look answers %+v and %v beside a running save", look, err)
	}
	if stateOf(t, b, save.Handle) != Running {
		t.Fatalf("the save stands %s while the look answers", stateOf(t, b, save.Handle))
	}
}
