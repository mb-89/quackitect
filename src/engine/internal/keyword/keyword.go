// Package keyword is how a person reaches a control with no panel to press.
//
// The cloud has no panel. The only surface a person has on a box they are not
// sitting at is the chat, so nothing the sidebar offers can be reached there.
//
// THE ENGINE OWNS THE WORD AND NOBODY WRITES ONE. A control says it is
// reachable from a console, and the word is that control's own name. So the
// word and the control cannot differ by a character, and a rename carries the
// word with it. A list typed somewhere else would go stale the first time a
// control moved, and a person would be reading a word that reaches nothing.
//
// THE WHOLE TRIMMED MESSAGE HAS TO BE THE WORD. A mention inside a sentence is
// not one. That is what keeps the guidance describing these words from firing
// them when somebody quotes it.
//
// A WORD IS ONE WORD AND CARRIES NO VALUE, so only a bool is reachable this
// way. A number or a string needs a person to say which one, and a message
// carrying that is a sentence rather than a word.
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

// Of is one control a console can reach.
type Of struct {
	Word string `json:"word"`
	Key  string `json:"key"`
	Says string `json:"says,omitempty"`
}

// For answers the word that reaches a control of this name. An underscore is
// how a key is spelled and a space is how a person types it.
func For(name string) string { return strings.ReplaceAll(name, "_", " ") }

// Match answers the control a message named, and whether it named one. Almost
// every message names none.
func Match(said string, have []Of) (Of, bool) {
	want := strings.ToLower(strings.TrimSpace(said))
	if want == "" {
		return Of{}, false
	}
	for _, k := range have {
		if k.Word == want {
			return k, true
		}
	}
	return Of{}, false
}

// OnOrOff says what a control now is, for the person who typed the word.
func OnOrOff(on bool) string {
	if on {
		return "on"
	}
	return "off"
}
