package main

import (
	"encoding/json"
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
type Hold struct {
	Session string `json:"session"`
	On      bool   `json:"on"`
	By      string `json:"by,omitempty"`
	At      string `json:"at,omitempty"`
	Says    string `json:"says,omitempty"`
}

func holdPath(r Roots) string { return r.Private("hold.json") }

func LoadHold(r Roots) Hold {
	var h Hold
	b, err := os.ReadFile(holdPath(r))
	if err != nil || json.Unmarshal(b, &h) != nil {
		return Hold{}
	}
	if !ofThisSession(r, h.Session) {
		return Hold{} // it belongs to a session that has ended, and off is the resting value
	}
	return h
}

// SetHold turns it on or off, and answers what it now is.
func SetHold(r Roots, on bool, by string) (Hold, error) {
	h := Hold{Session: currentSession(r), On: on}
	if on {
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
