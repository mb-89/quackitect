package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A CONTROL A CONSOLE CAN REACH, AND ONE IT CANNOT.
func aConsoleTree(t *testing.T) Roots {
	t.Helper()
	r := guidanceTree(t)
	os.WriteFile(filepath.Join(r.Method, "util", "parameters.json"), []byte(`{
	  "name":"quackitect","type":"group","children":[
	    {"name":"guards","type":"group","shown":true,"children":[
	      {"name":"search_via_index","type":"bool","default":true,"console":true,
	       "help":"Every search goes through the index."},
	      {"name":"stop_needs_claim","type":"bool","default":true}]}]}`), 0o644)
	return r
}

func valueOf(t *testing.T, r Roots, key string) any {
	t.Helper()
	v, err := LoadValues(r)
	if err != nil {
		t.Fatal(err)
	}
	return v.Value[key]
}

// heardHere plays one message through the route the harness uses for a message
// written into a running turn. Nothing is relayed by the agent.
func heardHere(t *testing.T, r Roots, l *Log, said string) {
	t.Helper()
	path := filepath.Join(t.TempDir(), "session.jsonl")
	os.WriteFile(path, nil, 0o644)
	StartWhereItIs(r, path)
	os.WriteFile(path, []byte(queued(said)), 0o644)
	if n := CopyWhatWasHeard(r, path, l, "main"); n != 1 {
		t.Fatalf("the message was not copied: %d", n)
	}
}

// A MESSAGE THAT IS ONLY THE KEYWORD MOVES THE CONTROL IT NAMES. The cloud has
// no panel, so the chat is the only surface a person has on a box they are not
// sitting at.
func TestAMessageThatIsOnlyTheKeywordMovesTheControl(t *testing.T) {
	t.Parallel()
	r := aConsoleTree(t)
	l, _ := OpenLog(r.Private("log"))
	defer l.Close()

	if valueOf(t, r, "guards.search_via_index") != true {
		t.Fatal("the guard did not start on, so nothing this test sees is about the keyword")
	}
	heardHere(t, r, l, "  search via index  ")
	if got := valueOf(t, r, "guards.search_via_index"); got != false {
		t.Fatalf("the keyword moved nothing: the guard reads %v", got)
	}
}

// THE SAME KEYWORD INSIDE A SENTENCE MOVES NOTHING. This is what keeps the
// guidance that describes these keywords from firing them.
func TestTheKeywordInsideASentenceMovesNothing(t *testing.T) {
	t.Parallel()
	r := aConsoleTree(t)
	l, _ := OpenLog(r.Private("log"))
	defer l.Close()

	heardHere(t, r, l, "please turn search via index off for me")
	if got := valueOf(t, r, "guards.search_via_index"); got != true {
		t.Fatalf("a mention inside a sentence was taken as a keyword: the guard reads %v", got)
	}
}

// A CONTROL THAT CARRIES NO FLAG IS REACHED BY NOTHING.
func TestAnUnflaggedControlHasNoKeyword(t *testing.T) {
	t.Parallel()
	r := aConsoleTree(t)
	l, _ := OpenLog(r.Private("log"))
	defer l.Close()

	heardHere(t, r, l, "stop needs claim")
	if got := valueOf(t, r, "guards.stop_needs_claim"); got != true {
		t.Fatalf("a control nobody declared reachable was reached: it reads %v", got)
	}
}

// THE CHANGE NAMES THE KEYWORD AND WHAT IT MOVED, so a change nobody expected
// is attributed rather than guessed at.
func TestTheChangeNamesTheKeywordAndWhatItMoved(t *testing.T) {
	t.Parallel()
	r := aConsoleTree(t)
	l, _ := OpenLog(r.Private("log"))
	heardHere(t, r, l, "search via index")
	l.Close()

	b, err := os.ReadFile(filepath.Join(r.Private("log"), Current))
	if err != nil {
		t.Fatal(err)
	}
	var found map[string]any
	for _, line := range strings.Split(string(b), "\n") {
		var rec struct {
			Kind string         `json:"kind"`
			Data map[string]any `json:"data"`
		}
		if json.Unmarshal([]byte(line), &rec) == nil && rec.Kind == "keyword" {
			found = rec.Data
		}
	}
	if found == nil {
		t.Fatal("the record says nothing about a keyword that moved a control")
	}
	if found["keyword"] != "search via index" {
		t.Fatalf("the record does not name the keyword: %v", found)
	}
	if found["parameter"] != "guards.search_via_index" {
		t.Fatalf("the record does not name what moved: %v", found)
	}
	if found["value"] != false {
		t.Fatalf("the record does not name what it moved to: %v", found)
	}
}

// A KEYWORD AN AGENT WRITES RATHER THAN A PERSON MOVES NOTHING. The said verb
// is the agent's own door into the record, and it is not a person talking.
func TestAKeywordAnAgentWritesMovesNothing(t *testing.T) {
	t.Parallel()
	r := aConsoleTree(t)
	l, _ := OpenLog(r.Private("log"))
	defer l.Close()

	var out, errs strings.Builder
	c := &call{roots: r, args: []string{"--text", "search via index"}, out: &out, err: &errs}
	if code := runSaid(c); code != 0 {
		t.Fatalf("the said verb failed: %d %s", code, errs.String())
	}
	if got := valueOf(t, r, "guards.search_via_index"); got != true {
		t.Fatalf("an agent relayed a keyword and it moved a control: %v", got)
	}
}
