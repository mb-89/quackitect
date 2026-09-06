package main

import (
	"strings"
	"testing"
)

// A SESSION REGISTERED UNDER ONE NAME AND PULLING UNDER ANOTHER DRAWS ONE ROW.
//
// A second session over one tree is named apart from main, and it kept that
// name after the session holding main had gone. It goes on pulling as main all
// the same, because the lane names no session and answers the word. So the
// register drew a row under main with a short id after it, holding nothing,
// and the reconciliation appended a second row for main holding the token. The
// person read two agents where one process is, and the count read two hands.
func TestASessionTakesMainBackAndDrawsOneRow(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	session := currentSession(r)
	// ANOTHER SESSION IS HERE FIRST AND TAKES main, so this one is named apart.
	NoteSession(r, "another-session")
	NoteSession(r, session)
	apart := TheSessionName(r, session)
	if apart == "main" {
		t.Fatalf("the second session is named %q, so there is no collision to clear", apart)
	}

	// AND THEN IT GOES, so nothing live holds main and the next call takes it.
	AgentGone(r, "another-session")
	NoteSession(r, session)

	tok := mintStandard(t, r, "work the session holds")
	tok.Holder = "main"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	// THE LANE PULLS AS main, because it is handed no session to name.
	ArrivedAs(r, session, "main", RoleWorker)

	h := WhatIsHappening(r)
	if len(h.Present) != 1 {
		t.Fatalf("one session drew %d rows: %+v", len(h.Present), h.Present)
	}
	if !strings.Contains(h.Present[0].Holding, tok.ID) {
		t.Fatalf("the one row does not name the token it holds: %+v", h.Present[0])
	}

	// AND THE COUNT READS THE SAME TREE THE SAME WAY.
	cfg := TheFloor()
	cfg.ParallelAgents = 3
	s := StaffingOf(r, cfg)
	if s.WorkersHere+s.ReviewersHere != len(h.Present) {
		t.Fatalf("the panel drew %d row(s) and the count says %d hand(s): %+v",
			len(h.Present), s.WorkersHere+s.ReviewersHere, s)
	}

	// AND THE NAME IT GAVE UP STILL REACHES IT, so a token held under that one
	// finds its agent.
	for _, name := range []string{"main", apart} {
		if !h.Present[0].answersTo(name) {
			t.Fatalf("the one row does not answer to %q: %+v", name, h.Present[0])
		}
	}
}
