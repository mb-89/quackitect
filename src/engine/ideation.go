package main

import (
	"encoding/json"
	"os"
	"time"
)

// IDEATION IS A FLAG THE ENGINE HOLDS, BEFORE ANYTHING READS IT.
//
// THE OWNER'S WORDS: it is okay if it does not do anything yet, but the engine
// needs to understand that it is an ideation mode. We use that flag later, but
// it should trigger it.
//
// IT LIVED IN THE EXTENSION AND NOWHERE ELSE. A variable in a window is gone on
// reload, and a box with no window has no variable at all, so the button was the
// only way in and a cloud box had none. A word moving that would have drawn a
// line and moved nothing.
//
// ONE DOOR, TWO ADAPTERS. This is the door. The button presses it through the
// command line and a chat message presses it through the keyword, the same way
// the hold and the binding are pressed by both. Neither adapter keeps a state of
// its own, because two states for one fact is two facts that disagree.
//
// IT LASTS THE SESSION IT WAS TURNED ON IN, the way the ask does. Ideation is a
// person letting an agent put its own ideas in for a while, not a setting of the
// tree, so it does not greet a fresh agent the next morning.
//
// NOTHING READS IT YET, and that is on purpose. The transport lands first and
// the behaviour is filled in against a flag that already travels.
type Ideating struct {
	On      string `json:"on,omitempty"` // when it was turned on
	By      string `json:"by,omitempty"`
	Says    string `json:"says,omitempty"`
	Session string `json:"session"`
}

func ideationPath(r Roots) string { return r.Private("ideation.json") }

func LoadIdeation(r Roots) Ideating {
	var i Ideating
	raw, err := os.ReadFile(ideationPath(r))
	if err != nil || json.Unmarshal(raw, &i) != nil {
		return Ideating{}
	}
	if !ofThisSession(r, i.Session) {
		return Ideating{} // it belongs to a session that has ended
	}
	return i
}

// SetIdeation turns it on, or off.
func SetIdeation(r Roots, on bool, by string) (Ideating, error) {
	i := Ideating{Session: currentSession(r)}
	if on {
		i.On = time.Now().UTC().Format(time.RFC3339)
		i.By = by
		i.Says = "A person let you put your own ideas in, rather than working only the tokens " +
			"you are handed. Mint what you see worth minting, and name it the way you would " +
			"any other token."
	}
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return i, err
	}
	raw, err := json.MarshalIndent(i, "", "  ")
	if err != nil {
		return i, err
	}
	return i, writeAtomic(ideationPath(r), append(raw, '\n'), 0o644)
}

// IsOn answers whether an agent may put its own ideas in.
func (i Ideating) IsOn() bool { return i.On != "" }
