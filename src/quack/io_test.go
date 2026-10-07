// quack io publishes what its instances commit over the bus, and the watchdogs
// span the processes.
// [[spec/design_output/model#the-io-process]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"errors"
	"os" // level0: OutsideInDoors - the case reads the tree's own wiring, as a build check reads source
	"path/filepath"
	"runtime"
	"slices"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/clock"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The lease a silent fake holds, and the mark each of its runs commits, which both alarm cases share. [[spec/tickets/lease-waits-meet-a-fake-clock]]
const (
	silentTerm = 200 * time.Millisecond
	silentMark = "fake/run"
)

// The runs the silent fakes start, each committing its own mark. [[spec/tickets/test-walks-move-onto-fakes]]
var hq1SilentRuns atomic.Int64

// A silent process in memory: it dials the bus the placements name, commits its run, beats its lease once, and then lives on without a beat until the placements kill it. [[spec/tickets/test-walks-move-onto-fakes]]
func hq1SilentSpawn(command, env []string) (index.Process, error) {
	vars := map[string]string{}
	for _, one := range env {
		if key, value, ok := strings.Cut(one, "="); ok {
			vars[key] = value
		}
	}
	part := command[len(command)-1]
	kill, exited := make(chan struct{}), make(chan error, 1)
	go func() {
		peer, err := index.Dial(vars[index.BusEnv], vars[index.TokenEnv])
		if err != nil {
			exited <- err
			return
		}
		defer peer.Close()
		if err := peer.Commit("fake", map[string]any{silentMark: hq1SilentRuns.Add(1)}); err != nil {
			exited <- err
			return
		}
		_ = peer.Beat(part)
		<-kill
		exited <- errors.New("killed")
	}()
	var once sync.Once
	return index.Process{Kill: func() { once.Do(func() { close(kill) }) }, Exited: exited}, nil
}

var silentDog = manager.DogSettings{First: 10 * time.Millisecond, Cap: 20 * time.Millisecond, Faults: 2, Window: time.Minute}

// Places one silent fake process in memory under a dog on a fake clock, and reads the store again at each commit until held answers true. The clock moves past the lease while the run the fake last committed stands unexpired, so a slow start counts against no lease, and a beat landing late meets the next tick. A run commits a mark of its own. The alarm stops the restarts, so the wait ends on it. The bus stays real. [[spec/tickets/lease-waits-meet-a-fake-clock]] [[spec/tickets/cold-runner-waits-meet-readiness]]
func silentRun(t *testing.T, part, wants string, held func(snap q.Snapshot, runs int) bool) {
	t.Helper()
	c := q.New()
	as := manager.Registers(c)
	hand := q.OutIn(c, silentMark, 0, q.IO(), q.Doc("the fake's run, a mark no other run commits"))
	if faults := c.Check(); len(faults) > 0 {
		t.Fatalf("the catalog refuses: %v", faults)
	}
	store := q.NewStore(c)
	committed := make(chan struct{}, 1)
	store.OnCommit(func(map[string]any) {
		select {
		case committed <- struct{}{}:
		default:
		}
	})
	at := clock.NewFake(time.Date(2026, 10, 2, 12, 0, 0, 0, time.UTC))
	dog := manager.NewDog(at.Now, store, as, silentDog)
	bus, err := index.StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	placed := index.Placed{Name: part, Command: []string{"fake", part}, Instances: map[string]q.Writer{"fake": hand}, Restart: time.Hour, Watch: dog, Term: silentTerm, Spawn: hq1SilentSpawn}
	stop, err := index.NewPlacements(wall, bus, store, []index.Placed{placed}).Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	runs, expired := map[any]bool{}, map[any]bool{}
	for {
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
			if !slices.Contains(dog.Check(), part) {
				runtime.Gosched()
				continue
			}
			expired[run] = true
		}
		<-committed
	}
	t.Fatalf("the silent fake runs %d time(s), and session/alarms reads %v: wants %s", len(runs), store.Snapshot().Read(manager.AlarmsName), wants)
}

func TestASilentIOProcessReadsInTheAlarms(t *testing.T) {
	t.Parallel()
	silentRun(t, ioPart, "the silent IO process", func(snap q.Snapshot, _ int) bool {
		alarms, _ := snap.Read(manager.AlarmsName).([]manager.Alarm)
		return len(alarms) == 1 && alarms[0].Part == ioPart
	})
}

func TestASilentModuleProcessRestartsAndRaisesAnAlarm(t *testing.T) {
	t.Parallel()
	silentRun(t, "fake", "a restart, then the alarm", func(snap q.Snapshot, runs int) bool {
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
	for {
		fake.Tick(2 * term)
		select {
		case row := <-rows:
			if row["kind"] != "watchdog" || row["part"] != "index" {
				t.Fatalf("the IO process writes %v, and wants a watchdog row naming the index", row)
			}
			return
		default:
			runtime.Gosched()
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
	if _, err := store.Commit(store.Snapshot().Revision, as, map[string]any{manager.HealthName: manager.Lease{Part: indexPart, Renewed: time.Date(2026, 10, 2, 12, 0, 0, 0, time.UTC), Term: time.Minute}}); err != nil {
		t.Fatal(err)
	}
	if part := <-heard; part != indexPart {
		t.Fatalf("the health commit beats %q, and wants the index", part)
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

// A start that fails writes its row, and the instances beside it commit on. [[spec/tickets/io-start-fault-shows]]
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
	broken := func(string, index.Commit) (func(), error) { return func() {}, errors.New("payload exceeded") }
	rows := make(chan map[string]any, 4)
	stop, err := runsIO(bus.URL(), bus.Token(), map[string]index.Start{"broken": broken, "fake": start}, func(row map[string]any) error { rows <- row; return nil })
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	if row := <-rows; row["kind"] != ioStartFault || row["instance"] != "broken" || row["said"] != "payload exceeded" {
		t.Fatalf("a start that fails writes %v, and wants a row naming broken and its fault", row)
	}
	if values := <-heard; string(values["fake/out"]) != "7" {
		t.Fatalf("the commit arrives as %s", values)
	}
}
