package main

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
)

// UNBINDING. A person takes the engine's rules off the agent, in two steps.
//
// THE OWNER'S ASK: sometimes I want to work on one specific thing, and the
// queue rules have to be switched off for that. And sometimes something in the
// engine is broken and I want to override it.
//
// Those are two different asks and they are one ladder, because the second is
// the first plus more. A mode that could remove the guards without removing the
// process would be a third thing nobody asked for.
//
// BOUND IS THE RESTING STATE, AND THE BUTTON IS HOW YOU LEAVE IT. The owner
// ruled it this way round rather than opting in: the button is on the panel, in
// front of a person, and a cloud box has nobody to press it. So a box with no
// person is bound, which is where the queue and the guards are wanted most.
//
// IT IS A FILE, the way the hold is, so it survives an editor reload and every
// process that reads it. The guard is a fresh process per event and holds
// nothing between them.
//
// IT DOES NOT EXPIRE. Emergency mode in this tree ends on a clock, at thirty
// minutes, because nothing said it was on. This says it: an orange block in the
// status bar for as long as it is armed, which the editor draws whether or not
// the panel is open, and pressing that block puts it back. The owner weighed a
// timer against a thing you cannot miss and took the second.

// TheBinding is how much of the engine is speaking to the agent.
type TheBinding string

const (
	// Bound is every rule on. It is what a fresh tree is and what a box with
	// nobody at it stays.
	Bound TheBinding = "bound"

	// Unbound is the PROCESS off and the SAFETY on. No token is needed to
	// write or to run a command, the queue stops being told what to hand out,
	// and nobody is made to spawn. The record, the voice rules, the schema's
	// caps, the stale-write refusal, answering the person and claiming a stop
	// all stand: those protect the tree and the person, not the procedure.
	Unbound TheBinding = "unbound"

	// God is every refusal off, including the ones that protect the tree. It
	// is for a broken engine, and it is the one state this program has where
	// it stops arguing with whoever is holding it.
	//
	// NOTHING IS SAID WHEN A GUARD WOULD HAVE REFUSED. Turning every refusal
	// into a warning was weighed and dropped: the whole point is to work
	// without the engine in the way, and a log of everything it would have
	// said is the engine in the way with extra steps.
	God TheBinding = "god"
)

// Binding is the state on disk, and who took it there.
type Binding struct {
	At    TheBinding `json:"at"`
	By    string     `json:"by,omitempty"`
	Since string     `json:"since,omitempty"`
	Says  string     `json:"says,omitempty"`
}

func bindingPath(r Roots) string { return r.Private("binding.json") }

// LoadBinding answers where this tree stands. Anything unreadable is bound,
// because the safe answer to not knowing is every rule on.
func LoadBinding(r Roots) Binding {
	var b Binding
	raw, err := os.ReadFile(bindingPath(r))
	if err != nil || json.Unmarshal(raw, &b) != nil {
		return Binding{At: Bound}
	}
	switch b.At {
	case Unbound, God:
		return b
	}
	return Binding{At: Bound}
}

// Unleashed answers whether the process rules are off, which God also is.
func Unleashed(r Roots) bool {
	at := LoadBinding(r).At
	return at == Unbound || at == God
}

// NoGuardsAtAll answers whether every refusal is off.
func NoGuardsAtAll(r Roots) bool { return LoadBinding(r).At == God }

// SetBinding moves the tree to a rung and answers where it now is.
func SetBinding(r Roots, to TheBinding, by string) (Binding, error) {
	b := Binding{At: to, By: by, Since: time.Now().UTC().Format(time.RFC3339)}
	switch to {
	case Unbound:
		b.Says = "A person took the queue off you. You need no token to write or to run a " +
			"command, nothing will ask you to spawn, and the queue will not choose your work. " +
			"Do what they asked and nothing beside it. Everything that protects the tree still stands."
	case God:
		b.Says = "A person turned the engine's refusals off, because something in the engine is " +
			"in the way. Nothing will stop you and nothing will check you. Do only what they " +
			"asked, say what you did, and tell them when they can put it back."
	default:
		b.At, b.By, b.Says = Bound, "", ""
	}
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return b, err
	}
	raw, err := json.MarshalIndent(b, "", "  ")
	if err != nil {
		return b, err
	}
	return b, writeAtomic(bindingPath(r), append(raw, '\n'), 0o644)
}

// Describe says the state in a person's words, for the status bar and the log.
func (b Binding) Describe() string {
	switch b.At {
	case Unbound:
		return "the queue is off"
	case God:
		return "engine controls disabled"
	}
	return ""
}

// TheRungBelow is what one press takes it to from here, so the button does not
// have to know the ladder. Pressing it while unbound puts it back rather than
// climbing: climbing is the five-press gesture and nothing else.
func TheRungBelow(at TheBinding) TheBinding {
	if at == Bound {
		return Unbound
	}
	return Bound
}

// AskedToSay is the person pressing ask: the engine owes them an update, and
// every call is refused until one lands.
//
// IT IS THE ANSWER-FIRST MACHINERY WITH A PERSON'S FINGER ON IT. The engine
// already refuses every call while somebody is waiting to be answered, and
// works out that somebody is waiting by reading the transcript. This is the
// same obligation, raised by a button instead of by a sentence, so an owner who
// wants to know what is happening does not have to type a question and wait for
// the reading to notice it.
type AskedToSay struct {
	On    string `json:"on,omitempty"` // when it was pressed
	By    string `json:"by,omitempty"`
	Says  string `json:"says,omitempty"`
}

func askedPath(r Roots) string { return r.Private("asked.json") }

func LoadAsked(r Roots) AskedToSay {
	var a AskedToSay
	raw, err := os.ReadFile(askedPath(r))
	if err != nil || json.Unmarshal(raw, &a) != nil {
		return AskedToSay{}
	}
	return a
}

// SetAsked raises the obligation, or discharges it.
func SetAsked(r Roots, on bool, by string) (AskedToSay, error) {
	var a AskedToSay
	if on {
		a.On = time.Now().UTC().Format(time.RFC3339)
		a.By = by
		a.Says = "The person asked what is happening. Answer with se_answer, before anything " +
			"else: what you are working on, and what every subagent you spawned is working on. " +
			"One message, and then carry on."
	}
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return a, err
	}
	raw, err := json.MarshalIndent(a, "", "  ")
	if err != nil {
		return a, err
	}
	return a, writeAtomic(askedPath(r), append(raw, '\n'), 0o644)
}

// Owed answers whether an update is still owed.
func (a AskedToSay) Owed() bool { return a.On != "" }

func (a AskedToSay) String() string {
	if !a.Owed() {
		return ""
	}
	return fmt.Sprintf("asked at %s", a.On)
}
