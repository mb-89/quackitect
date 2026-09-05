package main

import "testing"

// A TEST THAT WANTS NO ENGINE IS TOLD SO, RATHER THAN LEFT TO FIND OUT.
//
// MEASURED. loadRunning reads engine.json twenty times, twenty five
// milliseconds apart, before it believes the file is not there. That loop is
// for the instant a replace leaves no file on disk. A tree that never had an
// engine meets the same loop, and pays half a second for an answer that was
// never in doubt.
//
// IT IS PAID PER CALL AND NOT PER TEST. TheRunNow asks on every NoteAgent and
// every NoteSession, and StaffingOf asks twice, so four tests in this suite
// spent between eight and fifteen seconds each waiting for a file nobody had
// written. The hotspot check found them and named the wait correctly as an
// external thing being driven for real.
//
// SO THE ANSWER IS FED. A record naming pid zero is read on the first try and
// is not an engine, which is the same answer the empty folder gives and the
// same one these tests want. Nothing about what they check moves.
//
// ONE TEST STILL DRIVES THE REAL THING, which is testing rule 13.
// TestANameAnotherSessionHoldsIsRefused is the one: it drives answerHook end
// to end, and it is the only one of the four that names the engine record at
// all. A suite where every test is fed has stopped checking the cold path.
func noEngineHere(t *testing.T, r Roots) {
	t.Helper()
	SayRunning(r, Running{})
}
