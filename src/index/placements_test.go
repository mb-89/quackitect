// The placements: each process restarts alone and the index stays warm, a
// topic restarts its own processes, and the index answers the inputs and
// publishes a run where a commit moves one.
// [[spec/design_output/model#the-placements]]
package index

import (
	"os"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
)

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

// The cap on a wait for the spawner's ask, which a green run never meets. [[spec/tickets/each-door-meets-one-test]]
const askCap = 5 * time.Second

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
func timerAsked(t *testing.T, asks <-chan time.Duration, span time.Duration) {
	t.Helper()
	capped := time.After(askCap)
	for {
		select {
		case got := <-asks:
			if got == span {
				return
			}
		case <-capped:
			t.Fatalf("the spawner asks no wait of %v of the timer it names", span)
		}
	}
}

// The placements wait the gap they name between two spawns, and the default gap stays short. [[spec/tickets/the-modules-start-together]]
func TestThePlacementsWaitTheGapTheyName(t *testing.T) {
	if got := NewPlacements(nil, nil, nil).gap; got != spawnGap {
		t.Fatalf("new placements wait %v between spawns, and want %v", got, spawnGap)
	}
	if got := NewPlacements(nil, nil, nil).Gap(time.Hour).gap; got != time.Hour {
		t.Fatalf("placements naming an hour wait %v", got)
	}
	if spawnGap > 50*time.Millisecond {
		t.Fatalf("the spawn gap stands at %v, and a read waits on every spawn of a fresh index", spawnGap)
	}
}

func TestAStopDuringTheSpawnsStartsNoFurtherProcess(t *testing.T) {
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	store, hand := fakeStore(t)
	one := func(instance string) Placed {
		return Placed{Name: instance, Command: []string{os.Args[0], "-test.run=^TestFakeIOProcess$", "--", instance}, Instances: map[string]q.Writer{instance: hand}, Restart: time.Hour}
	}
	// The case names a gap past its stop, and the fake timer holds it, so the stop lands between the two spawns on any box. [[spec/tickets/the-modules-start-together]]
	timer, asks := fakeTimer()
	stop, err := NewPlacements(bus, store, []Placed{one("fake"), one("other")}).Gap(time.Hour).Timer(timer).Start()
	if err != nil {
		t.Fatal(err)
	}
	timerAsked(t, asks, time.Hour)
	stop()
	if got := read(store, "other/out"); got != 0 {
		t.Fatalf("other/out reads %v after a stop before its spawn, where no process of other starts", got)
	}
}

func TestAStopInsideTheStartWindowSpawnsNothing(t *testing.T) {
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	store, hand := fakeStore(t)
	placed := Placed{Name: "fake", Command: []string{os.Args[0], "-test.run=^TestFakeIOProcess$", "--", "fake"}, Instances: map[string]q.Writer{"fake": hand}, Restart: time.Hour}
	timer, asks := fakeTimer()
	stop, err := NewPlacements(bus, store, []Placed{placed}).After(time.Hour).Timer(timer).Start()
	if err != nil {
		t.Fatal(err)
	}
	timerAsked(t, asks, time.Hour)
	stop()
	if got := read(store, "fake/out"); got != 0 {
		t.Fatalf("fake/out reads %v inside the start window, where nothing spawns", got)
	}
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
	placed := Placed{Name: "doubler", Command: []string{os.Args[0], "-test.run=^TestFakeIdleProcess$"}, Instances: map[string]q.Writer{"doubler": {}}, Restart: time.Hour, Topics: []string{"doubler"}}
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
	store, source, bus, placed := doublerPlaced(t)
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
	runs := runsOf(t, peer)
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

func TestAMovedAskAnswersTheInputsMovedSinceTheLastAnswer(t *testing.T) {
	store, source, bus, placed := doublerPlaced(t)
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

// A commit answering an earlier run leaves the reader waiting on a run sent while the process computed. [[spec/tickets/mid-run-commit-clears-early]]
func TestACommitAnsweringAnEarlierRunHoldsTheSettleForTheLater(t *testing.T) {
	store, source, bus, placed := doublerPlaced(t)
	placements := NewPlacements(bus, store, []Placed{placed})
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
		select {
		case <-runs:
		case <-time.After(10 * time.Second):
			t.Fatal("a move of source/all publishes no run of doubler")
		}
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
	began := time.Now()
	placements.Settle(time.Second)
	if gone := time.Since(began); gone < 900*time.Millisecond {
		t.Fatalf("the settle ends after %v on the answer to the first run, and wants the second answered", gone)
	}
	answers(peer.Moved)
	if err := peer.Commit("doubler", map[string]any{}); err != nil {
		t.Fatal(err)
	}
	began = time.Now()
	placements.Settle(10 * time.Second)
	if gone := time.Since(began); gone > 5*time.Second {
		t.Fatalf("the answer to the second run holds the settle for %v", gone)
	}
}

// A settle on a silent process ends at its wait, every time. [[spec/tickets/settle-timer-races-deadline]]
func TestASettleOnASilentProcessEndsAtItsWait(t *testing.T) {
	store, _, bus, placed := doublerPlaced(t)
	placements := NewPlacements(bus, store, []Placed{placed})
	stop, err := placements.Start()
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	for range 200 {
		began := time.Now()
		placements.Settle(time.Millisecond)
		if gone := time.Since(began); gone > time.Second {
			t.Fatalf("a settle of a millisecond on the silent doubler holds for %v", gone)
		}
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
