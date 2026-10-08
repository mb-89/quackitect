// The placements: each process restarts alone and the index stays warm, and
// the index answers the inputs and publishes a run where a commit moves one.
// [[spec/design_output/model#the-placements]]
package index // level0: InPackageTest - it reaches the fakeStore and until helpers procs_test declares

import (
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// Two fakes placed apart, each its own process, the store they commit to, and the processes the fake spawn runs. [[spec/design_output/model#the-placements]]
func placedTwo(t *testing.T) (*q.Store, *fakeProcs, func()) {
	t.Helper()
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	store, hand := fakeStore(t)
	procs := newFakeProcs()
	one := func(instance, topic string) Placed {
		return Placed{Name: instance, Command: []string{"fakeio", instance}, Instances: map[string]q.Writer{instance: hand}, Topics: []string{topic}, Spawn: procs.Spawn}
	}
	placements := NewPlacements(qtest.NewFake(time.Time{}), bus, store, []Placed{one("fake", "fakeio"), one("other", "otherio")})
	placements.gap = 0
	stop, err := placements.Start()
	if err != nil {
		bus.Close()
		t.Fatal(err)
	}
	until(t, store, "both fakes at 7", func(snap q.Snapshot) bool { return snap.Read("fake/out") == 7 && snap.Read("other/out") == 7 })
	return store, procs, func() { stop(); bus.Close() }
}

// A timer that answers a wait of nothing at once and holds every other, and sends each span it is asked on the channel it answers. [[spec/tickets/each-door-meets-one-test]]
func fakeTimer() (func(time.Duration) <-chan time.Time, <-chan time.Duration) {
	asks := make(chan time.Duration, 8)
	return func(span time.Duration) <-chan time.Time {
		at := make(chan time.Time, 1)
		if span <= 0 {
			at <- time.Time{}
		}
		select {
		case asks <- span:
		default:
		}
		return at
	}, asks
}

// Waits until the spawner asks the timer for the span. [[spec/tickets/each-door-meets-one-test]]
func timerAsked(asks <-chan time.Duration, span time.Duration) {
	for got := range asks {
		if got == span {
			return
		}
	}
}

// New placements wait the default gap between two spawns, and it stays short. [[spec/tickets/the-modules-start-together]]
func TestThePlacementsWaitTheDefaultGap(t *testing.T) {
	t.Parallel()
	if got := NewPlacements(qtest.Wall(), nil, nil, nil).gap; got != spawnGap {
		t.Fatalf("new placements wait %v between spawns, and want %v", got, spawnGap)
	}
	if spawnGap > 50*time.Millisecond {
		t.Fatalf("the spawn gap stands at %v, and a read waits on every spawn of a fresh index", spawnGap)
	}
}

func TestAStopDuringTheSpawnsStartsNoFurtherProcess(t *testing.T) {
	t.Parallel()
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	store, hand := fakeStore(t)
	procs := newFakeProcs()
	one := func(instance string) Placed {
		return Placed{Name: instance, Command: []string{"fakeio", instance}, Instances: map[string]q.Writer{instance: hand}, Restart: time.Hour, Spawn: procs.Spawn}
	}
	// The case names a gap past its stop, and the fake timer holds it, so the stop lands between the two spawns on any box. [[spec/tickets/the-modules-start-together]]
	timer, asks := fakeTimer()
	spawns := NewPlacements(qtest.NewFake(time.Time{}), bus, store, []Placed{one("fake"), one("other")})
	spawns.gap = time.Hour
	stop, err := spawns.Timer(timer).Start()
	if err != nil {
		t.Fatal(err)
	}
	timerAsked(asks, time.Hour)
	stop()
	if got := procs.count(); got != 1 {
		t.Fatalf("the spawns start %d process(es) about a stop before the second, and want fake's alone", got)
	}
	if got := read(store, "other/out"); got != 0 {
		t.Fatalf("other/out reads %v after a stop before its spawn, where no process of other starts", got)
	}
}

// The stop answers once the spawner returns, so no spawn lands past it. The timer holds the spawner until the stop begins. [[spec/tickets/stop-join-test-stands-red]]
func TestAStopJoinsTheSpawnerBeforeItAnswers(t *testing.T) {
	t.Parallel()
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	store, hand := fakeStore(t)
	placed := Placed{Name: "fake", Command: []string{"fakeio", "fake"}, Instances: map[string]q.Writer{"fake": hand}, Restart: time.Hour, Spawn: newFakeProcs().Spawn}
	placements := NewPlacements(qtest.NewFake(time.Time{}), bus, store, []Placed{placed})
	placements.Timer(func(time.Duration) <-chan time.Time {
		<-placements.quit
		return make(chan time.Time)
	})
	stop, err := placements.Start()
	if err != nil {
		t.Fatal(err)
	}
	stop()
	select {
	case <-placements.spawned:
	default:
		t.Fatal("the stop answers while the spawner still runs")
	}
}

func TestAStopInsideTheStartWindowSpawnsNothing(t *testing.T) {
	t.Parallel()
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	store, hand := fakeStore(t)
	procs := newFakeProcs()
	placed := Placed{Name: "fake", Command: []string{"fakeio", "fake"}, Instances: map[string]q.Writer{"fake": hand}, Restart: time.Hour, Spawn: procs.Spawn}
	timer, asks := fakeTimer()
	stop, err := NewPlacements(qtest.NewFake(time.Time{}), bus, store, []Placed{placed}).After(time.Hour).Timer(timer).Start()
	if err != nil {
		t.Fatal(err)
	}
	timerAsked(asks, time.Hour)
	stop()
	if got := procs.count(); got != 0 {
		t.Fatalf("the placements start %d process(es) inside the start window, where nothing spawns", got)
	}
}

func TestAKilledModuleProcessRestartsAloneAndTheIndexStaysWarm(t *testing.T) {
	t.Parallel()
	store, procs, stop := placedTwo(t)
	defer stop()
	other, first := read(store, "other/pid"), read(store, "fake/pid")
	before := store.Snapshot().Revision
	procs.kills(t, first)
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

// A store wiring a doubler to a source, the source's writer, a bus the case closes, and the doubler placed in the idle fake. [[spec/design_output/model#the-placements]]
func doublerPlaced(t *testing.T) (*q.Store, q.Writer, *Bus, Placed) {
	t.Helper()
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
	t.Cleanup(bus.Close)
	placed := Placed{Name: "doubler", Command: []string{"idle"}, Instances: map[string]q.Writer{"doubler": {}}, Restart: time.Hour, Topics: []string{"doubler"}, Spawn: newFakeProcs().Spawn}
	return store, source, bus, placed
}

// Answers each run of doubler on a channel that holds one. [[spec/design_output/model#the-placements]]
func runsOf(t *testing.T, peer *Peer) chan struct{} {
	t.Helper()
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
	t.Cleanup(done)
	return runs
}

func TestPlacementsAnswerInputsAndRunOnAMove(t *testing.T) {
	t.Parallel()
	store, source, bus, placed := doublerPlaced(t)
	stop, err := NewPlacements(qtest.NewFake(time.Time{}), bus, store, []Placed{placed}).Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	peer, err := Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatal(err)
	}
	defer peer.Close()
	runs := runsOf(t, peer)
	if _, err := store.Commit(store.Snapshot().Revision, source, map[string]any{"source/all": 21}); err != nil {
		t.Fatal(err)
	}
	<-runs
	saved, err := peer.Inputs("doubler")
	if err != nil {
		t.Fatalf("the inputs of doubler meet %v", err)
	}
	if !strings.Contains(string(saved), `"source/all"`) || !strings.Contains(string(saved), "21") {
		t.Fatalf("the index answers the inputs of doubler with %s", saved)
	}
}

func TestAMovedAskAnswersTheInputsMovedSinceTheLastAnswer(t *testing.T) {
	t.Parallel()
	store, source, bus, placed := doublerPlaced(t)
	stop, err := NewPlacements(qtest.NewFake(time.Time{}), bus, store, []Placed{placed}).Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	peer, err := Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatal(err)
	}
	defer peer.Close()
	if _, err := peer.Inputs("doubler"); err != nil {
		t.Fatal(err)
	}
	if _, err := store.Commit(store.Snapshot().Revision, source, map[string]any{"source/all": 22}); err != nil {
		t.Fatal(err)
	}
	moved, err := peer.Moved("doubler")
	if err != nil || !strings.Contains(string(moved), `"source/all"`) || !strings.Contains(string(moved), "22") {
		t.Fatalf("the moved ask answers %s and %v, and wants source/all at 22", moved, err)
	}
	again, err := peer.Moved("doubler")
	if err != nil || strings.Contains(string(again), `"source/all"`) {
		t.Fatalf("a second moved ask answers %s and %v, where nothing moved since", again, err)
	}
}

