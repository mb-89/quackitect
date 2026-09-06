package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// A CONTROL A PERSON REACHES FOR LASTS THE SESSION THEY ARE IN.
//
// The rung, the hold and the ask are the three of them. None is a parameter
// somebody sets once and means for ever: each is a person leaning on the engine
// for the thing in their hands. They were files with no session on them, so a
// tree unbound yesterday was unbound today, and god came back armed with nobody
// having said so.
//
// Session scoping was already built and load-bearing here: holds.json,
// grace.json, stops.json and owed.json each carry a session, and a store from a
// session that has ended is read as absent. These three join them, and one
// function answers the question for all of them.

// theSessionNowIs ends whatever session this tree was in and puts it in the one
// named, the way closing the editor and opening it again does.
//
// IT WRITES BOTH RECORDS, because a person arriving is both. The engine start
// names the run, which is where currentSession reads it. The session record is
// what the harness writes on SessionStart, and it names the person's session,
// which is where TheHarnessSession reads it. Writing only the first is an
// ENGINE RESTART with the same person still sitting there, and that is a
// different event: see godmodestands_test.go, which drives it.
func theSessionNowIs(t *testing.T, r Roots, name string) {
	t.Helper()
	dir := r.Private("log")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	start, err := json.Marshal(Record{Session: name, Src: "engine", Kind: "start",
		Actor: "engine", Msg: "engine started"})
	if err != nil {
		t.Fatal(err)
	}
	arrived, err := json.Marshal(Record{Session: name, Src: "agent", Kind: "session",
		Actor: "main", Msg: "session started, startup",
		Data: map[string]any{"source": "startup", "session": name}})
	if err != nil {
		t.Fatal(err)
	}
	both := append(append(start, '\n'), append(arrived, '\n')...)
	if err := os.WriteFile(filepath.Join(dir, Current), both, 0o644); err != nil {
		t.Fatal(err)
	}
	if got := currentSession(r); got != name {
		t.Fatalf("the tree reads its run as %q and the test put it in %q", got, name)
	}
	if got := TheHarnessSession(r); got != name {
		t.Fatalf("the tree reads the person's session as %q and the test put it in %q", got, name)
	}
}

// EACH CONTROL IS ON FOR THE SESSION THAT SET IT AND OFF IN THE NEXT ONE.
//
// The three are driven through the one loop, because the rule is one rule and a
// control taught it in isolation is the half of a mechanism that ships without
// the other.
func TestAControlDoesNotOutliveTheSessionThatSetIt(t *testing.T) {
	t.Parallel()
	for _, c := range []struct {
		name string
		set  func(Roots) error
		on   func(Roots) bool
		says string
	}{
		{"the rung", func(r Roots) error { _, err := SetBinding(r, God, "the owner"); return err },
			func(r Roots) bool { return LoadBinding(r).At != Bound },
			"god came back armed with nobody having said so"},
		{"the hold", func(r Roots) error { _, err := SetHold(r, HoldHeld, "the owner"); return err },
			func(r Roots) bool { return LoadHold(r).On },
			"a hold put on yesterday is still on"},
		{"the ask", func(r Roots) error { _, err := SetAsked(r, true, "the owner"); return err },
			func(r Roots) bool { return LoadAsked(r).Owed() },
			"an update is owed to a press from a session that has ended"},
	} {
		r := aTreeToWriteIn(t)
		theSessionNowIs(t, r, "20260904-090000")
		if err := c.set(r); err != nil {
			t.Fatal(err)
		}
		// The half that has to keep working: within the session that set it,
		// the control is on.
		if !c.on(r) {
			t.Fatalf("%s reads as off in the session that set it, and this test would prove nothing", c.name)
		}
		// The session ends and another starts.
		theSessionNowIs(t, r, "20260905-100000")
		if c.on(r) {
			t.Errorf("%s is still on a session later: %s", c.name, c.says)
		}
	}
}

