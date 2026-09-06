package main

import theHold "quackitect/engine/internal/hold"

// THE HOLD, AS THIS PACKAGE SEES IT. What it is and why it is a word rather
// than a switch is [[quackitect/engine/internal/hold]].
//
// THE SESSION IS DECIDED HERE, because ofThisSession is this package's. A hold
// belongs to the session it was put on in, so one a person put on and went home
// under does not refuse an agent the next morning.

type Hold = theHold.Of

const (
	HoldOff       = theHold.Off
	HoldFinishing = theHold.Finishing
	HoldHeld      = theHold.Held
)

// HoldStates is the order, so a check walks this list rather than one typed
// out beside it.
func HoldStates() []string { return theHold.States() }

func holdPath(r Roots) string { return r.Private("hold.json") }

func LoadHold(r Roots) Hold {
	h := theHold.Load(holdPath(r))
	if !ofThisSession(r, h.Session) {
		return Hold{State: HoldOff} // it belongs to a session that ended
	}
	return h
}

// SetHold writes the state, and answers what it now is.
func SetHold(r Roots, state, by string) (Hold, error) {
	return theHold.Set(holdPath(r), currentSession(r), state, by)
}
