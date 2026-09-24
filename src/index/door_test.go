// The door, driven over loopback. A case puts one up on a tree it wrote, asks
// it the questions a verb asks, and reads the answers back as JSON.
// [[spec/design_output/index#the-door-owns-the-database]]
package main

import (
	"path/filepath"
	"strconv"
	"testing"
	"time"
)

func TestTheDoorAnswersEveryQuestionAVerbAsks(t *testing.T) {
	root := tree(t)
	stop, listen, err := Serve(root, filepath.Join(t.TempDir(), "index.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
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
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer stop()

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
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer stop()

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

// [[spec/design_output/index#the-index-fires-on-change]]
func TestAChangesCallFiresOnAWrittenFileWithinASecond(t *testing.T) {
	root := tree(t)
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer stop()

	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	first, err := posts(standing, []string{"changes", "0"})
	if err != nil || first.Error != "" {
		t.Fatalf("a changes call from nothing answers the tick now, and answered %v %q", err, first.Error)
	}
	tick := tickOf(t, first)
	if tick < 1 {
		t.Fatalf("the walk on the way up counts one, and the tick reads %d", tick)
	}

	write(t, root, "spec/tickets/late.md", "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nA ticket written while the door stands.\n")
	started := time.Now()
	next, err := posts(standing, []string{"changes", strconv.FormatInt(tick, decimalBase)})
	if err != nil || next.Error != "" {
		t.Fatalf("a changes call past the tick answers, and answered %v %q", err, next.Error)
	}
	if tickOf(t, next) <= tick {
		t.Fatalf("a sweep past a write counts one more, and the tick stayed at %d", tick)
	}
	if time.Since(started) > time.Second {
		t.Fatalf("the call fires within a second of the write, and took %v", time.Since(started))
	}
}

// [[spec/design_output/index#the-index-fires-on-change]]
func TestAChangesCallFiresOnAPlanWriteWithinASecond(t *testing.T) {
	root := tree(t)
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer stop()

	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	first, err := posts(standing, []string{"changes", "0"})
	if err != nil || first.Error != "" {
		t.Fatalf("a changes call from nothing answers the tick now, and answered %v %q", err, first.Error)
	}
	tick := tickOf(t, first)

	write(t, root, Plan, `{"working":"","todos":[]}`)
	started := time.Now()
	next, err := posts(standing, []string{"changes", strconv.FormatInt(tick, decimalBase)})
	if err != nil || next.Error != "" {
		t.Fatalf("a changes call past the tick answers, and answered %v %q", err, next.Error)
	}
	if tickOf(t, next) <= tick {
		t.Fatalf("a plan write counts one more, so the work tab reads the todos again, and the tick stayed at %d", tick)
	}
	if time.Since(started) > time.Second {
		t.Fatalf("the call fires within a second of the plan write, and took %v", time.Since(started))
	}
}

func tickOf(t *testing.T, said answer) int64 {
	t.Helper()
	held, ok := said.Result.(map[string]any)
	if !ok {
		t.Fatalf("a changes call answers a tick, and answered %#v", said.Result)
	}
	tick, ok := held["tick"].(float64)
	if !ok {
		t.Fatalf("the tick reads as a number, and reads %#v", held["tick"])
	}
	return int64(tick)
}
