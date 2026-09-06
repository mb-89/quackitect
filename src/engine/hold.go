package main

import (
	"encoding/json"
	"errors"
	"os"
	"time"
)

// THE HOLD. A person puts everything down.
//
// While it is on, every call the agent makes is refused and the only thing it
// can do is stop. It needs no claim: the button is the grant, and asking an
// agent to name a reason for a hold a person put on is asking it to explain
// somebody else's decision.
//
// IT IS A FILE, so it survives an editor reload and every process that reads
// it. The guard is a fresh process per event and holds nothing between them.
//
// AND IT LASTS THE SESSION IT WAS PUT ON IN. The file said who and when and
// nothing about which session, so a hold a person put on and went home under was
// still on the next morning, refusing every call an agent made with nobody there
// to lift it. Session is what says whose it is: see ofThisSession in unbound.go.
// AND IT IS A WORD, NOT A SWITCH. A boolean is one degree where the owner
// wants two: one press finishes up, and five presses hold.
const (
	HoldOff       = "off"
	HoldFinishing = "finishing"
	HoldHeld      = "held"
)

// HoldStates is the order, so a check walks this list rather than one typed
// out beside it.
func HoldStates() []string { return []string{HoldOff, HoldFinishing, HoldHeld} }

type Hold struct {
	Session string `json:"session"`
	State   string `json:"state"`

	// On is held, and it stays because a reader written before the word is
	// still watching for it.
	On   bool   `json:"on"`
	By   string `json:"by,omitempty"`
	At   string `json:"at,omitempty"`
	Says string `json:"says,omitempty"`
}

func (h Hold) Held() bool      { return h.State == HoldHeld }
func (h Hold) Finishing() bool { return h.State == HoldFinishing }

func holdPath(r Roots) string { return r.Private("hold.json") }

func LoadHold(r Roots) Hold {
	var h Hold
	b, err := os.ReadFile(holdPath(r))
	if err != nil || json.Unmarshal(b, &h) != nil {
		return Hold{}
	}
	if !ofThisSession(r, h.Session) {
		return Hold{State: HoldOff} // it belongs to a session that ended, and off is the resting value
	}
	if h.State == "" {
		// A FILE WRITTEN BEFORE THE WORD carries the boolean and nothing else.
		h.State = HoldOff
		if h.On {
			h.State = HoldHeld
		}
	}
	return h
}

// SetHold turns it on or off, and answers what it now is.
func SetHold(r Roots, state, by string) (Hold, error) {
	switch state {
	case HoldOff, HoldFinishing, HoldHeld:
	default:
		return Hold{}, errors.New("a hold is off, finishing or held, and not " + state)
	}
	h := Hold{Session: currentSession(r), State: state, On: state == HoldHeld}
	if h.On {
		h.By = by
		h.At = time.Now().UTC().Format(time.RFC3339)
		h.Says = "A person put everything on hold. Stop your turn. " +
			"Say what you were doing and that you have stopped, and do nothing else. " +
			"The hold lifts when they lift it."
	}
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return h, err
	}
	b, err := json.MarshalIndent(h, "", "  ")
	if err != nil {
		return h, err
	}
	return h, writeAtomic(holdPath(r), append(b, '\n'), 0o644)
}
