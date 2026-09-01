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
	a := loadArrivals(r)
	if a.Session != session {
		a = arrivals{Session: session}
	}
	if a.At == nil {
		a.At = map[string]int{}
	}
	_, seen := a.At[actor]
	// EVERY PULL MOVES THE COUNT, whoever made it. That is what makes the
	// queue its own clock: a reviewer that has stopped falls behind because
	// somebody else is still pulling.
	a.Pulls++
	a.At[actor] = a.Pulls
	saveArrivals(r, a)
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

// HasPulled answers whether this actor has pulled at all in this session.
//
// It is the difference between a holder that has fallen behind and one the
// engine has never seen, and those are two different sentences to write about a
// hold. Calling the second one stopped sent a worker to spawn a reviewer whose
// arrival then reclaimed what the first reviewer was reading.
func HasPulled(r Roots, session, actor string) bool {
	if !Named(session) || actor == "" {
		return false
	}
	a := loadArrivals(r)
	if a.Session != session {
		return false
	}
	_, seen := a.At[actor]
	return seen
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
		to, held := whereItGoesBack[t.Status]
		if !held || heldBy[t.Status] != role {
			continue
		}
		// A WORKER TAKES BACK ITS OWN AND A REVIEWER TAKES BACK ANY. Work in
		// hand belongs to whoever was asked for it. A review belongs to
		// whichever reviewer is here now.
		if role == RoleWorker && t.Assignee != actor && t.MintedBy != actor {
			continue
		}
		t.Status, t.Holder = to, ""
		if SaveToken(r, t) == nil {
			back = append(back, t.ID)
		}
	}
	return back
}

// WHICH STATES A PULL HANDS OUT, AND WHICH ONE SOMEBODY IS ALREADY HOLDING.
//
// ONE ANSWER, BECAUSE IT WAS WRITTEN OUT THREE TIMES IN THREE SHAPES. pull.go
// tested for spec_open or spec_in_work where it picks a draft, countQueue wrote
// the whole set again for both roles, and a view file typed two of them into a
// filter. Nothing said they were one set, so a twelfth state would have joined
// some of them and not others.
//
// TWO HALVES, THE SAME FOUR VERBS. A worker is handed what is open and holds
// what is in work. A reviewer is handed what is submitted and holds what is in
// review.
func HandedOut(role string) []Status {
	if role == RoleReviewer {
		return []Status{ImpSubmitted, SpecSubmitted}
	}
	return []Status{ImpOpen, SpecOpen}
}

// containsStatus answers whether a set holds a state.
func containsStatus(all []Status, one Status) bool {
	for _, s := range all {
		if s == one {
			return true
		}
	}
	return false
}

// HeldBy answers the states this role is already working, which is the other
// half of what an actor can be in on a queue.
func HeldBy(role string) []Status {
	var out []Status
	for _, s := range States() {
		if to, held := whereItGoesBack[s]; held && heldBy[s] == role {
			_ = to
			out = append(out, s)
		}
	}
	return out
}

// THE FOUR STATES SOMEBODY HOLDS, AND WHERE EACH GOES BACK TO.
//
// TWO HALVES, THE SAME FOUR VERBS. This answered for one half, so a drafter or
// a spec reviewer that died holding a token stranded it: nothing returned it
// and se work --set refuses a status, so the note sat held by a name that was
// gone. Measured on wk-2b78b911b1.
var (
	whereItGoesBack = map[Status]Status{
		SpecInWork:   SpecOpen,
		SpecInReview: SpecSubmitted,
		ImpInWork:    ImpOpen,
		ImpInReview:  ImpSubmitted,
	}
	heldBy = map[Status]string{
		SpecInWork:   RoleWorker,
		SpecInReview: RoleReviewer,
		ImpInWork:    RoleWorker,
		ImpInReview:  RoleReviewer,
	}
)

func reclaimNotice(back []string) string {
	if len(back) == 0 {
		return ""
	}
	return " Work left holding by whoever came before you is back in the queue: " +
		strings.Join(back, ", ") + "."
}
