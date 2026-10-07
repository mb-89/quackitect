// The battery's run in Go: the ready step alone, then every part at once,
// timed over a clock the case moves, with no real timer.
// [[spec/design_output/work#the-battery-answers-first]]
package main // level0: InPackageTest - the case drives the unexported batteryRun, part, partsOf and readyOf over the in-package helpers checkFake and ticking

import (
	"reflect"
	"slices"
	"sync"
	"testing"
	"time"
)

// A clock standing still until the case moves it, telling the case of each read. [[spec/guidance/code/testing]]
type heldClock struct {
	held  sync.Mutex
	at    time.Time
	count int
	reads chan struct{}
}

func newHeldClock(most int) *heldClock {
	return &heldClock{at: time.Date(2026, 9, 20, 10, 0, 0, 0, time.UTC), reads: make(chan struct{}, most)}
}

func (c *heldClock) now() time.Time {
	c.held.Lock()
	defer c.held.Unlock()
	c.count++
	c.reads <- struct{}{}
	return c.at
}

func (c *heldClock) move(by time.Duration) {
	c.held.Lock()
	defer c.held.Unlock()
	c.at = c.at.Add(by)
}

func (c *heldClock) read() int {
	c.held.Lock()
	defer c.held.Unlock()
	return c.count
}

func TestReadyStep(t *testing.T) {
	t.Parallel()
	t.Run("the ready step runs the install, then asks the index standing through its own binary", func(t *testing.T) {
		fake := &checkFake{}
		doors := fake.doors()
		doors.self = "/bin/se-index"
		if code := readyOf(doors, false).run(); code != 0 {
			t.Fatalf("the ready step answers %d", code)
		}
		if want := [][]string{{"sh", installer}, {"/bin/se-index", "standing"}}; !reflect.DeepEqual(fake.runs, want) {
			t.Fatalf("the ready step ran %v, and wants %v", fake.runs, want)
		}
	})
	t.Run("an index standing no door turns the ready step red, and a red install alone carries on", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"sh": 1}}
		doors := fake.doors()
		doors.self = "/bin/se-index"
		if code := readyOf(doors, false).run(); code != 0 {
			t.Fatalf("a red install answers %d", code)
		}
		fake.codes = map[string]int{"/bin/se-index": 1}
		if code := readyOf(doors, false).run(); code != 1 {
			t.Fatalf("an index standing no door answers %d", code)
		}
	})
}

