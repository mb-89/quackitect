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

// A CONTROL LASTS THE SESSION IT WAS SET IN, AND ONE FUNCTION SAYS SO.
//
// The rung, the hold and the ask are all a person leaning on the engine for the
// thing in their hands. None of them is a parameter, so none of them should
// outlive the session that set it. Each is a file, because the guard is a fresh
// process per event and holds nothing between them, so the file has to say which
// session it belongs to and the read has to check.
//
// The store the hold register already uses is the shape: holds.json, grace.json,
// stops.json and owed.json each carry a session, and a store from a session that
// has ended is read as absent. A control left behind is not migrated and not
// warned about. It belongs to a session that has ended.
//
// A FILE WITH NO SESSION IS ANOTHER SESSION'S, which is the shape all three of
// these files had before, so the first read after the change drops what each was
// holding. That is the right answer for every control it could be holding.
// A CONTROL THAT CANNOT BE PLACED KEEPS WHAT A PERSON SET. The session name
// lives in the first record of the current log, and a rotation opens a fresh
// one that holds nothing until the next record lands. Through that window the
// log names no session, and comparing against the placeholder made every stored
// control another session's: the rung fell back to bound, the hold to off and
// the ask to nothing owed, with nobody having said so. The hold is the one that
// matters, because a guard is a fresh process per event, so a guard firing there
// read the hold as off and let through calls nobody had lifted it on.
//
// So a session that cannot be read decides nothing, and the control stands. Named
// says which answers are a session at all.
//
// A FILE WITH NO SESSION ON IT IS STILL ANOTHER SESSION'S, whichever way the log
// reads. That is the shape all three of these files had before the session was
// written on them, and the first read after that change has to drop what each was
// holding.
func ofThisSession(r Roots, session string) bool {
	if session == "" {
		return false
	}
	if now := currentSession(r); Named(now) {
		return session == now
	}
	return true
}

// TheBinding is how much of the engine is speaking to the agent.
type TheBinding string