// A commit answering an earlier run leaves the reader waiting on a run sent while the process computed: the settle ends on its wait alone, and the answer to the later run ends the next one with no tick. [[spec/tickets/mid-run-commit-clears-early]]
func TestACommitAnsweringAnEarlierRunHoldsTheSettleForTheLater(t *testing.T) {
	t.Parallel()
	store, source, bus, placed := doublerPlaced(t)
	clock := newToldClock()
	placements := NewPlacements(clock, bus, store, []Placed{placed})
	stop, err := placements.Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	peer, err := Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatal(err)
	}
	defer peer.Close()
	runs := runsOf(t, peer)
	said := make(chan string, toldWaits)
	was := stderr
	stderr = toldWriter(said)
	t.Cleanup(func() { stderr = was })
	answers := func(ask func(string) ([]byte, error)) {
		t.Helper()
		if _, err := ask("doubler"); err != nil {
			t.Fatal(err)
		}
	}
	commits := func(all int) {
		t.Helper()
		if _, err := store.Commit(store.Snapshot().Revision, source, map[string]any{"source/all": all}); err != nil {
			t.Fatal(err)
		}
		<-runs
	}
	answers(peer.Inputs)
	if err := peer.Commit("doubler", map[string]any{}); err != nil {
		t.Fatal(err)
	}
	placements.Settle(10 * time.Second)
	commits(21)
	answers(peer.Moved)
	commits(22)
	if err := peer.Commit("doubler", map[string]any{}); err != nil {
		t.Fatal(err)
	}
	// The index names a value it reads as none after the answer to the first run, so that answer reached it first. [[spec/tickets/test-walks-move-onto-fakes]]
	if err := peer.Commit("doubler", map[string]any{"t/none": 1}); err != nil {
		t.Fatal(err)
	}
	for line := range said {
		if strings.Contains(line, "t/none") {
			break
		}
	}
	ended := make(chan struct{})
	go func() {
		placements.Settle(time.Second)
		close(ended)
	}()
	clock.waitsOn(time.Second)
	placements.mu.Lock()
	waiting := placements.pending["doubler"]
	placements.mu.Unlock()
	if !waiting {
		t.Fatal("the settle ends on the answer to the first run, and wants the second answered")
	}
	clock.Tick(time.Second)
	<-ended
	answers(peer.Moved)
	if err := peer.Commit("doubler", map[string]any{}); err != nil {
		t.Fatal(err)
	}
	placements.Settle(10 * time.Second)
}

// A writer telling each line on the channel, dropping the line where the channel stands full. [[spec/tickets/test-walks-move-onto-fakes]]
type toldWriter chan string

func (one toldWriter) Write(said []byte) (int, error) {
	select {
	case one <- string(said):
	default:
	}
	return len(said), nil
}

// A settle on a silent process ends at its wait, every time. [[spec/tickets/settle-timer-races-deadline]]
func TestASettleOnASilentProcessEndsAtItsWait(t *testing.T) {
	t.Parallel()
	store, _, bus, placed := doublerPlaced(t)
	clock := newToldClock()
	placements := NewPlacements(clock, bus, store, []Placed{placed})
	stop, err := placements.Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	for range 200 {
		ended := make(chan struct{})
		go func() {
			placements.Settle(time.Millisecond)
			close(ended)
		}()
		clock.passes(time.Millisecond)
		<-ended
	}
}