// AND THE RESTING VALUE IS WHAT A FRESH TREE IS. Reading the control back in
// the next session answers bound, hold off, nothing owed, which is what a box
// with nobody at it stays.
func TestTheNextSessionReadsTheRestingValue(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	theSessionNowIs(t, r, "20260904-090000")
	if _, err := SetBinding(r, God, "the owner"); err != nil {
		t.Fatal(err)
	}
	if _, err := SetHold(r, HoldHeld, "the owner"); err != nil {
		t.Fatal(err)
	}
	if _, err := SetAsked(r, true, "the owner"); err != nil {
		t.Fatal(err)
	}
	theSessionNowIs(t, r, "20260905-100000")

	if at := LoadBinding(r).At; at != Bound {
		t.Errorf("the rung rests at %q and bound is the resting value", at)
	}
	if Unleashed(r) || NoGuardsAtAll(r) {
		t.Error("a session nobody unbound reads as unleashed")
	}
	if h := LoadHold(r); h.On || h.By != "" || h.Says != "" {
		t.Errorf("the hold rests at %+v and off is the resting value", h)
	}
	if a := LoadAsked(r); a.Owed() || a.By != "" || a.Says != "" {
		t.Errorf("the ask rests at %+v and nothing owed is the resting value", a)
	}
}

// ONE FUNCTION ANSWERS WHETHER A STORED CONTROL BELONGS TO THIS SESSION, and
// every control calls it. A file with no session on it is another session's,
// which is the shape all three of these files had before, so the first read
// after the change drops what each was holding.
func TestOneFunctionAnswersWhetherAControlIsThisSessions(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	theSessionNowIs(t, r, "20260905-100000")
	if !ofThisSession(r, "20260905-100000") {
		t.Error("a control written in this session is read as another session's")
	}
	if ofThisSession(r, "20260904-090000") {
		t.Error("a control from the night before is read as this session's")
	}
	if ofThisSession(r, "") {
		t.Error("a control with no session on it is read as this session's")
	}
}

// A ROTATION DOES NOT LIFT A CONTROL. The log is set aside when it fills and a
// fresh current is opened, empty until the next record lands. The session name
// lives in the first record, so in that window there is no name to read: every
// stored control was read as another session's and the rung fell back to bound,
// the hold to off, the ask to nothing owed.
//
// THE DIRECTION THAT MATTERS IS THE HOLD. A hold is a person stopping the
// engine, and a guard is a fresh process per event, so a guard firing in that
// window read the hold as off and let through calls nobody had lifted it on.
func TestARotationDoesNotLiftAControl(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	theSessionNowIs(t, r, "20260905-100000")
	if _, err := SetBinding(r, God, "the owner"); err != nil {
		t.Fatal(err)
	}
	if _, err := SetHold(r, HoldHeld, "the owner"); err != nil {
		t.Fatal(err)
	}
	theRotationWindow(t, r)

	if !LoadHold(r).On {
		t.Error("a hold a person put on reads as off while the log names no session, " +
			"so a guard firing there lets through what nobody lifted it on")
	}
	if at := LoadBinding(r).At; at != God {
		t.Errorf("the rung reads %q while the log names no session, and the owner set god", at)
	}
}

// AND A SESSION THAT CANNOT BE READ DECIDES NOTHING. The log answers a
// placeholder where it names nobody, which is a string like any other: it was
// compared against every stored control and matched none of them.
func TestASessionThatCannotBeReadDecidesNothing(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	theSessionNowIs(t, r, "20260905-100000")
	theRotationWindow(t, r)

	// The premise: through this window the log names no session.
	if now := currentSession(r); Named(now) {
		t.Fatalf("the log names the session %q, so this test is not in the window it means to be", now)
	}
	if !ofThisSession(r, "20260904-090000") {
		t.Error("a stored control is read as another session's against a session that cannot be read")
	}
	// AND A FILE WITH NO SESSION ON IT IS STILL ANOTHER SESSION'S.
	if ofThisSession(r, "") {
		t.Error("a control with no session on it is read as this session's")
	}
}

// theRotationWindow leaves the tree where a rotation leaves it: the full file
// set aside and a fresh current opened, holding nothing until the next record.
func theRotationWindow(t *testing.T, r Roots) {
	t.Helper()
	if err := os.WriteFile(filepath.Join(r.Private("log"), Current), nil, 0o644); err != nil {
		t.Fatal(err)
	}
}

// AND A CONTROL A SWAP CARRIES OVER IS KEPT. A handover is one session with two
// processes in it, so the successor reads the same session name and a person who
// unbound two minutes ago is not bound again under them.
func TestAControlSurvivesAHandover(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	theSessionNowIs(t, r, "20260905-100000")
	if _, err := SetBinding(r, Unbound, "the owner"); err != nil {
		t.Fatal(err)
	}
	// The successor of a swap appends to the session it was handed, so the
	// name the log carries does not change.
	theSessionNowIs(t, r, "20260905-100000")
	if at := LoadBinding(r).At; at != Unbound {
		t.Errorf("a swap under an unbound person read the rung as %q", at)
	}
}
