// A placed process that dies leaves its names at their built-in values,
// marked not provided, and its next commit clears the mark. The fake IO
// process runs in memory through the fake spawn, with the bus in its environment.
// [[spec/design_output/model#a-process-ends]]
package index // level0: InPackageTest - it declares the fakeStore, until and read helpers placements share

import (
	"errors"
	"runtime"
	"strings"
	"sync"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The processes a case runs in memory in place of a spawn: each runs what its command names over the bus its environment names, under a pid of its own, until its kill. [[spec/tickets/test-walks-move-onto-fakes]]
type fakeProcs struct {
	mu      sync.Mutex
	pid     int
	running map[int]func()
	spawned int
}

// The first pid a fake process takes. [[spec/tickets/test-walks-move-onto-fakes]]
const firstFakePid = 1000

func newFakeProcs() *fakeProcs {
	return &fakeProcs{pid: firstFakePid, running: map[int]func(){}}
}

// The commands the fake spawn runs: fakeio commits its pid and 7 under the instance its second word names and runs until its kill, idle dials the bus and commits nothing, and exits ends at once. [[spec/tickets/test-walks-move-onto-fakes]]
func (f *fakeProcs) Spawn(command, env []string) (Process, error) {
	f.mu.Lock()
	f.pid++
	f.spawned++
	pid := f.pid
	killed := make(chan struct{})
	var once sync.Once
	kill := func() { once.Do(func() { close(killed) }) }
	f.running[pid] = kill
	f.mu.Unlock()
	exited := make(chan error, 1)
	go func() {
		err := runsFake(command, env, pid, killed)
		f.mu.Lock()
		delete(f.running, pid)
		f.mu.Unlock()
		exited <- err
	}()
	return Process{Kill: kill, Exited: exited}, nil
}

func runsFake(command, env []string, pid int, killed <-chan struct{}) error {
	if command[0] == "exits" {
		return nil
	}
	vars := map[string]string{}
	for _, one := range env {
		key, value, _ := strings.Cut(one, "=")
		vars[key] = value
	}
	peer, err := Dial(vars[BusEnv], vars[TokenEnv])
	if err != nil {
		return err
	}
	defer peer.Close()
	if command[0] == "fakeio" {
		instance := command[1]
		if err := peer.Commit(instance, map[string]any{instance + "/pid": pid, instance + "/out": 7}); err != nil {
			return err
		}
	}
	<-killed
	return errors.New("signal: killed")
}

// Kills the fake process the pid names. [[spec/tickets/test-walks-move-onto-fakes]]
func (f *fakeProcs) kills(t *testing.T, pid any) {
	t.Helper()
	number, ok := pid.(int)
	f.mu.Lock()
	kill := f.running[number]
	f.mu.Unlock()
	if !ok || kill == nil {
		t.Fatalf("the fake commits no pid that runs: %v", pid)
	}
	kill()
}

// Whether the fake process the pid names still runs. [[spec/tickets/test-walks-move-onto-fakes]]
func (f *fakeProcs) runs(pid any) bool {
	number, _ := pid.(int)
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.running[number] != nil
}

// How many processes the fake spawn started. [[spec/tickets/test-walks-move-onto-fakes]]
func (f *fakeProcs) count() int {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.spawned
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

// Looks at the store until held answers true of a snapshot taken for that look alone, yielding between looks; the run's -timeout bounds a hold that stays false. [[spec/tickets/fake-snapshot-stays-in-case]]
func until(t *testing.T, store *q.Store, what string, held func(q.Snapshot) bool) {
	t.Helper()
	t.Logf("waiting on %s", what)
	for !held(store.Snapshot()) {
		runtime.Gosched()
	}
}

// Runs the fake IO process under a placement, and answers the store, the processes and the stop. [[spec/design_output/model#a-process-ends]]
func placedFake(t *testing.T, restart time.Duration) (*q.Store, *fakeProcs, func()) {
	t.Helper()
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	store, hand := fakeStore(t)
	procs := newFakeProcs()
	placed := Placed{Name: "io", Command: []string{"fakeio", "fake"}, Instances: map[string]q.Writer{"fake": hand}, Restart: restart, clock: qtest.NewFake(time.Time{}), Spawn: procs.Spawn}
	stop, err := placed.Start(bus, store)
	if err != nil {
		bus.Close()
		t.Fatal(err)
	}
	return store, procs, func() { stop(); bus.Close() }
}

func read(store *q.Store, name string) any { return store.Snapshot().Read(name) }

func TestAKilledFakeIOProcessLeavesItsNamesNotProvided(t *testing.T) {
	t.Parallel()
	store, procs, stop := placedFake(t, time.Hour)
	defer stop()
	until(t, store, "fake/out at 7", func(snap q.Snapshot) bool { return snap.Read("fake/out") == 7 })
	procs.kills(t, read(store, "fake/pid"))
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
	procs := newFakeProcs()
	fake := Placed{Name: "fake", Command: []string{"fakeio", "fake"}, Instances: map[string]q.Writer{"fake": hand}, Restart: time.Hour, Spawn: procs.Spawn}
	other := Placed{Name: "other", Command: []string{"fakeio", "other"}, Instances: map[string]q.Writer{"other": hand}, Restart: time.Hour, Spawn: procs.Spawn}
	placements := NewPlacements(qtest.NewFake(time.Time{}), bus, store, []Placed{fake, other})
	placements.gap = 0
	stop, err := placements.Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	until(t, store, "both fakes at 7", func(snap q.Snapshot) bool { return snap.Read("fake/out") == 7 && snap.Read("other/out") == 7 })
	procs.kills(t, read(store, "fake/pid"))
	until(t, store, "fake/out not provided", func(snap q.Snapshot) bool { return snap.NotProvided("fake/out") })
	// An exit marks a process's names down, so other's process still running and its names provided say the kill reached fake alone. [[spec/design_output/model#a-process-ends]]
	if !procs.runs(read(store, "other/pid")) {
		t.Fatal("the kill of fake ends other's process too")
	}
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
	procs := newFakeProcs()
	fake := Placed{Name: "fake", Command: []string{"fakeio", "fake"}, Instances: map[string]q.Writer{"fake": hand}, Restart: time.Hour, Spawn: procs.Spawn}
	placements := NewPlacements(qtest.NewFake(time.Time{}), bus, store, []Placed{fake})
	stop, err := placements.Start()
	if err != nil {
		t.Fatal(err)
	}
	placements.Settle(20 * time.Second)
	if got := read(store, "fake/out"); got != 7 {
		t.Fatalf("fake/out reads %v once the settle ends, and wants 7", got)
	}
	stop()
	placements.Settle(time.Hour)
}

// A run sent to a process that exited holds no reader, since nothing answers it until the restart. [[spec/tickets/the-split-deployment-takes-over]]
func TestASettleWaitsOnNoProcessStandingDown(t *testing.T) {
	t.Parallel()
	store, source, bus, placed := doublerPlaced(t)
	placed.Command = []string{"exits"}
	placements := NewPlacements(qtest.NewFake(time.Time{}), bus, store, []Placed{placed})
	stop, err := placements.Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	placements.Settle(20 * time.Second)
	if _, err := store.Commit(store.Snapshot().Revision, source, map[string]any{"source/all": 21}); err != nil {
		t.Fatal(err)
	}
	placements.Settle(5 * time.Second)
}

// A dog that counts holds and faults, refuses every restart, and tells each fault. [[spec/tickets/watchdogs-span-the-processes]]
type refusingDog struct {
	mu      sync.Mutex
	holds   int
	faults  int
	drops   int
	faulted chan struct{}
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
	select {
	case d.faulted <- struct{}{}:
	default:
	}
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
	dog := &refusingDog{faulted: make(chan struct{}, 1)}
	procs := newFakeProcs()
	placed := Placed{Name: "io", Command: []string{"fakeio", "fake"}, Instances: map[string]q.Writer{"fake": hand}, Restart: 10 * time.Millisecond, Watch: dog, Term: time.Hour, clock: qtest.NewFake(time.Time{}), Spawn: procs.Spawn}
	stop, err := placed.Start(bus, store)
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	until(t, store, "fake/out at 7", func(snap q.Snapshot) bool { return snap.Read("fake/out") == 7 })
	procs.kills(t, read(store, "fake/pid"))
	<-dog.faulted
	if !store.Snapshot().NotProvided("fake/out") {
		t.Fatal("the killed process's names stand provided once the dog hears its fault")
	}
	stop()
	if holds, faults := dog.counts(); holds != 1 || faults != 1 || procs.count() != 1 || !store.Snapshot().NotProvided("fake/out") {
		t.Fatalf("the dog hears %d hold(s) and %d fault(s) over %d spawn(s), and wants one of each with the process left down", holds, faults, procs.count())
	}
	dog.mu.Lock()
	defer dog.mu.Unlock()
	if dog.drops != 1 {
		t.Fatalf("the stop drops %d expiry hand(s), and wants one", dog.drops)
	}
}

func TestTheNextCommitOfARestartedProcessClearsTheMark(t *testing.T) {
	t.Parallel()
	store, procs, stop := placedFake(t, 0)
	defer stop()
	until(t, store, "fake/out at 7", func(snap q.Snapshot) bool { return snap.Read("fake/out") == 7 })
	first := read(store, "fake/pid")
	procs.kills(t, first)
	until(t, store, "a second fake committing", func(snap q.Snapshot) bool {
		pid := snap.Read("fake/pid")
		return pid != first && pid != 0 && !snap.NotProvided("fake/out") && snap.Read("fake/out") == 7
	})
}
