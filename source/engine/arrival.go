package main

import (
	"encoding/json"
	"os"
	"strings"
)

// ARRIVAL.
//
// An agent arrives once per session. Its first pull is that arrival, and every
// pull after it is an ordinary pull. Two things key off the difference: the
// machine's tool list is handed over once, and an arriving agent reclaims what
// its dead predecessor left holding.
//
// THE DIFFERENCE HAS TO BE REAL. If every pull reclaimed, two reviewers would
// take the same token from each other forever. So it is recorded, and the
// record is the answer.
//
// A SESSION IS THE BOUNDARY, and an arrival record from an earlier session says
// nothing about this one. The machine may have changed and every agent is new.

type arrivals struct {
	Session string   `json:"session"`
	Actors  []string `json:"actors"`
}

func arrivalPath(r Roots) string { return r.Private("arrivals.json") }

// Arrived answers whether this is the actor's first pull of the session, and
// records that it has now happened. It answers true once and false after.
//
// A pull with no session is a pull with no engine running. It answers false,
// because nothing probed the machine and nothing knows what to reclaim from.
func Arrived(r Roots, session, actor string) bool {
	if session == "" || session == "current" {
		return false
	}
	a := loadArrivals(r)
	if a.Session != session {
		a = arrivals{Session: session}
	}
	for _, s := range a.Actors {
		if s == actor {
			return false
		}
	}
	a.Actors = append(a.Actors, actor)
	saveArrivals(r, a)
	return true
}

func loadArrivals(r Roots) arrivals {
	var a arrivals
	b, err := os.ReadFile(arrivalPath(r))
	if err != nil {
		return a
	}
	if json.Unmarshal(b, &a) != nil {
		return arrivals{}
	}
	return a
}

func saveArrivals(r Roots, a arrivals) {
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return
	}
	b, err := json.MarshalIndent(a, "", "  ")
	if err != nil {
		return
	}
	_ = os.WriteFile(arrivalPath(r), append(b, '\n'), 0o644)
}

// RECLAIM ON ARRIVAL, which is what replaces a clock.
//
// A timeout guesses how long work takes and gets it wrong in both directions.
// An arrival is a fact: an agent starting means the one before it is gone, so
// what that one held is free.
//
// A WORKER RECLAIMS ITS OWN AND WHAT IT MINTED. The second half is the crew. A
// walker that comes back spawns fresh scribes, so the sub-tokens it delegated
// have to come back to it. Without that, a dead scribe strands its token and no
// arrival ever frees it.
//
// A REVIEWER RECLAIMS EVERY REVIEW IN ITS SPHERE, whoever holds it, because a
// sphere has one reviewer. That is also what evicts a second one: the newer
// arrival takes the token, and the older reviewer is refused on its next call.
//
// AT THESE LEVELS THE SPHERE IS THE SESSION. When a level above supplies more
// scopes, the same two sentences hold with a narrower filter and nothing else
// changes.
func Reclaim(r Roots, actor, role string) []string {
	var back []string
	for _, t := range Tokens(r) {
		if role == RoleReviewer {
			if t.Status != InReview {
				continue
			}
			t.Status, t.Holder = Submitted, ""
		} else {
			if t.Status != InWork || (t.Assignee != actor && t.MintedBy != actor) {
				continue
			}
			t.Status, t.Holder = Open, ""
		}
		if SaveToken(r, t) == nil {
			back = append(back, t.ID)
		}
	}
	return back
}

func reclaimNotice(back []string) string {
	if len(back) == 0 {
		return ""
	}
	return " Work left holding by whoever came before you is back in the queue: " +
		strings.Join(back, ", ") + "."
}
