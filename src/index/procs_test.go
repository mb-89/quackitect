// A placed process that dies leaves its names at their built-in values,
// marked not provided, and its next commit clears the mark. The fake IO
// process is this test binary, run again with the bus in its environment.
// [[spec/design_output/processes#a-process-ends]]
package index

import (
	"os"
	"testing"
	"time"

	"quackitect/src/q"
)

// The fake IO process: it commits its pid and a value, and runs until a kill. It runs only where a placed process spawns it. [[spec/design_output/processes#a-process-ends]]
func TestFakeIOProcess(t *testing.T) {
	if os.Getenv(BusEnv) == "" {
		return
	}
	peer, err := Dial(os.Getenv(BusEnv), os.Getenv(TokenEnv))
	if err != nil {
		os.Exit(3)
	}
	if err := peer.Commit("fake", map[string]any{"fake/pid": os.Getpid(), "fake/out": 7}); err != nil {
		os.Exit(4)
	}
	for {
		time.Sleep(time.Hour)
	}
}

// A store whose wiring loads the fake instance, and the writer it commits as. [[spec/design_output/processes#a-process-ends]]
func fakeStore(t *testing.T) (*q.Store, q.Writer) {
	t.Helper()
	var hand q.Writer
	types := map[string]func(*q.Catalog){"fakeio": func(c *q.Catalog) {
		hand = q.Join(q.OutIn(c, "pid", 0, q.IO(), q.Doc("the fake's pid")), q.OutIn(c, "out", 0, q.IO(), q.Doc("the fake's value")))
	}}
	store, err := q.Start(q.Wiring{Instances: []q.Instance{{Name: "fake", Module: "fakeio"}}}, types)
	if err != nil {
		t.Fatal(err)
	}
	return store, hand
}

// Polls the store until held answers true, or fails the case past the wait. [[spec/design_output/processes#a-process-ends]]
func until(t *testing.T, what string, held func(q.Snapshot) bool) {
	t.Helper()
	for end := time.Now().Add(20 * time.Second); time.Now().Before(end); time.Sleep(20 * time.Millisecond) {
		if held(fakeSnap) {
			return
		}
	}
	t.Fatalf("%s holds nowhere within the wait", what)
}

var fakeSnap q.Snapshot

// Runs the fake IO process under a placement, and answers the store and the stop. [[spec/design_output/processes#a-process-ends]]
func placedFake(t *testing.T, restart time.Duration) (*q.Store, func()) {
	t.Helper()
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	store, hand := fakeStore(t)
	placed := Placed{Name: "io", Command: []string{os.Args[0], "-test.run=^TestFakeIOProcess$"}, Instances: map[string]q.Writer{"fake": hand}, Restart: restart}
	stop, err := placed.Start(bus, store)
	if err != nil {
		bus.Close()
		t.Fatal(err)
	}
	return store, func() { stop(); bus.Close() }
}

func read(store *q.Store, name string) any {
	fakeSnap = store.Snapshot()
	return fakeSnap.Read(name)
}

func kills(t *testing.T, pid any) {
	t.Helper()
	number, ok := pid.(int)
	if !ok || number == 0 {
		t.Fatalf("the fake commits no pid: %v", pid)
	}
	one, err := os.FindProcess(number)
	if err != nil {
		t.Fatal(err)
	}
	if err := one.Kill(); err != nil {
		t.Fatal(err)
	}
}

func TestAKilledFakeIOProcessLeavesItsNamesNotProvided(t *testing.T) {
	store, stop := placedFake(t, time.Hour)
	defer stop()
	until(t, "fake/out at 7", func(q.Snapshot) bool { return read(store, "fake/out") == 7 })
	kills(t, read(store, "fake/pid"))
	until(t, "fake/out not provided", func(q.Snapshot) bool {
		return read(store, "fake/out") == 0 && fakeSnap.NotProvided("fake/out") && fakeSnap.NotProvided("fake/pid")
	})
	if said, err := store.Why("fake/out"); err != nil || said.State != "not provided" {
		t.Fatalf("why fake/out reads %q and %v", said.State, err)
	}
}

func TestTheNextCommitOfARestartedProcessClearsTheMark(t *testing.T) {
	store, stop := placedFake(t, 50*time.Millisecond)
	defer stop()
	until(t, "fake/out at 7", func(q.Snapshot) bool { return read(store, "fake/out") == 7 })
	first := read(store, "fake/pid")
	kills(t, first)
	until(t, "a second fake committing", func(q.Snapshot) bool {
		pid := read(store, "fake/pid")
		return pid != first && pid != 0 && !fakeSnap.NotProvided("fake/out") && fakeSnap.Read("fake/out") == 7
	})
}
