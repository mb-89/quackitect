package main

import (
	"testing"
	"time"
)

// THE REGISTER IS THE ENGINE'S RUN, NOT THE LOG'S SESSION.
//
// They were one thing until a swap made the successor continue the session,
// which is right for the record and wrong for this. An agent registered hours
// earlier then stayed present for ever: a freshly started editor drew five
// workers that had not existed since the night before, and an orchestrator that
// nothing was running.
func TestAnAgentFromAnEarlierRunIsNotPresent(t *testing.T) {
	r := aTreeToWriteIn(t)
	// A SESSION WITH A NAME, which is what the engine writes at its start and
	// what the register is read against when no engine is running.
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)
	now := time.Now().UTC()

	// The register as an earlier engine left it, under that engine's run.
	e := LoadEvidence(r)
	e.Agents = map[string]Agent{
		"a-1": {Kind: "session", Name: "orchestrator-mb", First: now.Add(-3 * time.Hour),
			Session: "s-old", Run: "aaaaaaaaaa"},
		"a-2": {Kind: "worker", Name: "worker-heron", First: now.Add(-3 * time.Hour),
			Session: "s-old", Run: "aaaaaaaaaa"},
	}
	if err := SaveEvidence(r, e); err != nil {
		t.Fatal(err)
	}

	// THE RUN NOW IS NOT THAT ONE, because no engine of that run is here.
	if TheRunNow(r) == "aaaaaaaaaa" {
		t.Fatal("this tree answered the earlier engine's run, so the fixture proves nothing")
	}
	if got := AgentsPresent(r); len(got) != 0 {
		t.Fatalf("a run that ended left %d agent(s) present: %+v", len(got), got)
	}

	// AND AN AGENT OF THE RUN THAT IS HERE IS PRESENT, which is the half that
	// has to keep working.
	e = LoadEvidence(r)
	e.Agents["a-3"] = Agent{Kind: "worker", Name: "worker-now",
		First: now, Session: "s-now", Run: TheRunNow(r)}
	if err := SaveEvidence(r, e); err != nil {
		t.Fatal(err)
	}
	got := AgentsPresent(r)
	if len(got) != 1 || got[0].Actor != "worker-now" {
		t.Fatalf("the run that is here answered %+v", got)
	}
}
