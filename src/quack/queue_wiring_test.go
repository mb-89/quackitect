// The wired queue scores a ticket by the weights the config holds and the
// second git says it came in, the way cli.js does, so the verbs shadow reads
// the same order on both paths.
// [[spec/tickets/verbs-queue-order]]
package main

import (
	"os"
	"path/filepath"
	"testing"

	"quackitect/src/q"
)

// The minute the case stands at, and the seconds of a day. [[spec/design_output/pull#the-queue-is-a-score]]
const (
	caseMinute = int64(29_000_000)
	aDay       = int64(86400)
)

// Two open tickets tie on every term but their age. The name puts a-new first, and the day it stood puts b-old first, as cli.js orders them. [[spec/design_output/pull#the-queue-is-a-score]]
func TestTheWiredQueueWeighsTheDaysATicketStood(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	all, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	w := q.Wiring{Wires: all.Wires}
	for _, one := range all.Instances {
		if one.Module == "tickets" || one.Module == "queue" || one.Module == "work" {
			w.Instances = append(w.Instances, one)
		}
	}
	c := q.New()
	files := q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file"))
	minute := q.OutIn(c, "clock/minute", int64(0), q.Doc("the minute"))
	resolved := q.OutIn(c, q.ResolvedName, q.Resolved{}, q.Doc("the config values"))
	stood := q.OutIn(c, stoodName, map[string]int64{}, q.Doc("the second each ticket path came in"))
	noTips(c)
	if _, err := load(w, c); err != nil {
		t.Fatal(err)
	}
	s := q.NewStore(c)
	now := caseMinute * 60
	open := q.Content{Hash: "open", Text: "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nA thing.\n"}
	for _, seed := range []struct {
		hand   q.Writer
		values map[string]any
	}{
		{files, map[string]any{"files/spec/tickets/a-new.md": open, "files/spec/tickets/b-old.md": open}},
		{minute, map[string]any{"clock/minute": caseMinute}},
		{resolved, map[string]any{q.ResolvedName: q.Resolved{"queue/config/block": "10", "queue/config/day": "1", "queue/config/fail": "5"}}},
		{stood, map[string]any{stoodName: map[string]int64{"spec/tickets/a-new.md": now - 60, "spec/tickets/b-old.md": now - 3*aDay}}},
	} {
		if _, err := s.Commit(0, seed.hand, seed.values); err != nil {
			t.Fatal(err)
		}
	}
	for _, name := range []string{"tickets/all", "tickets/branched", "tickets/branches", "tickets/cloud", "queue/config/block", "queue/config/day", "queue/config/fail", "queue/places"} {
		if err := s.Run(name); err != nil {
			t.Fatalf("the run of %s answers %v", name, err)
		}
	}
	if said, _ := s.Snapshot().Read("queue/places").(map[string]string); said["b-old"] != "1" || said["a-new"] != "2" {
		t.Fatalf("queue/places reads %v, and wants b-old at 1 and a-new at 2", said)
	}
}
