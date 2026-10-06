// quack io publishes what its instances commit over the bus, and the watchdogs
// span the processes.
// [[spec/design_output/model#the-io-process]]
package main

import (
	"encoding/json"
	"flag"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/index"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The fake silent IO process: it commits a value, beats its lease once, and then lives on without a beat. [[spec/tickets/watchdogs-span-the-processes]]
func TestFakeSilentIO(t *testing.T) {
	t.Parallel()
	if os.Getenv(index.BusEnv) == "" {
		return
	}
	peer, err := index.Dial(os.Getenv(index.BusEnv), os.Getenv(index.TokenEnv))
	if err != nil {
		os.Exit(3)
	}
	if err := peer.Commit("fake", map[string]any{"fake/out": 7}); err != nil {
		os.Exit(4)
	}
	_ = peer.Beat(flag.Arg(0))
	for {
		time.Sleep(time.Hour)
	}
}

func TestASilentIOProcessReadsInTheAlarms(t *testing.T) {
	t.Parallel()
	c := q.New()
	as := manager.Registers(c)
	fake := q.OutIn(c, "fake/out", 0, q.IO(), q.Doc("the fake's value"))
	if faults := c.Check(); len(faults) > 0 {
		t.Fatalf("the catalog refuses: %v", faults)
	}
	store := q.NewStore(c)
	dog := manager.NewDog(time.Now, store, as, manager.DogSettings{First: 10 * time.Millisecond, Cap: 20 * time.Millisecond, Faults: 2, Window: time.Minute})
	bus, err := index.StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	placed := index.Placed{Name: ioPart, Command: []string{os.Args[0], "-test.run=^TestFakeSilentIO$", "--", ioPart}, Instances: map[string]q.Writer{"fake": fake}, Restart: time.Hour, Watch: dog, Term: 200 * time.Millisecond}
	stop, err := index.NewPlacements(wall, bus, store, []index.Placed{placed}).Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	for end := time.Now().Add(10 * time.Second); time.Now().Before(end); time.Sleep(20 * time.Millisecond) {
		dog.Check()
		if alarms, _ := store.Snapshot().Read(manager.AlarmsName).([]manager.Alarm); len(alarms) == 1 && alarms[0].Part == ioPart {
			return
		}
	}
	t.Fatalf("session/alarms reads %v, and wants the silent IO process", store.Snapshot().Read(manager.AlarmsName))
}

// The fake silent module process: it commits its pid, beats its lease once, and then lives on without a beat. [[spec/tickets/module-silence-reads-alarms]]
func TestFakeSilentModule(t *testing.T) {
	t.Parallel()
	if os.Getenv(index.BusEnv) == "" {
		return
	}
	peer, err := index.Dial(os.Getenv(index.BusEnv), os.Getenv(index.TokenEnv))
	if err != nil {
		os.Exit(3)
	}
	if err := peer.Commit("fake", map[string]any{"fake/pid": os.Getpid()}); err != nil {
		os.Exit(4)
	}
	_ = peer.Beat(flag.Arg(0))
	for {
		time.Sleep(time.Hour)
	}
}

func TestASilentModuleProcessRestartsAndRaisesAnAlarm(t *testing.T) {
	t.Parallel()
	c := q.New()
	as := manager.Registers(c)
	fake := q.OutIn(c, "fake/pid", 0, q.IO(), q.Doc("the fake's pid"))
	if faults := c.Check(); len(faults) > 0 {
		t.Fatalf("the catalog refuses: %v", faults)
	}
	store := q.NewStore(c)
	dog := manager.NewDog(time.Now, store, as, manager.DogSettings{First: 10 * time.Millisecond, Cap: 20 * time.Millisecond, Faults: 2, Window: time.Minute})
	bus, err := index.StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	placed := index.Placed{Name: "fake", Command: []string{os.Args[0], "-test.run=^TestFakeSilentModule$", "--", "fake"}, Instances: map[string]q.Writer{"fake": fake}, Restart: time.Hour, Watch: dog, Term: 200 * time.Millisecond}
	stop, err := index.NewPlacements(wall, bus, store, []index.Placed{placed}).Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	pids := map[any]bool{}
	for end := time.Now().Add(20 * time.Second); time.Now().Before(end); time.Sleep(20 * time.Millisecond) {
		dog.Check()
		snap := store.Snapshot()
		if pid := snap.Read("fake/pid"); pid != 0 {
			pids[pid] = true
		}
		if alarms, _ := snap.Read(manager.AlarmsName).([]manager.Alarm); len(pids) > 1 && len(alarms) == 1 && alarms[0].Part == "fake" {
			return
		}
	}
	t.Fatalf("the silent fake runs as %d process(es), and session/alarms reads %v: wants a restart, then the alarm", len(pids), store.Snapshot().Read(manager.AlarmsName))
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
	fake := qtest.NewFake(time.Unix(0, 0))
	term := 100 * time.Millisecond
	stop, err := watchesIndex(watcher, fake, term, func(row map[string]any) error { rows <- row; return nil })
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
	giveUp := time.After(5 * time.Second)
	for {
		fake.Tick(2 * term)
		select {
		case row := <-rows:
			if row["kind"] != "watchdog" || row["part"] != "index" {
				t.Fatalf("the IO process writes %v, and wants a watchdog row naming the index", row)
			}
			return
		case <-giveUp:
			t.Fatal("the IO process writes no row where the index falls silent")
		case <-time.After(term):
		}
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
