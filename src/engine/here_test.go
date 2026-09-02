package main

import (
	"path/filepath"
	"testing"
)

// THE HERE GROUP HOLDS EVERY STATE A WORKER IS HANDED OR HOLDS.
//
// THE SET IS ASKED FOR, NOT TYPED. HandedOut and HeldBy are where the engine
// says which states those are, and a fifth state added to either one arrives
// here without anybody remembering to widen this test. A hand list would be
// complete on the day it was written and would never say when it stopped
// being, which is the shape this project keeps catching.
func TestHereHoldsEveryStateAWorkerIsHandedOrHolds(t *testing.T) {
	here := groupNamed(t, "here")
	want := append(HandedOut(RoleWorker), HeldBy(RoleWorker)...)
	if len(want) == 0 {
		t.Fatal("the engine named no state a worker is handed or holds, so this test has nothing to ask")
	}
	for _, s := range want {
		got, err := truthy(here, Row{"status": vs(string(s))})
		if err != nil {
			t.Fatalf("the here filter refused status %q: %v", s, err)
		}
		if !got {
			t.Errorf("the here filter says no to %q, which is a state a worker is handed or holds, so that work is in no group a person looks at", s)
		}
	}
}

// AND IT HOLDS NOTHING ELSE. Widening a filter until it answers yes to
// everything would pass the test above, so the other half asks the states
// somebody else holds and requires a no.
func TestHereHoldsNothingSomebodyElseIsHolding(t *testing.T) {
	here := groupNamed(t, "here")
	away := append(HandedOut(RoleReviewer), HeldBy(RoleReviewer)...)
	away = append(away, Backlogged, ImpDone, Aborted)
	for _, s := range away {
		got, err := truthy(here, Row{"status": vs(string(s))})
		if err != nil {
			t.Fatalf("the here filter refused status %q: %v", s, err)
		}
		if got {
			t.Errorf("the here filter says yes to %q, which is not a worker's to pick up", s)
		}
	}
}

// groupNamed reads the view file this repository ships and hands back one
// declared group's filter. It refuses rather than skipping, because a check
// that cannot find what it checks has stopped working and must say so.
func groupNamed(t *testing.T, name string) *Expr {
	t.Helper()
	path := filepath.Join("..", "..", "util", "views", "work.base")
	b, err := LoadBase(path)
	if err != nil {
		t.Fatalf("reading %s: %v", path, err)
	}
	for _, v := range b.Views {
		for _, g := range v.Groups {
			if g.Name == name && g.Filter != nil {
				return g.Filter
			}
		}
	}
	t.Fatalf("%s declares no group named %q with a filter", path, name)
	return nil
}
