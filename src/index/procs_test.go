// A placed process that dies leaves its names at their built-in values,
// marked not provided, and its next commit clears the mark. The fake IO
// process is this test binary, run again with the bus in its environment.
// [[spec/design_output/model#a-process-ends]]
package index // level0: InPackageTest - it declares the fakeStore, until and read helpers placements share

import (
	"flag"
	"os"
	"sync"
	"testing"
	"time"

	"quackitect/src/q"
)

// The fake IO process: it commits its pid and a value, and runs until a kill. It runs only where a placed process spawns it. [[spec/design_output/model#a-process-ends]]
func TestFakeIOProcess(t *testing.T) {
	t.Parallel()
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
	t.Parallel()
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
	t.Parallel()
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

// A crash in one placed process leaves every other one running and answering. [[spec/tickets/the-split-deployment-takes-over]]
func TestAKilledPlacedProcessLeavesTheOthersAnswering(t *testing.T) {
	t.Parallel()
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	store, hand := fakeStore(t)
	fake := Placed{Name: "fake", Command: []string{os.Args[0], "-test.run=^TestFakeIOProcess$", "fake"}, Instances: map[string]q.Writer{"fake": hand}, Restart: time.Hour}
	other := Placed{Name: "other", Command: []string{os.Args[0], "-test.run=^TestFakeIOProcess$", "other"}, Instances: map[string]q.Writer{"other": hand}, Restart: time.Hour}
	stop, err := NewPlacements(bus, store, []Placed{fake, other}).Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	until(t, store, "both fakes at 7", func(snap q.Snapshot) bool { return snap.Read("fake/out") == 7 && snap.Read("other/out") == 7 })
	kills(t, read(store, "fake/pid"))
	until(t, store, "fake/out not provided", func(snap q.Snapshot) bool { return snap.NotProvided("fake/out") })
	// An exit marks a process's names down, so other's names standing provided past a wait say its process runs. [[spec/design_output/model#a-process-ends]]
	time.Sleep(300 * time.Millisecond)
	if snap := store.Snapshot(); snap.Read("other/out") != 7 || snap.NotProvided("other/out") || snap.NotProvided("other/pid") {
		t.Fatalf("other/out reads %v after the kill of fake, and wants 7, provided", snap.Read("other/out"))
	}
}

// A reader settling the placements reads what a process commits at its spawn, and a stopped placement waits on nothing. [[spec/tickets/the-split-deployment-takes-over]]
func TestASettleWaitsForThePlacedProcessToAnswer(t *testing.T) {
	t.Parallel()
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	store, hand := fakeStore(t)
	fake := Placed{Name: "fake", Command: []string{os.Args[0], "-test.run=^TestFakeIOProcess$", "fake"}, Instances: map[string]q.Writer{"fake": hand}, Restart: time.Hour}
	placements := NewPlacements(bus, store, []Placed{fake})
	stop, err := placements.Start()
	if err != nil {
		t.Fatal(err)
	}
	placements.Settle(20 * time.Second)
	if got := read(store, "fake/out"); got != 7 {
		t.Fatalf("fake/out reads %v once the settle ends, and wants 7", got)
	}
	stop()
	began := time.Now()
	placements.Settle(time.Hour)
	if gone := time.Since(began); gone > time.Second {
		t.Fatalf("a stopped placement holds the settle for %v", gone)
	}
}

// A run sent to a process that exited holds no reader, since nothing answers it until the restart. [[spec/tickets/the-split-deployment-takes-over]]
func TestASettleWaitsOnNoProcessStandingDown(t *testing.T) {
	t.Parallel()
	store, source, bus, placed := doublerPlaced(t)
	placed.Command = []string{os.Args[0], "-test.run=^$"}
	placements := NewPlacements(bus, store, []Placed{placed})
	stop, err := placements.Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	placements.Settle(20 * time.Second)
	if _, err := store.Commit(store.Snapshot().Revision, source, map[string]any{"source/all": 21}); err != nil {
		t.Fatal(err)
	}
	began := time.Now()
	placements.Settle(5 * time.Second)
	if gone := time.Since(began); gone > time.Second {
		t.Fatalf("a run of the exited doubler holds the settle for %v", gone)
	}
}

// A dog that counts holds and faults, and refuses every restart. [[spec/tickets/watchdogs-span-the-processes]]
type refusingDog struct {
	mu     sync.Mutex
	holds  int
	faults int
	drops  int
}

func (d *refusingDog) Hold(string, time.Duration) { d.mu.Lock(); d.holds++; d.mu.Unlock() }
func (d *refusingDog) Beat(string)                {}
func (d *refusingDog) Expired(func(string)) func() {
	return func() { d.mu.Lock(); d.drops++; d.mu.Unlock() }
}
func (d *refusingDog) Fault(string, error) (time.Duration, bool) {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.faults++
	return 0, false
}

func (d *refusingDog) counts() (int, int) {
	d.mu.Lock()
	defer d.mu.Unlock()
	return d.holds, d.faults
}

func TestAPlacedProcessHoldsItsLeaseAndStaysDownWhereTheDogRefusesARestart(t *testing.T) {
	t.Parallel()
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	store, hand := fakeStore(t)
	dog := &refusingDog{}
	placed := Placed{Name: "io", Command: []string{os.Args[0], "-test.run=^TestFakeIOProcess$"}, Instances: map[string]q.Writer{"fake": hand}, Restart: 10 * time.Millisecond, Watch: dog, Term: time.Hour}
	stop, err := placed.Start(bus, store)
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	until(t, store, "fake/out at 7", func(snap q.Snapshot) bool { return snap.Read("fake/out") == 7 })
	kills(t, read(store, "fake/pid"))
	until(t, store, "fake/out not provided", func(snap q.Snapshot) bool { return snap.NotProvided("fake/out") })
	time.Sleep(200 * time.Millisecond)
	if holds, faults := dog.counts(); holds != 1 || faults != 1 || !store.Snapshot().NotProvided("fake/out") {
		t.Fatalf("the dog hears %d hold(s) and %d fault(s), and wants one of each with the process left down", holds, faults)
	}
	stop()
	dog.mu.Lock()
	defer dog.mu.Unlock()
	if dog.drops != 1 {
		t.Fatalf("the stop drops %d expiry hand(s), and wants one", dog.drops)
	}
}

func TestTheNextCommitOfARestartedProcessClearsTheMark(t *testing.T) {
	t.Parallel()
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
