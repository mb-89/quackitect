// A placed process that dies leaves its names at their built-in values,
// marked not provided, and its next commit clears the mark. The fake IO
// process is this test binary, run again with the bus in its environment.
// [[spec/design_output/model#a-process-ends]]
package index

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

// The fake silent process: it commits its pid, beats its lease once, and then lives on without a beat. [[spec/tickets/watchdogs-span-the-processes]]
func TestFakeSilentProcess(t *testing.T) {
	if os.Getenv(BusEnv) == "" {
		return
	}
	peer, err := Dial(os.Getenv(BusEnv), os.Getenv(TokenEnv))
	if err != nil {
		os.Exit(3)
	}
	instance := flag.Arg(0)
	if err := peer.Commit(instance, map[string]any{instance + "/pid": os.Getpid(), instance + "/out": 7}); err != nil {
		os.Exit(4)
	}
	_ = peer.Beat(instance)
	for {
		time.Sleep(time.Hour)
	}
}

// A dog over the wall clock: a lease expires past its term, and a second fault raises the alarm, which stops the restarts. [[spec/design_output/model#restarts]]
type fakeLeases struct {
	mu      sync.Mutex
	terms   map[string]time.Duration
	renewed map[string]time.Time
	faults  map[string]int
	hands   []func(string)
	stop    chan struct{}
}

func newFakeLeases() *fakeLeases {
	one := &fakeLeases{terms: map[string]time.Duration{}, renewed: map[string]time.Time{}, faults: map[string]int{}, stop: make(chan struct{})}
	go func() {
		for {
			select {
			case <-one.stop:
				return
			case <-time.After(10 * time.Millisecond):
				one.check()
			}
		}
	}()
	return one
}

func (f *fakeLeases) Hold(part string, term time.Duration) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.terms[part], f.renewed[part] = term, time.Now()
}

func (f *fakeLeases) Beat(part string) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if _, held := f.terms[part]; held {
		f.renewed[part] = time.Now()
	}
}

func (f *fakeLeases) Fault(part string, _ error) (time.Duration, bool) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.faults[part]++
	return 10 * time.Millisecond, f.faults[part] < 2
}

func (f *fakeLeases) Expired(hand func(part string)) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.hands = append(f.hands, hand)
}

func (f *fakeLeases) check() {
	f.mu.Lock()
	expired := []string{}
	for part, term := range f.terms {
		if time.Since(f.renewed[part]) > term {
			expired = append(expired, part)
			f.renewed[part] = time.Now()
		}
	}
	hands := append([]func(string){}, f.hands...)
	f.mu.Unlock()
	for _, part := range expired {
		for _, hand := range hands {
			hand(part)
		}
	}
}

func (f *fakeLeases) faultsOf(part string) int {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.faults[part]
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

func TestASilentModuleProcessRestartsAndRaisesAnAlarm(t *testing.T) {
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	store, hand := fakeStore(t)
	leases := newFakeLeases()
	defer close(leases.stop)
	placed := Placed{Name: "fake", Command: []string{os.Args[0], "-test.run=^TestFakeSilentProcess$", "--", "fake"}, Instances: map[string]q.Writer{"fake": hand}, Restart: time.Hour, Watch: leases, Term: 200 * time.Millisecond}
	stop, err := NewPlacements(bus, store, []Placed{placed}).Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	until(t, store, "fake/out at 7", func(snap q.Snapshot) bool { return snap.Read("fake/out") == 7 })
	first := read(store, "fake/pid")
	until(t, store, "the silent fake restarted", func(snap q.Snapshot) bool {
		pid := snap.Read("fake/pid")
		return pid != first && pid != 0
	})
	for end := time.Now().Add(10 * time.Second); leases.faultsOf("fake") < 2 && time.Now().Before(end); time.Sleep(20 * time.Millisecond) {
	}
	if got := leases.faultsOf("fake"); got < 2 {
		t.Fatalf("the dog counts %d fault(s) of the silent fake, and wants the second that raises the alarm", got)
	}
}
