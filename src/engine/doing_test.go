package main

import (
	"testing"
)

// ---- the fixtures ----

// oneActor answers the row for this actor, and refuses when the answer carries
// no row for it, because a missing row and a waiting row are two different
// facts and an absent one would read as neither.
func oneActor(t *testing.T, r Roots, actor string) Doing {
	t.Helper()
	said := WhatIsHappening(r)
	for _, d := range said.Actors {
		if d.Actor == actor {
			return d
		}
	}
	t.Fatalf("the answer carries no row for %s, and it has pulled: %+v", actor, said.Actors)
	return Doing{}
}
