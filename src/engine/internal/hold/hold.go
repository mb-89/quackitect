// Package hold is the person putting everything down, and picking it up again.
//
// While it is held, every call the agent makes is refused and the only thing it
// can do is stop. It needs no claim: the button is the grant, and asking an
// agent to name a reason for a hold a person put on is asking it to explain
// somebody else's decision.
//
// IT IS A FILE, so it survives an editor reload and every process that reads
// it. The guard is a fresh process per event and holds nothing between them.
//
// AND IT LASTS THE SESSION IT WAS PUT ON IN. The file said who and when and
// nothing about which session, so a hold a person put on and went home under
// was still on the next morning, refusing every call an agent made with nobody
// there to lift it. Session says whose it is, and the caller decides whether
// the session on the file is this one.
//
// AND IT IS A WORD, NOT A SWITCH. A boolean is one degree where the owner wants
// two. One press finishes up, so no tracked token goes out and none may be
// taken up, while an agent finishes what it holds and works its notes. Five
// presses hold, which is what the boolean did.
package hold

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"time"
)

const (
	Off       = "off"
	Finishing = "finishing"
	Held      = "held"
)

// States is the order, so a check walks this list rather than one typed out
// beside it.
func States() []string { return []string{Off, Finishing, Held} }

// Of is what the file carries.
type Of struct {
	Session string `json:"session"`
	State   string `json:"state"`

	// On is held, and it stays because a reader written before the word is
	// still watching for it.
	On   bool   `json:"on"`
	By   string `json:"by,omitempty"`
	At   string `json:"at,omitempty"`
	Says string `json:"says,omitempty"`
}

func (h Of) Held() bool      { return h.State == Held }
func (h Of) Finishing() bool { return h.State == Finishing }

// Load reads the file. Anything unreadable is off, the resting value.
func Load(file string) Of {
	var h Of
	b, err := os.ReadFile(file)
	if err != nil || json.Unmarshal(b, &h) != nil {
		return Of{State: Off}
	}
	if h.State == "" {
		// A FILE WRITTEN BEFORE THE WORD carries the boolean and nothing else.
		h.State = Off
		if h.On {
			h.State = Held
		}
	}
	return h
}

// Set writes the state, and answers what it now is. A word nobody declared is
// refused rather than written, because a door reading it would not know it.
func Set(file, session, state, by string) (Of, error) {
	switch state {
	case Off, Finishing, Held:
	default:
		return Of{}, errors.New("a hold is off, finishing or held, and not " + state)
	}
	h := Of{Session: session, State: state, On: state == Held}
	switch state {
	case Held:
		h.By, h.At = by, time.Now().UTC().Format(time.RFC3339)
		h.Says = "A person put everything on hold. Stop your turn. " +
			"Say what you were doing and that you have stopped, and do nothing else. " +
			"The hold lifts when they lift it."
	case Finishing:
		h.By, h.At = by, time.Now().UTC().Format(time.RFC3339)
		h.Says = "A person asked you to finish up. Take up nothing new. " +
			"Finish what you hold, work every note you have, and then stop."
	}
	if err := os.MkdirAll(filepath.Dir(file), 0o755); err != nil {
		return h, err
	}
	b, err := json.MarshalIndent(h, "", "  ")
	if err != nil {
		return h, err
	}
	return h, os.WriteFile(file, append(b, '\n'), 0o644)
}
