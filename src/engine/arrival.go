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

// WHAT IS KEPT. The session, a count of the pulls it has seen, and the count
// each actor was at when it last pulled.
//
// THE COUNT IS WHAT DECAYS. An actor that is in the record has arrived, and
// that never changes. Whether it is still there is a different question, and it
// is answered by how far the queue has moved since it last pulled.
type arrivals struct {
	Session string         `json:"session"`
	Pulls   int            `json:"pulls"`
	At      map[string]int `json:"at"`

	// THE ORDER THEY FIRST PULLED, which At cannot answer twice over: a map has
	// no order, and the count it holds is the LAST pull rather than the first.
	// It is written where the first pull is already known, which is here.
	Order []string `json:"order,omitempty"`
}

func arrivalPath(r Roots) string { return r.Private("arrivals.json") }

// Arrived answers whether this is the actor's first pull of the session, and
// records that it has now happened. It answers true once and false after.
//
// A pull with no session is a pull with no engine running. It answers false,
// because nothing probed the machine and nothing knows what to reclaim from.
func Arrived(r Roots, session, actor string) bool {
	if !Named(session) {
		return false
	}
	var seen bool
	_ = locked(arrivalPath(r), func() error { // the guard answers whether or not it can record the arrival
		a := loadArrivals(r)
		if a.Session != session {
			a = arrivals{Session: session}
		}
		if a.At == nil {
			a.At = map[string]int{}
		}
		_, seen = a.At[actor]
		// EVERY PULL MOVES THE COUNT, whoever made it. That is what makes the
		// queue its own clock: a reviewer that has stopped falls behind because
		// somebody else is still pulling.
		a.Pulls++
		a.At[actor] = a.Pulls
		if !seen {
			a.Order = append(a.Order, actor)
		}
		saveArrivals(r, a)
		return nil
	})
	return !seen
}

// Named answers whether a session is one arrivals can be keyed by. A log that
// nothing has started yet has no name, and current is the file rather than a
// session, so neither can tell one run from another.
func Named(session string) bool { return session != "" && session != "current" }

// StillPulling answers whether this actor has pulled within the last `within`
// pulls of the session, without recording an arrival.
//
// A HOLD IS NOT A READER. A token in review carries the name of whoever took
// it, and that name outlives the process behind it: a reviewer whose process
// died left a token held forever, and the queue read that hold as somebody
// reading.
//
// AN ARRIVAL IS NOT A READER EITHER, which is what the first fix got wrong. An
// arrival is written once and never unwritten, so it stays true for the rest of
// the session after the process behind it is gone. That is the same shape as
// the status it replaced, one scope smaller.
//
// SO WHAT IS CONSULTED IS REFRESHED BY THE ACTOR STILL BEING THERE. The pull
// count moves for every pull by anybody, and an actor's entry only moves when
// that actor pulls. A reviewer that stops falls behind while the worker it is
// holding up goes on asking, and the refusal comes back on with nobody having
// to know the time.
func StillPulling(r Roots, session, actor string, within int) bool {
	if !Named(session) || actor == "" || within <= 0 {
		return false
	}
	a := loadArrivals(r)
	if a.Session != session {
		return false
	}
	at, seen := a.At[actor]
	if !seen {
		// A HOLDER THAT HAS NOT PULLED YET IN THIS SESSION HAS NOT STOPPED.
		// Arrivals reset at every restart and a hold lives on the token, so
		// every hold carried across a restart is a holder with no entry. The
		// count is taken from the session's own pulls instead: the hold is
		// trusted until the queue has moved further than the staleness allows.
		return a.Pulls <= within
	}
	return a.Pulls-at <= within
}

// HowFarBehind answers how many pulls the queue has taken since this actor last
// pulled, and whether the engine has ever seen it pull at all.
//
// THE ENGINE HAS THE NUMBER, so it says it. An alarm that says a holder is
// behind and never how far leaves the person it woke to go and find out.
func HowFarBehind(r Roots, session, actor string) (int, bool) {
	if !Named(session) || actor == "" {
		return 0, false
	}
	a := loadArrivals(r)
	if a.Session != session {
		return 0, false
	}
	at, seen := a.At[actor]
	if !seen {
		return a.Pulls, false
	}
	return a.Pulls - at, true
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
	_ = writeAtomic(arrivalPath(r), append(b, '\n'), 0o644) // the guard answers whether or not it can record the arrival
}

// Reclaim takes back what this actor was holding when it last stopped.
//
// AN ARRIVAL MEANS WHOEVER HELD THIS NAME BEFORE IS GONE. What they held is
// work nobody is doing, so the hold is cleared and the queue can hand it out
// again. The token is not moved: where it stands is the process's business,
// and only the hold was ever this function's.
func Reclaim(r Roots, actor string) []string {
	var back []string
	for _, t := range Tokens(r) {
		if t.Holder != actor || t.Ended() {
			continue
		}
		t.Holder = ""
		if err := SaveToken(r, t); err != nil {
			continue
		}
		back = append(back, t.ID)
		inSession(r, "work", actor, t.ID+" reclaimed: whoever held it is gone", Yes(),
			map[string]any{"id": t.ID})
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
