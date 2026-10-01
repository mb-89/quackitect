// A placed process that dies leaves its names at their built-in values,
// marked not provided, and its next commit clears the mark. The fake IO
// process is this test binary, run again with the bus in its environment.
// [[spec/design_output/model#a-process-ends]]
package index

import (
	"flag"
	"os"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
)

// The fake IO process: it commits its pid and a value, and runs until a kill. It runs only where a placed process spawns it. [[spec/design_output/model#a-process-ends]]
func TestFakeIOProcess(t *testing.T) {
	if os.Getenv(BusEnv) == "" {
		return
	}
	peer, err := Dial(os.Getenv(BusEnv), os.Getenv(TokenEnv))
	if err != nil {
		os.Exit(3)
	}
	instance := "fake"
	if flag.NArg() > 0 {
		instance = flag.Arg(0)
	}
	if err := peer.Commit(instance, map[string]any{instance + "/pid": os.Getpid(), instance + "/out": 7}); err != nil {
		os.Exit(4)
	}
	for {
		time.Sleep(time.Hour)
	}
}

// The fake module process: it dials the bus and commits nothing, so the index's side alone decides a case. [[spec/design_output/model#the-placements]]
func TestFakeIdleProcess(t *testing.T) {
	if os.Getenv(BusEnv) == "" {
		return
	}
	if _, err := Dial(os.Getenv(BusEnv), os.Getenv(TokenEnv)); err != nil {
		os.Exit(3)
	}
	for {
		time.Sleep(time.Hour)
	}
}

// A store whose wiring loads the fake instance, and the writer it commits as. [[spec/design_output/model#a-process-ends]]
func fakeStore(t *testing.T) (*q.Store, q.Writer) {
	t.Helper()
	var hand q.Writer
	types := map[string]func(*q.Catalog){"fakeio": func(c *q.Catalog) {
		hand = q.Join(hand, q.OutIn(c, "pid", 0, q.IO(), q.Doc("the fake's pid")), q.OutIn(c, "out", 0, q.IO(), q.Doc("the fake's value")))
	}}
	store, err := q.Start(q.Wiring{Instances: []q.Instance{{Name: "fake", Module: "fakeio"}, {Name: "other", Module: "fakeio"}}}, types)
	if err != nil {
		t.Fatal(err)
	}
	return store, hand
}

// Polls the store until held answers true of a snapshot taken for that poll alone, or fails the case past the wait. [[spec/tickets/fake-snapshot-stays-in-case]]
func until(t *testing.T, store *q.Store, what string, held func(q.Snapshot) bool) {
	t.Helper()
	for end := time.Now().Add(20 * time.Second); time.Now().Before(end); time.Sleep(20 * time.Millisecond) {
		if held(store.Snapshot()) {
			return
		}
	}
	t.Fatalf("%s holds nowhere within the wait", what)
}

// Runs the fake IO process under a placement, and answers the store and the stop. [[spec/design_output/model#a-process-ends]]
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

func read(store *q.Store, name string) any { return store.Snapshot().Read(name) }

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
	until(t, store, "fake/out at 7", func(snap q.Snapshot) bool { return snap.Read("fake/out") == 7 })
	kills(t, read(store, "fake/pid"))
	until(t, store, "fake/out not provided", func(snap q.Snapshot) bool {
		return snap.Read("fake/out") == 0 && snap.NotProvided("fake/out") && snap.NotProvided("fake/pid")
	})
	if said, err := store.Why("fake/out"); err != nil || said.State != "not provided" {
		t.Fatalf("why fake/out reads %q and %v", said.State, err)
	}
}

func TestTheNextCommitOfARestartedProcessClearsTheMark(t *testing.T) {
	store, stop := placedFake(t, 50*time.Millisecond)
	defer stop()
	until(t, store, "fake/out at 7", func(snap q.Snapshot) bool { return snap.Read("fake/out") == 7 })
	first := read(store, "fake/pid")
	kills(t, first)
	until(t, store, "a second fake committing", func(snap q.Snapshot) bool {
		pid := snap.Read("fake/pid")
		return pid != first && pid != 0 && !snap.NotProvided("fake/out") && snap.Read("fake/out") == 7
	})
}

