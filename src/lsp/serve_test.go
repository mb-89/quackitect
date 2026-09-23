package main

import (
	"encoding/json"
	"net/http"
	"os"
	"testing"
)

// A door over a case's own folder, so the case starts no index. [[spec/design_output/lsp#the-standing-file]]
func servedAt(t *testing.T, root string) (*http.Server, error) {
	t.Helper()
	server, _, err := serveOver(root, &Checker{tree: treeOver(root, realDisk{})})
	return server, err
}

func TestTheServerWritesWhereItStands(t *testing.T) {
	root := t.TempDir()
	server, err := servedAt(t, root)
	if err != nil {
		t.Fatal(err)
	}
	defer server.Close()

	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	if standing.Port == 0 || standing.Root != root || standing.Pid != os.Getpid() {
		t.Fatalf("the standing file reads %+v", standing)
	}

	said, err := posts(standing, "standing")
	if err != nil {
		t.Fatal(err)
	}
	if said.Error != "" {
		t.Fatalf("the server answers %q", said.Error)
	}
	body, _ := json.Marshal(said.Result)
	if !jsonHolds(body, "version") {
		t.Errorf("the answer reads %s", body)
	}
}

func TestASecondCallerFindsTheFirstServer(t *testing.T) {
	root := t.TempDir()
	server, err := servedAt(t, root)
	if err != nil {
		t.Fatal(err)
	}
	defer server.Close()

	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	if !current(standing, root) {
		t.Fatal("the caller reads the standing file as stale")
	}
	if _, err := posts(standing, "check"); err != nil {
		t.Fatalf("a second caller reaches nothing: %v", err)
	}
}

func TestAStaleFileGivesWay(t *testing.T) {
	root := t.TempDir()
	if current(Standing{Port: 1, Root: root, Stamp: "an older build"}, root) {
		t.Error("a stamp apart still reads as standing")
	}
	if current(Standing{Port: 1, Root: "/somewhere/else", Stamp: stampHere()}, root) {
		t.Error("a server in another tree still reads as standing")
	}
	if !current(Standing{Port: 1, Root: root, Stamp: stampHere()}, root) {
		t.Error("this very server reads as stale")
	}
}

func TestTheServerNamesNoStrangerMethod(t *testing.T) {
	one := &door{checker: &Checker{tree: treeOver(t.TempDir(), realDisk{})}}
	if _, err := one.answers(call{Method: "stranger"}); err == nil {
		t.Fatal("a method nobody named answers fine")
	}
}

func jsonHolds(body []byte, key string) bool {
	var said map[string]any
	if json.Unmarshal(body, &said) != nil {
		return false
	}
	_, held := said[key]
	return held
}
