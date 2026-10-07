// quack io publishes what its instances commit over the bus, and the watchdogs
// span the processes.
// [[spec/design_output/model#the-io-process]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"flag"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/clock"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
)

// The lease a silent fake holds, the dog over it, the poll of the wait on its real process, and the room the wait leaves under the suite's deadline for the report, which both alarm cases share. [[spec/tickets/lease-waits-meet-a-fake-clock]] [[spec/tickets/cold-runner-waits-meet-readiness]]
const (
	silentTerm   = 200 * time.Millisecond
	silentPoll   = 20 * time.Millisecond
	silentMargin = 5 * time.Second
	silentMark   = "fake/run"
)

var silentDog = manager.DogSettings{First: 10 * time.Millisecond, Cap: 20 * time.Millisecond, Faults: 2, Window: time.Minute}

// Places one silent fake process under a dog on a fake clock, and polls until held answers true. The clock moves past the lease on each poll while the run the fake last committed stands unexpired, so a slow spawn counts against no lease, and a beat landing late meets the next tick. A run commits a mark of its own, because Windows hands a killed process's pid to the next one. The alarm stops the restarts, so the wait ends on it. The process and the bus stay real, so this is the door test of a placed process. [[spec/tickets/lease-waits-meet-a-fake-clock]] [[spec/tickets/cold-runner-waits-meet-readiness]]
func silentRun(t *testing.T, part, fake, wants string, held func(snap q.Snapshot, runs int) bool) {
	t.Helper()
	c := q.New()
	as := manager.Registers(c)
	hand := q.OutIn(c, silentMark, 0, q.IO(), q.Doc("the fake's run, a mark no other run commits"))
	if faults := c.Check(); len(faults) > 0 {
		t.Fatalf("the catalog refuses: %v", faults)
	}
	store := q.NewStore(c)
	at := clock.NewFake(time.Now())
	dog := manager.NewDog(at.Now, store, as, silentDog)
	bus, err := index.StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	placed := index.Placed{Name: part, Command: []string{os.Args[0], "-test.run=^" + fake + "$", "--", part}, Instances: map[string]q.Writer{"fake": hand}, Restart: time.Hour, Watch: dog, Term: silentTerm}
	stop, err := index.NewPlacements(bus, store, []index.Placed{placed}).Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	runs, expired := map[any]bool{}, map[any]bool{}
	for end := silentEnd(t); end.IsZero() || time.Now().Before(end); time.Sleep(silentPoll) {
		snap := store.Snapshot()
		run := snap.Read(silentMark)
		if run != 0 {
			runs[run] = true
		}
		if held(snap, len(runs)) {
			return
		}
		if alarms, _ := snap.Read(manager.AlarmsName).([]manager.Alarm); len(alarms) > 0 {
			break
		}
		if run != 0 && !expired[run] {
			at.Tick(silentTerm + time.Millisecond)
			if slices.Contains(dog.Check(), part) {
				expired[run] = true
			}
		}
	}
	t.Fatalf("the silent fake runs %d time(s), and session/alarms reads %v: wants %s", len(runs), store.Snapshot().Read(manager.AlarmsName), wants)
}

// The end of the wait on the real process: the suite's deadline less the margin, or none where the run sets no timeout. A loaded box slows the spawns and turns the case red on a hang alone. [[spec/tickets/cold-runner-waits-meet-readiness]]
func silentEnd(t *testing.T) time.Time {
	if end, ok := t.Deadline(); ok {
		return end.Add(-silentMargin)
	}
	return time.Time{}
}

// The fake silent IO process: it commits its run, beats its lease once, and then lives on without a beat. [[spec/tickets/watchdogs-span-the-processes]]
func TestFakeSilentIO(t *testing.T) {
	t.Parallel()
	if os.Getenv(index.BusEnv) == "" {
		return
	}
	peer, err := index.Dial(os.Getenv(index.BusEnv), os.Getenv(index.TokenEnv))
	if err != nil {
		os.Exit(3)
	}
	if err := peer.Commit("fake", map[string]any{silentMark: time.Now().UnixNano()}); err != nil {
		os.Exit(4)
	}
	_ = peer.Beat(flag.Arg(0))
	for {
		time.Sleep(time.Hour)
	}
}

