package main

import (
	"fmt"
	"net"
	"os"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// AN UNGUARDED SESSION SAYS SO, AT THE START, IN ONE LINE.
//
// A session ran for a whole day with no guard on it. The harness root sat above
// the repository, the settings file was never read, and no hook ever fired.
// Every rule built that day was enforced against nobody, and nothing said so.
//
// THE FAILURE IS SILENT BY CONSTRUCTION. A guard that passed everything and a
// guard that never ran look the same from inside. So the engine says which it
// is, rather than leaving an agent to infer it from silence.
func TestTheEngineSaysWhetherTheGuardIsLive(t *testing.T) {
	t.Parallel()
	r := aTree(t).apart().Roots

	// THE DOOR IS FREE, so the guard is live and the line says so.
	ln, live, up := holdTheDoor(r)
	if !up || ln == nil {
		t.Fatalf("the port was free and the door did not open: %q", live)
	}
	if !strings.Contains(live, hooksURL(r)) {
		t.Errorf("the line does not name the door: %q", live)
	}
	ln.Close()

	// AND WHEN SOMETHING ELSE HOLDS THE PORT, the same call says the guard is
	// not live, which is the case that ran silent for a day.
	taken, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", hooksPort(r)))
	if err != nil {
		t.Skipf("this box will not let the test hold the port: %v", err)
	}
	defer taken.Close()
	gone, dead, stillUp := holdTheDoor(r)
	if stillUp || gone != nil {
		t.Fatalf("the port was taken and the door opened anyway: %q", dead)
	}
	if dead == live {
		t.Fatalf("a guarded start and an unguarded one say the same line: %q", dead)
	}
	if !strings.Contains(dead, hooksURL(r)) {
		t.Errorf("the unguarded line does not name the door: %q", dead)
	}

	// AND THE RECORD CARRIES THE SAME ANSWER, so a reader who was not watching
	// the start can tell afterwards.
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	SayTheDoor(log, false, dead)
	text, err := os.ReadFile(log.Path())
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(text), dead) {
		t.Errorf("the record does not carry the line the start said:\n%s", text)
	}
	if !strings.Contains(string(text), "\"guarded\":false") {
		t.Errorf("the record does not say guarded false, so nothing can be asked for it:\n%s", text)
	}
}
