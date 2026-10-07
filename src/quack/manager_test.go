// The manager folds src/ops and src/watchdog into its module, and the root
// loads it where the wiring loads nothing else.
// [[spec/design_output/model#the-index-manager]]
package main

import (
	"os/exec" // level0: OutsideInDoors - the case runs go list over the tree's own packages, as a build check reads source
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/clock"
	"quackitect/src/modules/config"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The real time and its waits, with a beat that stands still, so a case's manager renews nothing on its own. [[spec/tickets/go-waits-on-events]]
type stillBeat struct{ q.Clock }

func (stillBeat) Every(time.Duration, func(time.Time)) func() { return func() {} }

func stillClock() q.Clock { return stillBeat{clock.New()} }

// A still beat keeping each span the manager asks of it. [[spec/tickets/go-waits-on-events]]
type beatsOf struct {
	q.Clock
	spans *[]time.Duration
}

func (one beatsOf) Every(span time.Duration, hand func(time.Time)) func() {
	*one.spans = append(*one.spans, span)
	return one.Clock.Every(span, hand)
}

// An override on watchdog/beat re-arms the manager's tick at its span, and one on watchdog/lease holds the index's lease at its term, through the config module's layers. [[spec/design_output/model#a-lease]]
func TestAnOverrideSetsTheSpanTheManagerTicksAt(t *testing.T) {
	t.Parallel()
	var as q.Writer
	ix := qtest.New(t, func(c *q.Catalog) {
		q.OutIn(c, "env/<name>", "", q.Doc("an SE_ variable, as the case seeds it"))
		as = manager.Registers(c)
		config.Registers(c)
	})
	var spans []time.Duration
	var steps []func()
	stop, err := manager.Start(manager.Outside{
		Root: t.TempDir(), Store: ix.Store(), As: as, Rows: opRows{heldTable{}},
		Steps: func(hand func()) { steps = append(steps, hand) },
		Clock: beatsOf{Clock: stillClock(), spans: &spans},
	})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	ix.Land(config.HeldName, config.Change{Kind: config.Overrides, Values: map[string]string{manager.BeatKey: "2", manager.LeaseKey: "7"}})
	if len(spans) == 0 || spans[len(spans)-1] != 2*time.Second {
		t.Fatalf("an override of 2 on %s ticks at %v", manager.BeatKey, spans)
	}
	for _, step := range steps {
		step()
	}
	if lease, _ := ix.Read(manager.HealthName).(manager.Lease); lease.Term != 7*time.Second {
		t.Fatalf("an override of 7 on %s holds the term %v", manager.LeaseKey, lease.Term)
	}
}

// An op table in memory, as the index hands one. [[spec/design_output/model#an-operation-outlives-callers]]
type heldTable map[string][]byte

func (one heldTable) Save(id string, body []byte) error { one[id] = body; return nil }
func (one heldTable) Drop(id string) error              { delete(one, id); return nil }

func (one heldTable) All() ([]index.OpRow, error) {
	out := []index.OpRow{}
	for id, body := range one {
		out = append(out, index.OpRow{ID: id, Body: body})
	}
	return out, nil
}

func TestTheManagerReadsTheIndexOpTable(t *testing.T) {
	t.Parallel()
	table := heldTable{}
	rows := opRows{table}
	if err := rows.Save("1", []byte(`{"state":"running"}`)); err != nil {
		t.Fatal(err)
	}
	all, err := rows.All()
	if err != nil || len(all) != 1 || all[0].ID != "1" || string(all[0].Body) != `{"state":"running"}` {
		t.Fatalf("the rows read %v, %v", all, err)
	}
	if err := rows.Drop("1"); err != nil || len(table) != 0 {
		t.Fatalf("the drop leaves %v, %v", table, err)
	}
}

// The module the manager stands in, and the packages it folds. [[spec/design_output/model#the-index-manager]]
const managerPackage = "quackitect/src/modules/index"

var folded = []string{"quackitect/src/ops", "quackitect/src/watchdog"}

func listed(t *testing.T, args ...string) []string {
	t.Helper()
	cmd := exec.Command("go", append([]string{"list"}, args...)...)
	cmd.Dir = filepath.Join("..", "..")
	said, err := cmd.Output()
	if err != nil {
		t.Fatalf("go list %s answers %v", strings.Join(args, " "), err)
	}
	return strings.Fields(string(said))
}

func TestTheManagerFoldsOpsAndTheWatchdog(t *testing.T) {
	t.Parallel()
	found := false
	for _, one := range listed(t, "./src/modules/index/...") {
		found = found || one == managerPackage
	}
	if !found {
		t.Fatalf("go list ./src/modules/index/... answers no %s", managerPackage)
	}
	for _, one := range listed(t, "-deps", "./src/quack") {
		for _, gone := range folded {
			if one == gone {
				t.Fatalf("the root still reaches %s", gone)
			}
		}
	}
}
