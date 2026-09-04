package main

import (
	"fmt"
	"sort"
	"time"
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

	// WHAT KIND OF AGENT IT IS, session or the type the harness spawned it
	// as, and WHEN IT ARRIVED. Both are the register's, so they are empty on
	// a row built for an actor that pulled without ever being registered.
	Kind  string `json:"kind,omitempty"`
	Since string `json:"since,omitempty"`
}

// Happening is the whole answer.
//
// THE HOLD IS ONCE FOR THE TREE AND NEVER PER ACTOR. It is one file covering
// everything, so drawing it beside each row would say four agents are held when
// one file is.
type Happening struct {
	Actors []Doing `json:"actors"`
	Hold   Hold    `json:"hold"`

	// WHO IS HERE, which is not who has worked. Actors is what a person can
	// act on and it is drawn in the header; this is the register, and it
	// holds an agent that has arrived and pulled nothing yet.
	Present []Doing `json:"present"`
}

// WhatIsHappening answers one row per actor that is working or stopped.
//
// A WAITING ACTOR WITH NOTHING IN HAND HAS NO ROW. Its row says only that it
// once pulled, and the owner read four of those in the header as nonsense.
// The header is for what a person can act on: a hold, a stop, a token in hand.
func WhatIsHappening(r Roots) Happening {
	out := Happening{Actors: []Doing{}, Hold: LoadHold(r), Present: AgentsPresent(r)}
	all := Tokens(r)
	for _, actor := range ActorsThatPulled(r) {
		d := doingOf(r, all, actor)
		if d.State == Waiting {
			continue
		}
		out.Actors = append(out.Actors, d)
	}
	// AN ACTOR AT WORK IS PRESENT, WHETHER OR NOT THE HARNESS SAID SO.
	//
	// The register knows who the harness announced; the hold knows who is
	// working. They are usually the same, and where they are not it is the
	// second that matters to a person. The panel draws the table and nothing
	// else now, so an actor missing from it is an actor nobody can see.
	for _, d := range out.Actors {
		known := false
		for _, p := range out.Present {
			if p.Actor == d.Actor {
				known = true
				break
			}
		}
		if !known {
			out.Present = append(out.Present, d)
		}
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

// AgentsPresent answers one row per agent that has arrived and not gone, in
// the order they arrived.
//
// THE HARNESS SAYS WHO IS HERE AND THE ENGINE WRITES IT DOWN. SessionStart
// and SubagentStart bring one in, SessionEnd and SubagentStop take one out,
// and all four already reach this engine. Nothing is guessed from a process
// list and nothing is declared by the agent itself.
//
// A REGISTER OUTLIVES THE RUN THAT FILLED IT, so only this run's agents are
// here. A row left by a session that died without saying so is not drawn,
// the same way an actor that pulled in an earlier session is not.
func AgentsPresent(r Roots) []Doing {
	session := TheRunNow(r)
	if !Named(session) {
		return []Doing{}
	}
	here := []Agent{}
	for _, a := range LoadEvidence(r).Agents {
		if a.Run == session && a.Gone.IsZero() {
			here = append(here, a)
		}
	}
	sort.Slice(here, func(i, j int) bool { return here[i].First.Before(here[j].First) })
	all := Tokens(r)
	aliases := TheNamesItPullsWith(r)
	out := make([]Doing, 0, len(here))
	for _, a := range here {
		// THE NAME IT PULLS WITH IS THE NAME THAT HOLDS THE TOKEN. The
		// register knows an agent by the harness's name, and the gate wrote
		// down which name that one answers to when it pulled. The row is
		// drawn under the pulling name, which is the header's name too, so
		// the two agree.
		names := append([]string{a.Name}, aliases[a.Name]...)
		if id := harnessIDOf(r, a); id != "" {
			names = append(names, aliases[id]...)
		}
		// THE LAST NAME IT PULLED WITH IS THE NAME THE RECORD USES, and the
		// header draws that one, so the table does too. Its state and what
		// it holds come from whichever of its names is not merely waiting.
		d := doingOf(r, all, names[len(names)-1])
		for _, n := range names {
			if other := doingOf(r, all, n); other.State != Waiting {
				other.Actor = names[len(names)-1]
				d = other
				break
			}
		}
		d.Kind, d.Since = a.Kind, a.First.Format(time.RFC3339)
		out = append(out, d)
	}
	return out
}

// harnessIDOf answers the identity the harness knows an agent by, which is
// the key its aliases were written under.
func harnessIDOf(r Roots, a Agent) string {
	for id, known := range LoadEvidence(r).Agents {
		if known.Name == a.Name && known.First.Equal(a.First) {
			return id
		}
	}
	return ""
}
