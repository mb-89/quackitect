package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// THE ONLY THING THAT ENDS GOD MODE IS ANOTHER CLICK ON THE BUTTON.
//
// MEASURED. A tree was put in god mode from the button and read as bound a
// moment later, with nothing clicked. The rung is stamped with the session and
// the read drops a stamp that does not match, and the session it was stamped
// with is the ENGINE RUN. An engine start retires the log and opens a fresh one
// under a new run, so every restart looked like a person leaving and put the
// guards back on somebody who had taken them off.
//
// A PERSON'S SESSION IS THE HARNESS'S, NOT THE ENGINE'S. The engine outlives
// nothing and is restarted for its own reasons: a swap, a rebuild, a crash. The
// person is still sitting there. So the rung asks the harness which session it
// is in, and where the log cannot say, the rung stands rather than being put
// back by a program.

// theEngineRestarted is what a start looks like from the tree: the current log
// is retired and a fresh one is opened under a new run, carrying no record of
// which harness session is going. Nobody closed the editor.
func theEngineRestarted(t *testing.T, r Roots, run string) {
	t.Helper()
	dir := r.Private("log")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	b, err := json.Marshal(Record{Session: run, Src: "engine", Kind: "start",
		Actor: "engine", Msg: "engine started"})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, Current), append(b, '\n'), 0o644); err != nil {
		t.Fatal(err)
	}
}

// appending writes one record to the log that is already going, the way a
// process continuing a session does. Nothing is retired, because nothing has
// ended.
func appending(t *testing.T, r Roots, kind, msg string) {
	t.Helper()
	log, err := ContinueLog(r.Private("log"), currentSession(r))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", kind, "engine", msg, Yes(), nil)
}

func TestOnlyAClickPutsTheRungBack(t *testing.T) {
	t.Parallel()
	for _, c := range []struct {
		says string
		then func(t *testing.T, r Roots)
	}{
		// A SWAP IS ONE SESSION WITH TWO PROCESSES IN IT. The successor appends
		// to the log it was handed, so nothing about the session moves.
		{"a swap", func(t *testing.T, r Roots) {
			appending(t, r, "start", "engine started, continuing the session")
		}},
		// A START IS A NEW ENGINE AND THE SAME PERSON.
		{"an engine start", func(t *testing.T, r Roots) {
			theEngineRestarted(t, r, "20260905-100000")
		}},
		{"a projection", func(t *testing.T, r Roots) {
			appending(t, r, "projection", "a projection was drawn")
		}},
	} {
		c := c
		t.Run(c.says, func(t *testing.T) {
			t.Parallel()
			r := aTreeToWriteIn(t)
			theSessionNowIs(t, r, "20260904-090000")
			if _, err := SetBinding(r, God, "the owner"); err != nil {
				t.Fatal(err)
			}
			if at := LoadBinding(r).At; at != God {
				t.Fatalf("the rung reads %q in the session that set it, so this proves nothing", at)
			}
			c.then(t, r)
			if at := LoadBinding(r).At; at != God {
				t.Fatalf("%s left the rung at %q, and only a click may put it back", c.says, at)
			}
		})
	}
}

// AND THE RUNG CARRIES THE NAME OF WHATEVER LAST WROTE IT, on the way down as
// well as on the way up. A drop with nobody's name on it is the state this
// token was minted over: it could not be attributed, only guessed at.
func TestTheRungNamesItsLastWriter(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	theSessionNowIs(t, r, "20260904-090000")
	if _, err := SetBinding(r, God, "the owner"); err != nil {
		t.Fatal(err)
	}
	if by := LoadBinding(r).By; by != "the owner" {
		t.Fatalf("the rung was raised by %q and the owner raised it", by)
	}
	if _, err := SetBinding(r, Bound, "the owner"); err != nil {
		t.Fatal(err)
	}
	var b Binding
	raw, err := os.ReadFile(r.Private("binding.json"))
	if err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(raw, &b); err != nil {
		t.Fatal(err)
	}
	if b.By != "the owner" {
		t.Fatalf("the rung was put back by %q, so a reader cannot say who ended god mode", b.By)
	}
}

// AND THE OTHER HALF, so this is not a rung that never comes down. A person who
// closes the editor and opens it again is in a new session, the harness says so
// in the log, and the rung they left armed does not follow them into it.
func TestANewPersonSessionStillEndsGodMode(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	theSessionNowIs(t, r, "20260904-090000")
	if _, err := SetBinding(r, God, "the owner"); err != nil {
		t.Fatal(err)
	}
	theSessionNowIs(t, r, "20260905-100000")
	if at := LoadBinding(r).At; at != Bound {
		t.Fatalf("a session later the rung reads %q, and god came back armed with nobody having said so", at)
	}
}