func TestASilentIOProcessReadsInTheAlarms(t *testing.T) {
	t.Parallel()
	silentRun(t, ioPart, "TestFakeSilentIO", "the silent IO process", func(snap q.Snapshot, _ int) bool {
		alarms, _ := snap.Read(manager.AlarmsName).([]manager.Alarm)
		return len(alarms) == 1 && alarms[0].Part == ioPart
	})
}

// The fake silent module process: it commits its run, beats its lease once, and then lives on without a beat. [[spec/tickets/module-silence-reads-alarms]]
func TestFakeSilentModule(t *testing.T) {
	t.Parallel()
	if os.Getenv(index.BusEnv) == "" {
		return
	}
	peer, err := index.Dial(os.Getenv(index.BusEnv), os.Getenv(index.TokenEnv))
	if err != nil {
		os.Exit(3)
	}
	if err := peer.Commit("fake", map[string]any{silentMark: time.Now().UnixNano()}); err != nil {
		os.Exit(4)
	}
	_ = peer.Beat(flag.Arg(0))
	for {
		time.Sleep(time.Hour)
	}
}

func TestASilentModuleProcessRestartsAndRaisesAnAlarm(t *testing.T) {
	t.Parallel()
	silentRun(t, "fake", "TestFakeSilentModule", "a restart, then the alarm", func(snap q.Snapshot, runs int) bool {
		alarms, _ := snap.Read(manager.AlarmsName).([]manager.Alarm)
		return runs > 1 && len(alarms) == 1 && alarms[0].Part == "fake"
	})
}

type readsAll struct {
	All int `q:"all"`
}

// A store where reader reads the wire source provides. [[spec/tickets/quack-io-answers-no-run]]
func ioOnAWire(t *testing.T) *q.Store {
	t.Helper()
	w := q.Wiring{Instances: []q.Instance{{Name: "source", Module: "source"}, {Name: "reader", Module: "reader"}}, Wires: map[string]string{"reader.all": "source.all"}}
	types := map[string]func(*q.Catalog){
		"source": func(c *q.Catalog) { q.OutIn(c, "all", 0, q.IO(), q.Doc("the source's count")) },
		"reader": func(c *q.Catalog) {
			q.DerivedIn(c, "twice", 0, func(in readsAll) int { return 2 * in.All }, q.Doc("twice the count"))
		},
	}
	store, err := q.Start(w, types)
	if err != nil {
		t.Fatal(err)
	}
	return store
}

// quack io answers no run, so an IO instance reading a wire reads as wired, and one reading nothing does not. [[spec/tickets/quack-io-answers-no-run]]
func TestAnIOInstanceReadingAWireReadsAsWired(t *testing.T) {
	t.Parallel()
	if got := wiredIO(ioOnAWire(t), []string{"source", "reader"}); len(got) != 1 || got[0] != "reader" {
		t.Fatalf("the wired IO instances read %v, and want reader alone", got)
	}
}

// The split refuses to start an IO instance on a wire, and names it. [[spec/tickets/start-refuses-wired-io]]
func TestTheSplitRefusesAnIOInstanceOnAWire(t *testing.T) {
	t.Parallel()
	split, err := ioProcesses(t.TempDir(), ioOnAWire(t), doors{io: []string{"source", "reader"}}, nil)
	if err == nil {
		split.Stop()
		t.Fatal("the split starts an IO instance that reads a wire")
	}
	if !strings.Contains(err.Error(), "reader") || strings.Contains(err.Error(), "source") {
		t.Fatalf("the refusal reads %q, and wants reader named alone", err)
	}
}

