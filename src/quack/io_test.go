// quack io publishes what its instances commit over the bus, and a value the
// shadow commits apart from the store's writes a shadow row.
// [[spec/design_output/model#the-io-process]]
package main

import (
	"encoding/json"
	"testing"
	"time"

	"quackitect/src/index"
	"quackitect/src/q"
)

func TestQuackIOCommitsItsInstancesOverTheBus(t *testing.T) {
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

func TestAShadowValueApartWritesAShadowRow(t *testing.T) {
	var rows []map[string]any
	waited := time.Duration(0)
	weighs := shadows{
		read:   func(name string) any { return map[string]any{"clock/minute": 3, "env/HOME": "/home"}[name] },
		settle: time.Second,
		wait:   func(span time.Duration) { waited += span },
		say:    func(row map[string]any) error { rows = append(rows, row); return nil },
	}
	weighs.weigh(map[string]json.RawMessage{"clock/minute": json.RawMessage("4"), "env/HOME": json.RawMessage(`"/home"`)})
	if len(rows) != 1 {
		t.Fatalf("the shadow writes %d rows, and wants one for clock/minute alone: %v", len(rows), rows)
	}
	row := rows[0]
	if row["kind"] != "shadow" || row["slice"] != "processes" || row["name"] != "clock/minute" || row["old"] != "3" || row["new"] != "4" {
		t.Fatalf("the shadow row reads %v", row)
	}
	if waited != time.Second {
		t.Fatalf("the shadow waits %v before it weighs, and wants the settle span", waited)
	}
}
