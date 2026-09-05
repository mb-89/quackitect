package main

import (
	"net"
)

// THE ENGINE SAYS WHETHER THE GUARD IS LIVE, AND IT SAYS IT AT THE START.
//
// A session ran a whole day with nothing guarding it. The harness root sat
// above the repository, so the settings file was never read and no hook ever
// fired. Every rule built that day was enforced against nobody, and the record
// of it belonged to another session.
//
// THE FAILURE IS SILENT BY CONSTRUCTION. From inside, a guard that allowed
// every call and a guard that never ran look the same: nothing is refused
// either way. Nobody can be asked to notice an absence, so the engine says it.
//
// IT IS THE DOOR AND NOT THE HARNESS. What this can prove is that the port the
// cage names is held by this engine. Whether the harness posts to it is the
// harness's own, and a call that arrives is what says that: the record then
// carries hook events. So the line says the door is open, which is the half
// that was missing.

// holdTheDoor takes the guard's port and answers the listener, the line to say
// about it, and whether the guard is live. A port it cannot take is the
// unguarded case, and the line says so in words nobody reads past.
func holdTheDoor(r Roots) (net.Listener, string, bool) {
	ln, err := listenHooks(r)
	if err != nil {
		return nil, "THE GUARD IS NOT LIVE. Nothing refuses a call while its door at " +
			hooksURL(r) + " is held by something else: " + err.Error(), false
	}
	return ln, "the guard is live, and every tool call comes through its door at " + hooksURL(r), true
}

// SayTheDoor writes that line into the record, so a reader who was not
// watching the start can still tell which session it was.
//
// THE FLAG IS BESIDE THE SENTENCE because a check asks a field and a person
// reads a line, and the two must not be able to disagree.
func SayTheDoor(log *Log, live bool, line string) {
	ok := Yes()
	if !live {
		ok = No()
	}
	log.Write("engine", "guard", "engine", line, ok, map[string]any{"guarded": live})
}
