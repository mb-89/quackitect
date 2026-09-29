// The q core meets fake modules: the resolution, a write, a run, and a
// writer running nowhere, each over the scripted fake.
// [[spec/design_output/model#the-index-meets-fake-modules]]
package qtest

import (
	"strings"
	"testing"

	"quackitect/src/q"
)

var (
	writes = Module{Type: "writer", Out: true}
	reads  = Module{Type: "reader", Reads: true}
)

// The reader stands before its writer, so the start resolves in two passes. [[spec/design_output/model#the-index-resolves-in-passes]]
var pair = q.Wiring{
	Instances: []q.Instance{{Name: "r", Module: "reader"}, {Name: "w", Module: "writer"}},
	Wires:     map[string]string{"r.in": "w.out"},
}

func startOver(t *testing.T, w q.Wiring, scripts ...Module) (*q.Store, *Fakes) {
	t.Helper()
	fakes := Modules(scripts...)
	s, err := q.Start(w, fakes.Types())
	if err != nil || s == nil {
		t.Fatalf("the start refuses: %v", err)
	}
	return s, fakes
}

func TestTheWiringResolvesFakeModulesInTwoPasses(t *testing.T) {
	s, fakes := startOver(t, pair, writes, reads)
	if _, err := s.Commit(0, fakes.Hands["writer"], map[string]any{"w/out": 5}); err != nil {
		t.Fatal(err)
	}
	if err := s.Run("r/seen"); err != nil {
		t.Fatal(err)
	}
	if got := s.Snapshot().Read("r/seen"); got != 5 {
		t.Fatalf("r/seen reads %v off a writer the wiring names after it", got)
	}
}

func TestAnOpenInPortRefusesNamingTheReaderAndTheName(t *testing.T) {
	w := q.Wiring{Instances: []q.Instance{{Name: "r", Module: "reader"}}}
	s, err := q.Start(w, Modules(reads).Types())
	if s != nil || err == nil || !strings.Contains(err.Error(), "r.in") {
		t.Fatalf("the start over an open in-port answers %v", err)
	}
}

func TestAWriteOfAPortTheModuleRegistersNowhereRefuses(t *testing.T) {
	s, fakes := startOver(t, pair, writes, reads)
	if _, err := s.Commit(0, fakes.Hands["reader"], map[string]any{"w/out": 5}); err == nil || !strings.Contains(err.Error(), "w/out") {
		t.Fatalf("a write of w/out from the reader answers %v", err)
	}
	if got := s.Snapshot().Read("w/out"); got != 0 {
		t.Fatalf("w/out reads %v after the refusal", got)
	}
}

func TestARunReadsOneSnapshotCommitsAndPushes(t *testing.T) {
	s, fakes := startOver(t, pair, writes, reads)
	var pushed []map[string]any
	s.OnCommit(func(values map[string]any) { pushed = append(pushed, values) })
	read, err := s.Commit(0, fakes.Hands["writer"], map[string]any{"w/out": 5})
	if err != nil {
		t.Fatal(err)
	}
	if err := s.Run("r/seen"); err != nil {
		t.Fatal(err)
	}
	snap := s.Snapshot()
	if snap.Read("r/seen") != 5 || snap.From("r/seen") != read {
		t.Fatalf("r/seen reads %v from revision %d, not 5 from %d", snap.Read("r/seen"), snap.From("r/seen"), read)
	}
	if len(pushed) != 2 || pushed[1]["r/seen"] != 5 {
		t.Fatalf("the pushes read %v", pushed)
	}
}

func TestAFakeModuleRunningNowhereReadsNotProvided(t *testing.T) {
	s, fakes := startOver(t, pair, writes, reads)
	if _, err := s.Commit(0, fakes.Hands["writer"], map[string]any{"w/out": 5}); err != nil {
		t.Fatal(err)
	}
	if err := s.Down("w"); err != nil {
		t.Fatal(err)
	}
	snap := s.Snapshot()
	if got := snap.Read("w/out"); got != 0 || !snap.NotProvided("w/out") {
		t.Fatalf("w/out reads %v, marked not provided %v", got, snap.NotProvided("w/out"))
	}
	if said, err := s.Why("w/out"); err != nil || said.State != "not provided" {
		t.Fatalf("why w/out reads %q and %v", said.State, err)
	}
}
