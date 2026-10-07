// A registered verb an action runs through the node module reads the same
// index over HTTP while that action stands in flight, and the read settles.
// [[spec/tickets/twin-reads-inside-an-action]]
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/index"
	manager "quackitect/src/modules/index"
	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/modules/work"
	"quackitect/src/q"
)

// The wait past which the case names a hang. [[spec/tickets/twin-reads-inside-an-action]]
const liveWait = 20 * time.Second

// The index manager over the real IO accept, as manages wires it, with a clock standing still. [[spec/tickets/twin-reads-inside-an-action]]
func managesLive(as q.Writer) index.Manage {
	return func(root string, store *q.Store, rows index.OpRows, reads index.Reads, steps func(func())) (index.Managed, error) {
		served, err := manager.Serving(manager.Outside{
			Root: root, Store: store, As: as, Rows: opRows{rows}, Steps: steps, Now: time.Now,
			Every:  func(time.Duration, func(time.Time)) func() { return func() {} },
			Accept: accepts(root, store, reads),
		})
		if err != nil {
			return index.Managed{}, err
		}
		return index.Managed{Stop: served.Stop, Call: func(name string, input any, caller string, wait time.Duration) (index.Called, error) {
			said, err := served.Call(name, input, caller, wait)
			return index.Called(said), err
		}}, nil
	}
}

func TestATwinReadsTheIndexBesideTheActionCallingIt(t *testing.T) {
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, index.Runtime), 0o755); err != nil {
		t.Fatal(err)
	}
	c := q.New()
	as := manager.Registers(c)
	hand := q.OutIn(c, "work/yours", []work.YoursRow{}, q.Doc("the rows as the case seeds them"))
	q.ActionIn(c, "probe/pull", func(verbsmodule.Nothing) []q.Request {
		return []q.Request{{Module: verbsmodule.NodeModule, Verb: verbsmodule.NodeRun, Args: []string{"registry", "live", "--next"}, NoUndo: "the probe keeps no undo"}}
	}, q.Doc("Runs the registered probe through the node module."))
	seeds := func(_ string, commit index.Commit) (func(), error) {
		return func() {}, commit(hand, map[string]any{"work/yours": yoursRows})
	}
	stop, _, err := index.ServeManaged(root, filepath.Join(t.TempDir(), "index.db"), c, managesLive(as), seeds)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	body, err := os.ReadFile(filepath.Join(root, index.Runtime, "index.json"))
	if err != nil {
		t.Fatal(err)
	}
	var standing index.Standing
	if err := json.Unmarshal(body, &standing); err != nil {
		t.Fatal(err)
	}
	base := fmt.Sprintf("http://127.0.0.1:%d/v1", standing.V1)
	registersFor(t, "registry live", ticketYours(func() (string, error) { return base, nil }))
	var out, errs strings.Builder
	ended := make(chan int, 1)
	go func() { ended <- runs(&out, &errs, base, "probe/pull", nil) }()
	select {
	case code := <-ended:
		if code != 0 || !strings.Contains(out.String(), `a-trial`) {
			t.Fatalf("the action answers %d: %q%s, and wants the twin's next row a-trial", code, out.String(), errs.String())
		}
	case <-time.After(liveWait):
		t.Fatalf("the action stands past %s, so the twin's read waits on the action calling it", liveWait)
	}
}
