package main

import (
	"os"
	"path/filepath"
	"testing"
)

// The candidates are data, so the fixture declares its own. One that is
// certainly here, because this test is running under it, and one that is
// certainly not.
func probeTree(t *testing.T) Roots {
	t.Helper()
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}
	os.MkdirAll(filepath.Join(r.Method, "util"), 0o755)
	os.WriteFile(filepath.Join(r.Method, "util", "tools.json"), []byte(`{"tools":[
	  {"name":"go","args":["version"],"for":"building a program"},
	  {"name":"nothing-is-called-this","args":["--version"],"for":"nothing"}
	]}`), 0o644)
	return r
}

// The engine asks the machine rather than assuming. A name that resolves and
// answers is kept, and a name that does not is dropped without a word.
func TestTheProbeKeepsOnlyWhatAnswers(t *testing.T) {
	r := probeTree(t)
	p := ProbeTools(r, "20260831-000000")
	if len(p.Found) != 1 || p.Found[0].Name != "go" {
		t.Fatalf("the probe found %+v", p.Found)
	}
	if p.Found[0].Version == "" || p.Found[0].Path == "" {
		t.Fatalf("a found tool says nothing about itself: %+v", p.Found[0])
	}
	// It is on disk, so a pull in another process can read it.
	if _, ok := LoadProbe(r); !ok {
		t.Fatal("the probe was not written")
	}
}

// A candidate list that will not read leaves the list empty. It never stops a
// boot, because not knowing what the machine has is worse than a slow start
// and better than no engine.
func TestAMissingCandidateListDoesNotStopTheProbe(t *testing.T) {
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}
	if p := ProbeTools(r, "20260831-000000"); len(p.Found) != 0 {
		t.Fatalf("it found %d tools with no list", len(p.Found))
	}
}

// An arrival happens once per actor per session, and it is what every
// once-per-session fact keys off.
func TestAnActorArrivesOnceAndThenDoesNot(t *testing.T) {
	r := probeTree(t)
	const session = "20260831-000000"
	if !Arrived(r, session, "main") {
		t.Fatal("the first pull is an arrival")
	}
	if Arrived(r, session, "main") {
		t.Fatal("the second pull is not")
	}
	// A second actor has not arrived yet, so it does.
	if !Arrived(r, session, "scribe") {
		t.Fatal("a second actor should arrive on its own")
	}
	// A new session is a new set of agents.
	if !Arrived(r, "20260831-111111", "main") {
		t.Fatal("a new session should arrive again")
	}
}

// A probe from an earlier session says what an earlier machine had. Somebody
// may have installed something since, so it is ignored rather than trusted.
func TestAProbeFromAnEarlierSessionIsIgnored(t *testing.T) {
	r := probeTree(t)
	ProbeTools(r, "20260831-000000")
	if got := KnownTools(r, "20260831-111111"); got != nil {
		t.Fatalf("a stale probe was handed over: %+v", got)
	}
}

// The pull is where it reaches the agent, because the pull is the one call
// every agent makes.
func TestTheFirstPullCarriesTheToolsAndTheSecondDoesNot(t *testing.T) {
	r := probeTree(t)
	l, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "for the session name", Yes(), nil)
	ProbeTools(r, l.Session())
	l.Close()

	first := Pull(r, "main", RoleWorker, Payload{})
	if len(first.Tools) != 1 {
		t.Fatalf("the first pull carried %d tools", len(first.Tools))
	}
	if second := Pull(r, "main", RoleWorker, Payload{}); len(second.Tools) != 0 {
		t.Fatalf("the second pull carried them again")
	}
}
