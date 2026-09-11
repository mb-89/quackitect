// The door, driven over loopback. A case puts one up on a tree it wrote, asks
// it the questions a verb asks, and reads the answers back as JSON.
// [[spec/design_output/index#the-door-owns-the-database]]
package main

import (
	"path/filepath"
	"testing"
	"time"
)

func TestTheDoorAnswersEveryQuestionAVerbAsks(t *testing.T) {
	root := tree(t)
	server, listen, err := Serve(root, filepath.Join(t.TempDir(), "index.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer server.Close()
	_ = listen

	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	if standing.Pid == 0 || standing.Port == 0 {
		t.Fatalf("the standing file says %+v", standing)
	}

	said, err := posts(standing, []string{"find", "search"})
	if err != nil {
		t.Fatal(err)
	}
	if said.Error != "" {
		t.Fatalf("find answered %q", said.Error)
	}

	said, err = posts(standing, []string{"dangling"})
	if err != nil {
		t.Fatal(err)
	}
	rows, ok := said.Result.([]any)
	if !ok || len(rows) != 1 {
		t.Fatalf("dangling answered %#v", said.Result)
	}
}

func TestAMethodNobodyNamedComesBackNamed(t *testing.T) {
	root := tree(t)
	server, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer server.Close()

	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	said, err := posts(standing, []string{"nonsense"})
	if err != nil {
		t.Fatal(err)
	}
	if said.Error == "" {
		t.Fatal("a method nobody named answered no error")
	}
}

// [[spec/design_output/index#the-watcher-keeps-it-warm]]
func TestAWriteUnderTheTreeReachesTheIndex(t *testing.T) {
	root := tree(t)
	server, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer server.Close()

	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}

	write(t, root, "spec/three.md", "---\nid: three\n---\n\nA word nobody indexed yet: marmalade.\n")

	for waited := 0; waited < 100; waited++ {
		said, err := posts(standing, []string{"find", "marmalade"})
		if err == nil && said.Error == "" {
			if rows, ok := said.Result.([]any); ok && len(rows) > 0 {
				return
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
	t.Fatal("a file written under the tree never reached the index")
}

func TestADoorFromAnotherBuildStandsAside(t *testing.T) {
	root := t.TempDir()

	if stands(Standing{Root: root, Stamp: stampHere()}, root) != true {
		t.Fatal("this build talks to its own door")
	}
	if stands(Standing{Root: root, Stamp: "another build"}, root) {
		t.Fatal("a door from another build stands aside for this one")
	}
	if stands(Standing{Root: "/somewhere/else", Stamp: stampHere()}, root) {
		t.Fatal("a door over another tree answers about that tree")
	}
	if stampHere() == "" {
		t.Fatal("a build with no stamp leaves every door looking stale")
	}
}