func TestBatteryRun(t *testing.T) {
	t.Parallel()
	t.Run("the ready step ends before any part starts, and every part starts before any part ends", func(t *testing.T) {
		clock := newHeldClock(16)
		readied := false
		ready := part{name: "ready", run: func() int {
			clock.move(5 * time.Second)
			readied = true
			return 0
		}}
		names := []string{"tests", "go", "rules"}
		started := make(chan string, len(names))
		release := map[string]chan struct{}{}
		var held sync.Mutex
		early := []string{}
		parts := []part{}
		for _, name := range names {
			release[name] = make(chan struct{})
			parts = append(parts, part{name: name, run: func() int {
				held.Lock()
				if !readied || clock.read() < 2+len(names) || len(early) > 0 {
					early = append(early, name)
				}
				waits := len(early) == 0
				held.Unlock()
				started <- name
				if waits {
					<-release[name]
				}
				return 0
			}})
		}
		type answer struct {
			times map[string]float64
			total float64
		}
		answered := make(chan answer, 1)
		go func() {
			_, times, _, total := batteryRun(ready, parts, clock.now)
			answered <- answer{times, total}
		}()
		for range names {
			<-started
		}
		held.Lock()
		ran := slices.Clone(early)
		held.Unlock()
		if len(ran) > 0 {
			<-answered
			t.Fatalf("%v ran before the battery started every part", ran)
		}
		for range 2 + len(names) {
			<-clock.reads
		}
		for _, name := range names {
			clock.move(10 * time.Second)
			close(release[name])
			<-clock.reads
		}
		got := <-answered
		if want := map[string]float64{"ready": 5000, "tests": 10000, "go": 20000, "rules": 30000}; !reflect.DeepEqual(got.times, want) || got.total != 35000 {
			t.Fatalf("the run timed %v over %v, and wants %v over the ready step's 5000 and the slowest part's 30000", got.times, got.total, want)
		}
	})
	// [[spec/tickets/the-check-runs-beside]]
	t.Run("a lead part ends before any other part starts", func(t *testing.T) {
		var held sync.Mutex
		led, early := false, []string{}
		step := func(name string, lead bool) part {
			return part{name: name, lead: lead, run: func() int {
				held.Lock()
				defer held.Unlock()
				if lead {
					led = true
				} else if !led {
					early = append(early, name)
				}
				return 0
			}}
		}
		code, times, _, _ := batteryRun(part{name: "ready", run: func() int { return 0 }}, []part{step("tests", false), step("level0", true), step("rules", false)}, ticking(time.Millisecond))
		if code != 0 || len(early) > 0 || len(times) != 4 {
			t.Fatalf("the run answers %d, timed %v, and %v started before the lead part ended", code, times, early)
		}
	})
	// [[spec/tickets/the-check-runs-beside]]
	t.Run("the lead parts run one at a time, in part order", func(t *testing.T) {
		var held sync.Mutex
		busy, order, beside := false, []string{}, false
		lead := func(name string) part {
			return part{name: name, lead: true, run: func() int {
				held.Lock()
				beside = beside || busy
				busy = true
				order = append(order, name)
				held.Unlock()
				held.Lock()
				busy = false
				held.Unlock()
				return 0
			}}
		}
		batteryRun(part{name: "ready", run: func() int { return 0 }}, []part{lead("tests"), lead("level0"), {name: "go", run: func() int { return 0 }}}, ticking(time.Millisecond))
		if beside || !reflect.DeepEqual(order, []string{"tests", "level0"}) {
			t.Fatalf("the lead parts ran %v, one beside another %v", order, beside)
		}
	})
	t.Run("level zero and the tests lead, and no other part does", func(t *testing.T) {
		for _, one := range partsOf((&checkFake{}).doors(), nil, false) {
			if one.lead != (one.name == "level0" || one.name == "tests") {
				t.Fatalf("%s leads %v", one.name, one.lead)
			}
		}
	})
	t.Run("a red part names itself, and every part beside it runs and reports its time", func(t *testing.T) {
		var held sync.Mutex
		ran := []string{}
		step := func(name string, code int) part {
			return part{name: name, run: func() int {
				held.Lock()
				defer held.Unlock()
				ran = append(ran, name)
				return code
			}}
		}
		code, times, red, _ := batteryRun(step("ready", 0), []part{step("tests", 0), step("go", 1), step("rules", 2)}, ticking(time.Millisecond))
		slices.Sort(ran)
		if code != 1 || !reflect.DeepEqual(red, []string{"go", "rules"}) || !reflect.DeepEqual(ran, []string{"go", "ready", "rules", "tests"}) || len(times) != 4 {
			t.Fatalf("the red run answers %d, names %v red, ran %v, timed %v", code, red, ran, times)
		}
	})
	t.Run("a red ready step answers first and names itself, and every part still runs", func(t *testing.T) {
		var held sync.Mutex
		ran := 0
		step := func(name string, code int) part {
			return part{name: name, run: func() int {
				held.Lock()
				defer held.Unlock()
				ran++
				return code
			}}
		}
		code, _, red, _ := batteryRun(step("ready", 3), []part{step("tests", 0), step("go", 1)}, ticking(time.Millisecond))
		if code != 3 || !reflect.DeepEqual(red, []string{"ready", "go"}) || ran != 3 {
			t.Fatalf("the run answers %d, names %v red, ran %d", code, red, ran)
		}
	})
}
