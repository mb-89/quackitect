package main

import (
	"bytes"
	"encoding/json"
	"os/exec"
	"strings"
	"testing"
)

// THE CATALOG IS ANSWERED WITH NO ENGINE OVER THE FOLDER.
//
// se query --calls is a verb, and a verb is sent on to the engine that lives.
// Over a folder with no engine the client refused it, no engine is running,
// and the catalog never came. The catalog is about this program, and it lists
// start, so a caller holding one call of its own had to hold start as well
// before it could fetch the list that says how to start. The client answers
// it the way it answers help: off the same function, with nothing started.
func TestTheCatalogNeedsNoEngine(t *testing.T) {
	t.Parallel()
	exe := theEngine(t)
	cold := aTree(t).apart().Roots
	asked := exec.Command(exe, "query", "--calls", "--work", cold.Work)
	var answer, reason bytes.Buffer
	asked.Stdout, asked.Stderr = &answer, &reason
	if err := asked.Run(); err != nil {
		t.Fatalf("the catalog with no engine answered %v: %s", err, saidOrNothing(reason.String()))
	}
	if _, up := LoadRunning(cold); up {
		t.Fatal("an engine was started to answer the catalog")
	}
	var cat catalog
	if err := json.Unmarshal(answer.Bytes(), &cat); err != nil {
		t.Fatalf("the catalog will not read: %v\n%s", err, answer.String())
	}
	fetch, ok := cat.Calls["calls"]
	if !ok || strings.Join(fetch.Argv, " ") != "query --calls" {
		t.Fatalf("the catalog carries no call that fetches it: %+v", cat.Calls)
	}
	if _, ok := cat.Calls["start"]; !ok {
		t.Fatal("the catalog does not list start, which is the call a cold caller needs first")
	}
}
