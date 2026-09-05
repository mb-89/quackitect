package main

import (
	"fmt"
	"strings"
	"testing"
)

// THE FOUR SESSION-SCOPED STORES READ THE SESSION THE WAY THE CONTROLS DO.
//
// The rung, the hold and the ask learned it before these four: a log that names
// no session decides nothing, so the stored value stands. These four write the
// session on themselves and read it back with a bare comparison, so a rotation
// -- the full log set aside and a fresh current opened, empty until the next
// record lands -- read every one of them as a session that has ended, with
// nobody having said so.
//
// They are driven through one loop because it is one rule, and a store taught it
// in isolation is the half of a mechanism that ships without the other.

// aSessionStore is one of the four: how it is written, what it answers, and
// what it answers once the session that wrote it has ended.
type aSessionStore struct {
	name  string
	write func(*testing.T, Roots)
	reads func(Roots) string
	wrote string // what it answers while it still holds what was written
	rests string // what it answers in a session that has ended
}

const anActor = "worker-a"

func theFourSessionStores() []aSessionStore {
	return []aSessionStore{
		{"the refusal counts",
			func(t *testing.T, r Roots) { countRefusedStop(r, anActor) },
			func(r Roots) string { return fmt.Sprint(loadStops(r).Count[anActor]) },
			"1", "0"},
		{"the answers owed",
			func(t *testing.T, r Roots) {
				if err := TheyAsked(r, anActor, "what is happening"); err != nil {
					t.Fatal(err)
				}
			},
			func(r Roots) string { return strings.Join(loadOwed(r)[anActor], " ") },
			"what is happening", ""},
		{"the grace",
			func(t *testing.T, r Roots) { countGrace(r, anActor) },
			func(r Roots) string { return fmt.Sprint(loadGrace(r).Seen[anActor]) },
			"1", "0"},
		{"the hold register",
			func(t *testing.T, r Roots) {
				if err := recordHold(r, "wk-held", anActor); err != nil {
					t.Fatal(err)
				}
			},
			func(r Roots) string { return HeldBy(r, "wk-held") },
			anActor, ""},
	}
}

// A ROTATION DOES NOT EMPTY ANY OF THE FOUR. Through that window the log names
// nobody, and a session that cannot be read decides nothing.
func TestARotationDoesNotEmptyTheFourStores(t *testing.T) {
	t.Parallel()
	for _, s := range theFourSessionStores() {
		r := aTreeToWriteIn(t)
		theSessionNowIs(t, r, "20260904-090000")
		s.write(t, r)
		// The half that has to keep working: in the session that wrote it, the
		// store answers what was written.
		if got := s.reads(r); got != s.wrote {
			t.Fatalf("%s answers %q in the session that wrote it, and this test would prove nothing", s.name, got)
		}
		theRotationWindow(t, r)
		// The premise: through this window the log names no session.
		if now := currentSession(r); Named(now) {
			t.Fatalf("the log names the session %q, so this test is not in the window it means to be", now)
		}
		if got := s.reads(r); got != s.wrote {
			t.Errorf("%s answers %q while the log names no session, and %q was written in it",
				s.name, got, s.wrote)
		}
	}
}

// AND EACH IS STILL ABSENT IN A SESSION THAT HAS ENDED. That half is the reason
// the session is written on these files at all, and it keeps working.
func TestTheFourStoresEndWithTheirSession(t *testing.T) {
	t.Parallel()
	for _, s := range theFourSessionStores() {
		r := aTreeToWriteIn(t)
		theSessionNowIs(t, r, "20260904-090000")
		s.write(t, r)
		if got := s.reads(r); got != s.wrote {
			t.Fatalf("%s answers %q in the session that wrote it, and this test would prove nothing", s.name, got)
		}
		// The session ends and another starts.
		theSessionNowIs(t, r, "20260905-100000")
		if got := s.reads(r); got != s.rests {
			t.Errorf("%s answers %q a session later, and %q is its resting value", s.name, got, s.rests)
		}
	}
}