// Two fakes placed apart, each its own process, and the store they commit to. [[spec/design_output/model#the-placements]]
func placedTwo(t *testing.T) (*q.Store, *Placements, func()) {
	t.Helper()
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	store, hand := fakeStore(t)
	one := func(instance, topic string) Placed {
		return Placed{Name: instance, Command: []string{os.Args[0], "-test.run=^TestFakeIOProcess$", "--", instance}, Instances: map[string]q.Writer{instance: hand}, Restart: 50 * time.Millisecond, Topics: []string{topic}}
	}
	placements := NewPlacements(bus, store, []Placed{one("fake", "fakeio"), one("other", "otherio")})
	stop, err := placements.Start()
	if err != nil {
		bus.Close()
		t.Fatal(err)
	}
	until(t, store, "both fakes at 7", func(snap q.Snapshot) bool { return snap.Read("fake/out") == 7 && snap.Read("other/out") == 7 })
	return store, placements, func() { stop(); bus.Close() }
}

func TestAKilledModuleProcessRestartsAloneAndTheIndexStaysWarm(t *testing.T) {
	store, _, stop := placedTwo(t)
	defer stop()
	other, first := read(store, "other/pid"), read(store, "fake/pid")
	before := store.Snapshot().Revision
	kills(t, first)
	until(t, store, "the killed fake back", func(snap q.Snapshot) bool {
		pid := snap.Read("fake/pid")
		return pid != first && pid != 0 && snap.Read("fake/out") == 7
	})
	snap := store.Snapshot()
	if snap.Read("other/pid") != other || snap.NotProvided("other/out") || snap.Read("other/out") != 7 {
		t.Fatalf("the other process reads pid %v and out %v, where it ran %v throughout", snap.Read("other/pid"), snap.Read("other/out"), other)
	}
	if snap.Revision <= before {
		t.Fatalf("the store stands at revision %d after the restart, where it stood at %d", snap.Revision, before)
	}
}

type twiceOf struct {
	All int `q:"all"`
}

func TestPlacementsAnswerInputsAndRunOnAMove(t *testing.T) {
	var source q.Writer
	types := map[string]func(*q.Catalog){
		"source": func(c *q.Catalog) { source = q.OutIn(c, "all", 0, q.IO(), q.Doc("the source's count")) },
		"doubler": func(c *q.Catalog) {
			q.DerivedIn(c, "twice", 0, func(in twiceOf) int { return 2 * in.All }, q.Doc("twice the count"))
		},
	}
	w := q.Wiring{Instances: []q.Instance{{Name: "source", Module: "source"}, {Name: "doubler", Module: "doubler"}}, Wires: map[string]string{"doubler.all": "source.all"}}
	store, err := q.Start(w, types)
	if err != nil {
		t.Fatal(err)
	}
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	placed := Placed{Name: "doubler", Command: []string{os.Args[0], "-test.run=^TestFakeIdleProcess$"}, Instances: map[string]q.Writer{"doubler": {}}, Restart: time.Hour, Topics: []string{"doubler"}}
	stop, err := NewPlacements(bus, store, []Placed{placed}).Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	peer, err := Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatal(err)
	}
	defer peer.Close()
	runs := make(chan struct{}, 1)
	done, err := peer.Runs("doubler", func() {
		select {
		case runs <- struct{}{}:
		default:
		}
	})
	if err != nil {
		t.Fatalf("the run subject meets %v", err)
	}
	defer done()
	if _, err := store.Commit(store.Snapshot().Revision, source, map[string]any{"source/all": 21}); err != nil {
		t.Fatal(err)
	}
	select {
	case <-runs:
	case <-time.After(10 * time.Second):
		t.Fatal("a move of source/all publishes no run of doubler")
	}
	saved, err := peer.Inputs("doubler")
	if err != nil {
		t.Fatalf("the inputs of doubler meet %v", err)
	}
	if !strings.Contains(string(saved), `"source/all"`) || !strings.Contains(string(saved), "21") {
		t.Fatalf("the index answers the inputs of doubler with %s", saved)
	}
}

func TestAPlacementRestartsTheProcessesOfOneTopic(t *testing.T) {
	store, placements, stop := placedTwo(t)
	defer stop()
	other, first := read(store, "other/pid"), read(store, "fake/pid")
	if err := placements.Restart("fakeio"); err != nil {
		t.Fatal(err)
	}
	until(t, store, "the fake restarted", func(snap q.Snapshot) bool {
		pid := snap.Read("fake/pid")
		return pid != first && pid != 0
	})
	if got := read(store, "other/pid"); got != other {
		t.Fatalf("the other process runs as %v, where the restart of fakeio leaves it at %v", got, other)
	}
}
