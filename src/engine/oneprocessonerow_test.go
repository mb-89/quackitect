package main

import (
	"strings"
	"testing"
)

// ONE PROCESS DRAWS ONE ROW, whatever it is called.
//
// The harness announces the session as main. The session pulls as
// orchestrator-mb, and the gate writes that pair into actors.json.
// AgentsPresent draws the row under the pulling name, and the token is held
// under main. WhatIsHappening compared the drawn name against the holding name,
// found two strings, and appended a second row. The person then read four
// agents where three were working. Every count over those rows was one too
// many, and the owner asked why the panel and the number disagree.
func TestOneProcessDrawsOneRow(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	session := currentSession(r)
	NoteSession(r, session)
	NoteTheNameItActsAs(r, "main", "orchestrator-mb")

	tok := mintStandard(t, r, "work the session holds")
	tok.Holder = "main"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	// THE HOLDING NAME PULLED, which is what gives it a row of its own for the
	// reconciliation to find and offer to Present.
	ArrivedAs(r, session, "main", RoleWorker)

	h := WhatIsHappening(r)
	if len(h.Present) != 1 {
		t.Fatalf("one session drew %d rows: %+v", len(h.Present), h.Present)
	}
	if !strings.Contains(h.Present[0].Holding, tok.ID) {
		t.Fatalf("the one row does not name the token it holds: %+v", h.Present[0])
	}

	// AND THE COUNT READS THE SAME TREE THE SAME WAY. A panel and a number that
	// disagree are two answers to one question.
	cfg := TheFloor()
	cfg.ParallelAgents = 3
	s := StaffingOf(r, cfg)
	if s.WorkersHere+s.ReviewersHere != len(h.Present) {
		t.Fatalf("the panel drew %d row(s) and the count says %d hand(s): %+v",
			len(h.Present), s.WorkersHere+s.ReviewersHere, s)
	}
}
