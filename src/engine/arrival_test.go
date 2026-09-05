package main

import (
	"strings"
	"testing"
)

// A HARNESS RESTART IS AN ARRIVAL, EVEN INSIDE ONE ENGINE RUN.
//
// The engine outlives agents: keyed on the engine session, a harness restart
// was not seen as an arrival and the reclaim never fired, so what the dead
// predecessor held stayed held. The session records in the log carry the
// harness session id, and that is the boundary an agent's life actually has.
func TestASecondHarnessSessionReclaims(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	root := r.Work
	writeWorkableProcess(t, root, "queued")
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()

	// ONE ENGINE SESSION, AND THE FIRST HARNESS SESSION STARTS IN IT.
	log.Write("agent", "session", "main", "session started, startup", Yes(),
		map[string]any{"source": "startup", "session": "harness-a"})

	tok, err := Mint(r, Token{Tracked: local(), Process: "queued", Title: "work in hand", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	Pull(r, "main", RoleWorker, Payload{}) // main arrives in harness-a
	if _, err := TakeUp(r, tok.ID, "main"); err != nil {
		t.Fatal(err)
	}

	// THE HARNESS RESTARTS: a new session id, same engine run.
	log.Write("agent", "session", "main", "session started, startup", Yes(),
		map[string]any{"source": "startup", "session": "harness-b"})

	a := Pull(r, "main", RoleWorker, Payload{})
	if !strings.Contains(a.Notice, "back in the queue") || !strings.Contains(a.Notice, tok.ID) {
		t.Fatalf("the second harness session did not reclaim %s: %q", tok.ID, a.Notice)
	}
}

// A COMPACTION IS THE SAME AGENT CONTINUING, so it is not an arrival and it
// reclaims nothing: the holder is mid-work, not dead.
func TestACompactionReclaimsNothing(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	root := r.Work
	writeWorkableProcess(t, root, "queued")
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()

	log.Write("agent", "session", "main", "session started, startup", Yes(),
		map[string]any{"source": "startup", "session": "harness-a"})

	tok, err := Mint(r, Token{Tracked: local(), Process: "queued", Title: "work in hand", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	Pull(r, "main", RoleWorker, Payload{}) // main arrives in harness-a
	if _, err := TakeUp(r, tok.ID, "main"); err != nil {
		t.Fatal(err)
	}

	// THE CONTEXT COMPACTS. The harness starts the session again with source
	// compact, and whatever id it says, this is not a new agent.
	log.Write("agent", "session", "main", "session started, compact", Yes(),
		map[string]any{"source": "compact", "session": "harness-a2"})

	a := Pull(r, "main", RoleWorker, Payload{})
	if strings.Contains(a.Notice, "back in the queue") {
		t.Fatalf("a compaction reclaimed: %q", a.Notice)
	}
	if got, err := LoadToken(r, tok.ID); err != nil || got.Holder != "main" {
		t.Fatalf("the hold did not survive the compaction: holder %q, %v", got.Holder, err)
	}
}
