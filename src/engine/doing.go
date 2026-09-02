package main

import (
	"fmt"
	"sort"
)

// WHAT EACH ACTOR IS DOING, ANSWERED OFF THE RECORD.
//
// THE OWNER'S WORDS: I would like to see what state you're in, or what token
// you're working on, in the header.
//
// IT IS READ AND NEVER TYPED. Every fact here comes from the tokens, the stop
// claim and the arrival record, so an agent cannot say it is working by saying
// so. A state an agent declares is a state an agent gets wrong.
//
// THERE IS NO SUCH THING AS THE AGENT. Every fact in the record is keyed by
// actor and this tree has run one worker and eight reviewers in a session, so
// the answer is one row per actor and the panel draws the list. A panel drawing
// one agent would have to choose, and choosing is a decision nothing here owns.

// THE THREE STATES, IN THE ORDER AN ACTOR IS ASKED ABOUT THEM.
//
// THEY DO NOT PARTITION, WHICH IS WHY THE ORDER IS PART OF THE ANSWER. An actor
// can hold a token and have claimed a stop, and it can hold nothing and have
// claimed nothing. The first true one wins, and waiting is the complement, so
// exactly one is answered whatever the record says.
//
// STOPPED COMES FIRST BECAUSE IT IS THE ONE THE PERSON ACTS ON. An agent that
// has claimed a stop while holding a token is stopped holding a token, and
// drawing it as working would hide the thing they need to see.
//
// REVIEWING WENT WITH THE REVIEW FLOW. An actor holding a token is working on
// it, and which activity of its process that is belongs to the process rather
// than to this list.
const (
	Stopped = "stopped"
	Working = "working"
	Waiting = "waiting"
)

// TheStates answers the order, so a check walks the engine's list rather than
// one typed out beside it.
func TheStates() []string { return []string{Stopped, Working, Waiting} }

// NothingInHand is what the answer says where an actor holds no token, because
// an empty field says nothing and a reader cannot tell it from a field nobody
// filled.
const NothingInHand = "nothing in hand"

// Doing is one actor's row.
type Doing struct {
	Actor string `json:"actor"`
	State string `json:"state"`

	// WHY IT STOPPED, from its own claim. A state with no reason sends the
	// person to the log to find one.
	Why string `json:"why,omitempty"`

	ID    string `json:"id,omitempty"`
	Title string `json:"title,omitempty"`

	// WHAT IT IS HOLDING, IN WORDS, so the panel draws one thing and an absence
	// is a sentence rather than a blank.
	Holding string `json:"holding"`

	// EVERY STATE THAT WAS TRUE OF IT, and not only the one the order picked.
	// With an ordering the interesting failure is TWO rather than none, and a
	// failure that names only the state it did not get cannot say which two.
	True []string `json:"true,omitempty"`
}

// Happening is the whole answer.
//
// THE HOLD IS ONCE FOR THE TREE AND NEVER PER ACTOR. It is one file covering
// everything, so drawing it beside each row would say four agents are held when
// one file is.
type Happening struct {
	Actors []Doing `json:"actors"`
	Hold   Hold    `json:"hold"`
}

// WhatIsHappening answers one row per actor that has pulled in this session.
func WhatIsHappening(r Roots) Happening {
	out := Happening{Actors: []Doing{}, Hold: LoadHold(r)}
	all := Tokens(r)
	for _, actor := range ActorsThatPulled(r) {
		out.Actors = append(out.Actors, doingOf(r, all, actor))
	}
	return out
}

func doingOf(r Roots, all []Token, actor string) Doing {
	d := Doing{Actor: actor, Holding: NothingInHand}
	if c, claimed := StandingClaim(r, actor); claimed {
		d.True = append(d.True, Stopped)
		d.Why = c.Because + ": " + c.Why
	}
	for _, t := range all {
		if t.Holder != actor {
			continue
		}
		// HOLDING IT IS WORKING ON IT. The engine knows the hold; which
		// state of which process it sits in is the token's own word and is
		// reported as it stands rather than sorted into a category here.
		if t.Ended() {
			continue
		}
		d.True = append(d.True, Working)
		d.ID, d.Title = t.ID, t.Title
		d.Holding = t.ID + " " + t.Title
	}
	d.State = Waiting
	for _, s := range TheStates() {
		if trueOf(d.True, s) {
			d.State = s
			break
		}
	}
	if len(d.True) == 0 {
		d.True = []string{Waiting}
	}
	return d
}

// ActorsThatPulled answers every actor that has pulled in this session, in the
// order they first pulled.
//
// THE ORDER IS THE ARRIVAL RECORD'S OWN, written where the first pull is
// already known. Its At map cannot answer it twice over: a map has no order,
// and the count it holds is the LAST pull rather than the first.
//
// A RECORD WRITTEN BEFORE THAT FIELD EXISTED STILL ANSWERS, by its keys in a
// stable order, so a session already running when this landed draws its actors
// rather than none.
func ActorsThatPulled(r Roots) []string {
	a := loadArrivals(r)
	if session := currentSession(r); Named(session) && a.Session != session {
		return nil
	}
	if len(a.Order) > 0 {
		return a.Order
	}
	out := make([]string, 0, len(a.At))
	for actor := range a.At {
		out = append(out, actor)
	}
	sort.Strings(out)
	return out
}

// Describe is one line per actor, for anything that wants words rather than a
// structure.
func (h Happening) Describe() string {
	out := ""
	for _, d := range h.Actors {
		out += fmt.Sprintf("%s %s, %s\n", d.Actor, d.State, d.Holding)
	}
	if h.Hold.On {
		out += "everything is on hold, by " + h.Hold.By + "\n"
	}
	return out
}

func trueOf(all []string, one string) bool {
	for _, s := range all {
		if s == one {
			return true
		}
	}
	return false
}
