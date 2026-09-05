package main

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"
	"time"
)

// AN ACTOR IS A SESSION, NOT A WORD.
//
// Two sessions ran over one tree and both were the actor main. TakeUp puts
// back everything else that actor holds, so every time one session named a
// token the other session's token left its hands, and the agent it left was
// refused every write for holding nothing.

// arrive tells the guard a session started, the way the harness does.
func arrive(t *testing.T, r Roots, log *Log, session string) {
	t.Helper()
	body, _ := json.Marshal(map[string]any{"hook_event_name": "SessionStart",
		"cwd": r.Work, "session_id": session, "source": "startup"})
	var out bytes.Buffer
	answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
}

// TWO SESSIONS OVER ONE TREE ARE TWO ACTORS, and neither puts back the other's
// work. The register keys a session by the id the harness sends, so the two
// are told apart by something two sessions cannot both say.
func TestTwoSessionsAreTwoActors(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	arrive(t, r, log, "s-first")
	arrive(t, r, log, "s-second-3f2a9c1b")

	first := TheSessionName(r, "s-first")
	second := TheSessionName(r, "s-second-3f2a9c1b")
	if first != "main" {
		t.Fatalf("the session that was here first is called %q, and main is the name "+
			"everything already written down uses", first)
	}
	if second == first {
		t.Fatalf("both sessions are the actor %q, so each one's take-up empties the "+
			"other's hands", second)
	}

	// EACH HOLDS ITS OWN, AND NEITHER PUTS BACK THE OTHER'S.
	one := mintStandard(t, r, "the first session's work")
	two := mintStandard(t, r, "the second session's work")
	if _, err := TakeUp(r, one.ID, first); err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, two.ID, second); err != nil {
		t.Fatal(err)
	}
	for _, want := range []struct{ id, holder string }{{one.ID, first}, {two.ID, second}} {
		back, err := LoadToken(r, want.id)
		if err != nil {
			t.Fatal(err)
		}
		if back.Holder != want.holder {
			t.Errorf("%s should be held by %s and is held by %q", want.id, want.holder, back.Holder)
		}
	}

	// AND THE REGISTER DRAWS TWO ROWS, one per session, each under its own
	// name, because a table drawing one row where two agents are working is
	// the same defect where a person can see it.
	drawn := map[string]string{}
	for _, d := range WhatIsHappening(r).Present {
		drawn[d.Actor] = d.Holding
	}
	if drawn[first] != one.ID+" "+one.Title {
		t.Errorf("the table says %s is holding %q", first, drawn[first])
	}
	if drawn[second] != two.ID+" "+two.Title {
		t.Errorf("the table says %s is holding %q", second, drawn[second])
	}
}

// AND A NAME ANOTHER SESSION HOLDS IS REFUSED, NAMING THAT SESSION.
//
// A name of its own is no use to a session that goes on saying main, and
// nothing in a call itself says which session sent it. The guard is handed the
// session on every event, so the guard is what answers.
func TestANameAnotherSessionHoldsIsRefused(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	call := func(session, tool string, in map[string]any) string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "PreToolUse",
			"cwd": r.Work, "session_id": session, "tool_name": tool, "tool_input": in})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}
	arrive(t, r, log, "s-first")
	arrive(t, r, log, "s-second-3f2a9c1b")
	second := TheSessionName(r, "s-second-3f2a9c1b")

	// THE LANE AND THE SHELL ARE THE TWO DOORS, and the rule is driven through
	// each: one carries the name as a field and the other in a flag.
	for _, door := range []struct {
		says string
		tool string
		in   map[string]any
	}{
		{"the lane", "mcp__quackitect__se_pull", map[string]any{"actor": "main"}},
		{"the shell", "Bash", map[string]any{"command": ".bin/se pull --actor main"}},
	} {
		said := call("s-second-3f2a9c1b", door.tool, door.in)
		if !strings.Contains(said, "deny") {
			t.Errorf("%s: the second session acted as main and was not refused: %s", door.says, said)
			continue
		}
		if !strings.Contains(said, "s-first") {
			t.Errorf("%s: the refusal does not name the session that holds main: %s", door.says, said)
		}
		if !strings.Contains(said, second) {
			t.Errorf("%s: the refusal does not say which name to act under: %s", door.says, said)
		}
	}

	// AND ITS OWN NAME GOES THROUGH, as does the name the first session holds.
	if said := call("s-second-3f2a9c1b", "mcp__quackitect__se_pull",
		map[string]any{"actor": second}); strings.Contains(said, "deny") {
		t.Errorf("the second session was refused its own name: %s", said)
	}
	if said := call("s-first", "mcp__quackitect__se_pull",
		map[string]any{"actor": "main"}); strings.Contains(said, "deny") {
		t.Errorf("the first session was refused the name it holds: %s", said)
	}

	// AND A HELPER IS UNTOUCHED. No session answers to a helper's name, and
	// two helpers of two sessions were already two actors.
	if said := call("s-second-3f2a9c1b", "mcp__quackitect__se_pull",
		map[string]any{"actor": "worker-one"}); strings.Contains(said, "deny") {
		t.Errorf("a helper's name was read as another session's: %s", said)
	}

	// AND THE SESSION IT NAMES IS ONE OF THIS RUN.
	//
	// Gone is written on SessionEnd and on nothing else, so a session killed
	// without one keeps Kind session, Name main and a zero Gone for ever. The
	// loop reads a map, whose order is nobody's, so with a stale record under
	// main beside the live one the refusal could name a session that is not
	// here and send the agent to look at a dead id. The refusal is the whole
	// product of this guard, and one naming the wrong session costs the turns
	// this token's parent already paid.
	e := LoadEvidence(r)
	e.Agents["s-dead-of-an-earlier-run"] = Agent{Kind: "session", Name: "main",
		First: time.Now().UTC().Add(-3 * time.Hour), Session: "s-dead-of-an-earlier-run",
		Run: "aaaaaaaaaa"}
	if err := SaveEvidence(r, e); err != nil {
		t.Fatal(err)
	}
	if TheRunNow(r) == "aaaaaaaaaa" {
		t.Fatal("this tree answered the earlier engine's run, so the fixture proves nothing")
	}
	// ASKED MORE THAN ONCE, because one pass over a map that happened to start
	// at the live record is a guard nobody has watched work.
	for i := 0; i < 20; i++ {
		said := call("s-second-3f2a9c1b", "mcp__quackitect__se_pull", map[string]any{"actor": "main"})
		if !strings.Contains(said, "deny") {
			t.Fatalf("a stale record took the refusal off: %s", said)
		}
		if strings.Contains(said, "s-dead-of-an-earlier-run") {
			t.Fatalf("the refusal names a session of a run that is not here: %s", said)
		}
		if !strings.Contains(said, "s-first") {
			t.Fatalf("the refusal does not name the live session that holds main: %s", said)
		}
	}
}
