package main

import "strings"

// A PERSON'S WORD, WHEN IT IS THE WHOLE MESSAGE.
//
// In a cloud session what a person types is the only thing they have. The
// interrupt cancels the call that is running and writes nothing, so nothing
// outlives the turn it stopped and the next turn starts as though it never
// happened. That is not a fault in the interrupt. It is what an interrupt is.
//
// So the word is the grant, the same way the button is on a desktop. The hold
// answers to both, and everything downstream of the hold already works.
//
// A MESSAGE THAT IS ONE WORD IS NOT PROSE. "stop the engine" is an
// instruction about an engine and it is left alone. "stop" on its own is
// about the agent, because there is nothing else it could be about. The match
// is the whole message and never a word inside one, which is what keeps it
// from firing on a sentence that merely mentions stopping.

// Word is what a whole message asked for, when it asked for anything.
type Word int

const (
	NoWord Word = iota
	PutItDown
	PickItUp
)

var putItDown = []string{"stop", "halt", "hold", "stop it", "stop now"}
var pickItUp = []string{"go", "go on", "resume", "continue", "carry on", "unhold"}

// TheWord reads a whole message and says whether it was one. Anything longer
// than the phrases above is prose, and prose is not a command.
func TheWord(said string) Word {
	s := strings.ToLower(strings.TrimSpace(said))
	s = strings.TrimRight(s, ".!? ")
	s = strings.Join(strings.Fields(s), " ")
	if s == "" {
		return NoWord
	}
	for _, w := range putItDown {
		if s == w {
			return PutItDown
		}
	}
	for _, w := range pickItUp {
		if s == w {
			return PickItUp
		}
	}
	return NoWord
}