// The tracked wiring places no IO instance on a wire, so quack io holds no reader. [[spec/tickets/quack-io-answers-no-run]]
func TestTheTrackedWiringWiresNoIOInstance(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	manager.Registers(c)
	if _, _, err := loaded(w, c); err != nil {
		t.Fatal(err)
	}
	if got := wiredIO(q.NewStore(c), ioInstances(w)); len(got) > 0 {
		t.Fatalf("the tracked wiring wires the IO instances %v", got)
	}
}

func TestTheIOProcessWritesARowWhenTheIndexFallsSilent(t *testing.T) {
	t.Parallel()
	bus, err := index.StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	watcher, err := index.Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatal(err)
	}
	defer watcher.Close()
	rows := make(chan map[string]any, 4)
	stop, err := watchesIndex(watcher, 100*time.Millisecond, func(row map[string]any) error { rows <- row; return nil })
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	indexSide, err := index.Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatal(err)
	}
	defer indexSide.Close()
	if err := indexSide.Beat("index"); err != nil {
		t.Fatal(err)
	}
	select {
	case row := <-rows:
		if row["kind"] != "watchdog" || row["part"] != "index" {
			t.Fatalf("the IO process writes %v, and wants a watchdog row naming the index", row)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("the IO process writes no row where the index falls silent")
	}
}

func TestACommitOfIndexHealthBeatsTheIndexLease(t *testing.T) {
	t.Parallel()
	c := q.New()
	as := manager.Registers(c)
	if faults := c.Check(); len(faults) > 0 {
		t.Fatalf("the catalog refuses: %v", faults)
	}
	store := q.NewStore(c)
	bus, err := index.StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	listener, err := index.Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatal(err)
	}
	defer listener.Close()
	heard := make(chan string, 4)
	stop, err := listener.Leases(func(part string) { heard <- part })
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	beating, err := beatsIndex(bus, store)
	if err != nil {
		t.Fatal(err)
	}
	defer beating.Close()
	if _, err := store.Commit(store.Snapshot().Revision, as, map[string]any{manager.HealthName: manager.Lease{Part: indexPart, Renewed: time.Now(), Term: time.Minute}}); err != nil {
		t.Fatal(err)
	}
	select {
	case part := <-heard:
		if part != indexPart {
			t.Fatalf("the health commit beats %q, and wants the index", part)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("the health commit beats nothing")
	}
}

// The hooks door reads the index's lease off index/health. [[spec/tickets/the-split-deployment-takes-over]]
func TestTheHooksDoorReadsTheIndexLease(t *testing.T) {
	t.Parallel()
	c := q.New()
	as := manager.Registers(c)
	if faults := c.Check(); len(faults) > 0 {
		t.Fatalf("the catalog refuses: %v", faults)
	}
	store := q.NewStore(c)
	renewed := time.Date(2026, 10, 2, 12, 0, 0, 0, time.UTC)
	if _, err := store.Commit(store.Snapshot().Revision, as, map[string]any{manager.HealthName: manager.Lease{Part: indexPart, Renewed: renewed, Term: time.Minute}}); err != nil {
		t.Fatal(err)
	}
	health := healthOf(store)
	if at, term, held := health(); !held || !at.Equal(renewed) || term != time.Minute {
		t.Fatalf("the health read answers %v, %v and %v, and wants the committed lease", at, term, held)
	}
}

func TestQuackIOCommitsItsInstancesOverTheBus(t *testing.T) {
	t.Parallel()
	bus, err := index.StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	listener, err := index.Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatalf("the index's side meets %v", err)
	}
	defer listener.Close()
	heard := make(chan map[string]json.RawMessage, 1)
	done, err := listener.Commits("fake", func(values map[string]json.RawMessage) { heard <- values })
	if err != nil {
		t.Fatal(err)
	}
	defer done()
	start := func(_ string, commit index.Commit) (func(), error) {
		return func() {}, commit(q.Writer{}, map[string]any{"fake/out": 7})
	}
	stop, err := runsIO(bus.URL(), bus.Token(), map[string]index.Start{"fake": start})
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	select {
	case values := <-heard:
		if string(values["fake/out"]) != "7" {
			t.Fatalf("the commit arrives as %s", values)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("quack io publishes no commit")
	}
}