const (
	// Bound is every rule on. It is what a fresh tree is and what a box with
	// nobody at it stays.
	Bound TheBinding = "bound"

	// Unbound is the QUEUE off and everything else on. The queue stops being
	// told what to hand out and nobody is made to spawn, so the agent picks its
	// own work. It still writes a token for that work, and every write and every
	// run still names one: a record with holes in it is not a procedure anybody
	// gets to drop. The voice rules, the schema's caps, the stale-write refusal,
	// answering the person and claiming a stop all stand as well.
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

// Binding is the state on disk, who took it there, and the session they took it
// there in. Session is what stops a rung outliving the person who set it: see
// ofThisSession above.
type Binding struct {
	At      TheBinding `json:"at"`
	By      string     `json:"by,omitempty"`
	Since   string     `json:"since,omitempty"`
	Says    string     `json:"says,omitempty"`
	Session string     `json:"session"`
}

func bindingPath(r Roots) string { return r.Private("binding.json") }

// THE RUNG IS THE ONE CONTROL ONLY A CLICK MAY END.
//
// MEASURED. A tree was put in god mode from the button and read as bound a
// moment later with nothing clicked. The rung is stamped with a session and the
// read drops a stamp that does not match, and the session it was stamped with
// was the ENGINE RUN. An engine start retires the log and opens a fresh one
// under a new run, so every restart, rebuild and crash read as a person leaving
// and put the guards back on somebody who had taken them off.
//
// THE PERSON'S SESSION IS THE HARNESS'S. The engine is restarted for its own
// reasons and the person is still sitting there, so the rung asks the harness
// which session it is in.
//
// AND WHERE THE LOG CANNOT SAY, THE RUNG STANDS. A retired log names no harness
// session until the harness writes one, and answering the engine run through
// that window is the defect itself. The hold and the ask keep the engine run,
// because neither has this ruling on it: what ends the rung is a click, and
// nothing else may.
func ofThisPersonsSession(r Roots, session string) bool {
	if session == "" {
		return false
	}
	if now := TheHarnessSession(r); Named(now) {
		return session == now
	}
	return true
}

// LoadBinding answers where this tree stands. Anything unreadable is bound,
// because the safe answer to not knowing is every rule on.
func LoadBinding(r Roots) Binding {
	var b Binding
	raw, err := os.ReadFile(bindingPath(r))
	if err != nil || json.Unmarshal(raw, &b) != nil {
		return Binding{At: Bound}
	}
	if !ofThisPersonsSession(r, b.Session) {
		return Binding{At: Bound} // the person who set it has left
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
	// THE STAMP IS THE PERSON'S SESSION, which is what the read compares
	// against. ArrivalSession is that with a fallback for a log that names no
	// harness session, so a rung set before the harness has spoken is still
	// stamped with something the read can hold.
	b := Binding{At: to, By: by, Since: time.Now().UTC().Format(time.RFC3339),
		Session: ArrivalSession(r)}
	switch to {
	case Unbound:
		b.Says = "A person took the queue off you. Nothing will ask you to spawn and the queue " +
			"will not choose your work, so work on what they asked for, including a token " +
			"nobody handed you. Write that token, and name it on every write and every run, " +
			"the way you would on any other. Do what they asked and nothing beside it."
	case God:
		b.Says = "A person turned the engine's refusals off, because something in the engine is " +
			"in the way. Nothing will stop you and nothing will check you. Do only what they " +
			"asked, say what you did, and tell them when they can put it back."
	default:
		// THE NAME STAYS ON THE WAY DOWN. Blanking it left a rung that had been
		// put back with nobody's name on it, so a drop could not be attributed
		// and only guessed at, which is the state this was measured in.
		b.At, b.Says = Bound, ""
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
//
// AND IT LASTS THE SESSION IT WAS PRESSED IN. A press is a person waiting for an
// answer, and the person waiting at six o'clock is not waiting the next morning.
// The file said when and by whom and nothing about which session, so the first
// thing a fresh agent was told was to answer a question nobody was still asking.
type AskedToSay struct {
	On      string `json:"on,omitempty"` // when it was pressed
	By      string `json:"by,omitempty"`
	Says    string `json:"says,omitempty"`
	Session string `json:"session"`
}

func askedPath(r Roots) string { return r.Private("asked.json") }

func LoadAsked(r Roots) AskedToSay {
	var a AskedToSay
	raw, err := os.ReadFile(askedPath(r))
	if err != nil || json.Unmarshal(raw, &a) != nil {
		return AskedToSay{}
	}
	if !ofThisSession(r, a.Session) {
		return AskedToSay{} // it belongs to a session that has ended, and nothing is owed
	}
	return a
}

// SetAsked raises the obligation, or discharges it.
func SetAsked(r Roots, on bool, by string) (AskedToSay, error) {
	a := AskedToSay{Session: currentSession(r)}
	if on {
		a.On = time.Now().UTC().Format(time.RFC3339)
		a.By = by
		a.Says = "The person asked what is happening. Answer with se_answer, before anything " +
			"else: what you are working on, and what every subagent you spawned is working on. " +
			"One message, and then carry on.\n\n" + theShellDoor("--answer \"...\"")
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

// ThePersonWasAnswered discharges the press, because the answer it asked for is
// now in the record.
//
// NOTHING DISCHARGED IT, AND THE PRESS REFUSES EVERY TOOL CALL. decidePreToolUse
// denies each one while this stands, letting only the answer through, and the
// answer cleared the other obligation and left this one. So a person who pressed
// the button got one answer and an agent refused for the rest of the session,
// however many times it answered, until they pressed again. The panel's button
// could never come up either, which is how it was found.
//
// IT IS NOT KEYED BY AGENT, and the obligation a prompt raises is. Two agents
// owe two answers to a question each was asked. This is one button a person
// pressed once, so the first answer settles it.
func ThePersonWasAnswered(r Roots) error {
	if !LoadAsked(r).Owed() {
		return nil
	}
	_, err := SetAsked(r, false, "")
	return err
}

func (a AskedToSay) String() string {
	if !a.Owed() {
		return ""
	}
	return fmt.Sprintf("asked at %s", a.On)
}
