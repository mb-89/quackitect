// Package keyword is how a person reaches a control with no panel to press.
//
// The cloud has no panel. The only surface a person has on a box they are not
// sitting at is the chat, so nothing the sidebar offers can be reached there.
//
// THE MESSAGE IS KEYWORD:NAME=VALUE AND NOTHING ELSE. The prefix is what makes
// a message one, and the whole trimmed message has to be it. A mention inside a
// sentence is not one, so the guidance describing these words does not fire
// them when somebody quotes it, and a person can talk about UNBIND without
// unbinding anything.
//
// THE ENGINE OWNS THE WORD AND NOBODY WRITES ONE. A control says it is
// reachable from a console, and the word is that control's own name in
// capitals. So the word and the control cannot differ by a character, and a
// rename carries the word with it. A list typed somewhere else would go stale
// the first time a control moved, and a person would be reading a word that
// reaches nothing.
//
// A GESTURE HAS NO NODE OF ITS OWN, so its word is the last segment of the
// command it runs. quackitect.god is GOD. That is derived the same way and from
// the same declaration, so it carries a rename too.
//
// EVERY WORD IS POSITIVE AND TAKES ON OR OFF. The word names the rung and the
// value says whether to stand on it. GOD=OFF is how you leave god mode, and it
// lands where the button lands, which is bound. Nobody has to know the name of
// the state they are falling back to.
//
// NOTHING IS RELAYED BY THE AGENT. The engine matches on the two routes the
// harness feeds: the prompt that starts a turn, and the transcript copy for a
// message written into a turn already running. The said verb is the agent's own
// door into the record and does not match. So an agent cannot forge one, and no
// guard has to be written to stop it trying.
//
// WHAT MATCHED AND WHAT IT MOVED GOES IN THE RECORD, so a change nobody
// expected is attributed rather than guessed at. A move the method's floor
// refuses is recorded too, with the reason, because a person who typed a word
// and saw nothing happen is owed the answer.
package keyword

import "strings"

// Prefix is what every message begins with, and it is the whole of what makes
// one.
const Prefix = "KEYWORD:"

// On and Off are what a rung takes. They are the only two values a move reads.
const (
	On  = "ON"
	Off = "OFF"
)

// For answers the word that names a control: the control's own name, in
// capitals. Nobody writes one down, so a rename carries the word with it.
func For(name string) string { return strings.ToUpper(strings.TrimSpace(name)) }

// FromCommand answers the word for a gesture, which has no node of its own. It
// is the last segment of the command the gesture runs, so quackitect.god is
// GOD, and it is derived from the same declaration as everything else.
func FromCommand(command string) string {
	if i := strings.LastIndex(command, "."); i >= 0 {
		command = command[i+1:]
	}
	return For(command)
}

// Line writes one message out, the way a person types it and the way the
// tooltip draws it. Both halves come from here, so the line a person reads is
// the exact string the matcher takes.
func Line(word, value string) string {
	if value == "" {
		return Prefix + word
	}
	return Prefix + word + "=" + value
}

// Said is a message a person typed, split into the control it names and the
// value it carries.
type Said struct {
	Word  string // the control's name, in capitals
	Value string // what followed the equals sign, as typed
	Given bool   // whether there was an equals sign at all
}

// Parse answers what a message named, and whether it named anything. Almost
// every message names nothing.
//
// THE NAME HALF CARRIES NO SPACE, which is what keeps a sentence beginning with
// the prefix from matching. The value half may carry any, because a token minted
// from a chat is a title and a detail.
func Parse(said string) (Said, bool) {
	m := strings.TrimSpace(said)
	if len(m) < len(Prefix) || !strings.EqualFold(m[:len(Prefix)], Prefix) {
		return Said{}, false
	}
	word, value, given := strings.Cut(strings.TrimSpace(m[len(Prefix):]), "=")
	word = For(word)
	if word == "" || strings.ContainsAny(word, " \t\r\n") {
		return Said{}, false
	}
	return Said{Word: word, Value: strings.TrimSpace(value), Given: given}, true
}

// IsOn reads the value half of a rung. A value that is neither is not one, and
// the caller says so rather than guessing which was meant.
func IsOn(value string) (bool, bool) {
	switch strings.ToUpper(strings.TrimSpace(value)) {
	case On:
		return true, true
	case Off:
		return false, true
	}
	return false, false
}

// OnOrOff says what a control now is, for the person who typed the word.
func OnOrOff(on bool) string {
	if on {
		return "on"
	}
	return "off"
}
