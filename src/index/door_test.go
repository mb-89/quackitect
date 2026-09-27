// The door, driven over loopback. A case puts one up on a tree it wrote, asks
// it the questions a verb asks, and reads the answers back as JSON.
// [[spec/design_output/index#the-door-owns-the-database]]
package index

import (
	"path/filepath"
	"strconv"
	"testing"
	"time"

	"quackitect/src/config"
	"quackitect/src/q"
)

func TestTheDoorAnswersEveryQuestionAVerbAsks(t *testing.T) {
	root := tree(t)
	stop, listen, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), q.New())
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
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), q.New())
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
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), q.New())
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
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), q.New())
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
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), q.New())
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

func TestTheDoorAnswersWhy(t *testing.T) {
	root := tree(t)
	catalog := q.New()
	q.GivenIn(catalog, "t/n", 0)
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), catalog)
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	said, err := posts(standing, []string{"why", "t/n"})
	if err != nil {
		t.Fatal(err)
	}
	found, ok := said.Result.(map[string]any)
	if said.Error != "" || !ok || found["name"] != "t/n" || found["state"] != "default" {
		t.Fatalf("why t/n answers %#v, %q", said.Result, said.Error)
	}
}

func TestTheWhyVerbAsksTheName(t *testing.T) {
	method, params := asked([]string{"why", "t/n"})
	if method != "why" || string(params) != `{"name":"t/n"}` {
		t.Fatalf("the verb asks %s with %s", method, params)
	}
}

// The engine asks the door for the hash of a note, so the door answers the hashes method. [[spec/design_output/pull#an-input-marks-its-steps]]
func TestTheDoorAnswersTheHashesOfThePathsAsked(t *testing.T) {
	root := tree(t)
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), q.New())
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}

	said, err := posts(standing, []string{"call", "hashes", `{"asks":[{"path":"src/plain.js","size":10}]}`})
	if err != nil {
		t.Fatal(err)
	}
	rows, ok := said.Result.(map[string]any)
	one, found := rows["src/plain.js"].(map[string]any)
	if !ok || !found || one["hash"] != "8f93e4f24776ff1d" || one["head"] != "e0ce802675de49b5" {
		t.Fatalf("hashes answered %#v", said.Result)
	}
}

// Serve builds the scheduler over its store, so a move an IO module commits runs the provider reading it. [[spec/tickets/the-scheduler-runs-providers]]
func TestTheDoorRunsAProviderWhenAnIOModuleMovesItsInput(t *testing.T) {
	type countOf struct {
		N int `q:"t/n"`
	}
	root := tree(t)
	catalog := q.New()
	hand := q.GivenIn(catalog, "t/n", 0)
	q.DerivedIn(catalog, "t/double", 0, func(in countOf) int { return in.N * 2 })
	moves := func(_ string, commit Commit) (func(), error) {
		return func() {}, commit(hand, map[string]any{"t/n": 3})
	}
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), catalog, moves)
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	var said answer
	for range topicPolls {
		said, err = posts(standing, []string{"call", "read", `{"name":"t/double"}`})
		if err != nil {
			t.Fatal(err)
		}
		if said.Result == float64(6) {
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
	t.Fatalf("t/double reads %#v after t/n moves to 3", said.Result)
}

// The index holds a lease, and the work loop's idle tick renews it. [[spec/design_output/model#a-lease]]
func TestTheIndexLeaseRenewsOffItsWorkLoop(t *testing.T) {
	root := tree(t)
	write(t, root, config.Tracked, `{"watchdog":{"beat":1,"lease":5}}`)
	one, stop, _, err := opens(root, filepath.Join(t.TempDir(), "index.db"), q.New())
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	if one.dog == nil {
		t.Fatal("the index starts no watchdog")
	}
	first, held := one.dog.Lease(leasePart)
	if !held {
		t.Fatalf("the index holds no lease under %s", leasePart)
	}
	for range topicPolls {
		if later, _ := one.dog.Lease(leasePart); later.Renewed.After(first.Renewed) {
			return
		}
		time.Sleep(200 * time.Millisecond)
	}
	t.Fatalf("the lease of %s stands at %v, and the work loop renews nothing", leasePart, first.Renewed)
}

// The door answers the dump text, and the root writes it. [[spec/design_output/model#everything-on-disk-mirrors]]
func TestTheDoorAnswersADumpOfAPrefix(t *testing.T) {
	root := tree(t)
	catalog := q.New()
	q.GivenIn(catalog, "t/n", 4, q.Doc("a count"))
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), catalog)
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	said, err := posts(standing, []string{"dump", "t/"})
	if err != nil {
		t.Fatal(err)
	}
	if text, _ := said.Result.(string); text != "{\n  \"t/n\": 4\n}\n" {
		t.Fatalf("the dump of t/ answers %#v, %q", said.Result, said.Error)
	}
}
