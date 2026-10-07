// The plan tool answers in Go: a plan call writes the plan file as the bridge
// writes it, and a plan field riding a Go-answered call writes it too.
// [[spec/tickets/plan-writes-off-go]]
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/modules/hooks"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
)

// The module type the plan action stands in, its action, and the plan file it writes. [[spec/tickets/plan-writes-off-go]]
const (
	plansModuleType = "plans"
	planAction      = "plans/set"
	planFile        = ".se/.runtime/plan.json"
)

// The plan file under the root, as the queue reads it. [[spec/tickets/plan-writes-off-go]]
func planOn(t *testing.T, root string) map[string]any {
	t.Helper()
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(planFile)))
	if err != nil {
		t.Fatalf("the plan file reads %v", err)
	}
	var plan map[string]any
	if err := json.Unmarshal(text, &plan); err != nil {
		t.Fatalf("the plan file reads %q: %v", text, err)
	}
	return plan
}

// [[spec/tickets/plan-writes-off-go]]
func TestAPlanCallWritesThePlanFileAsTheBridgeWritesIt(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedFile(t, root, planFile, `{"working":"","todos":[],"places":{},"kept":true}`)
	c := q.New()
	as := manager.Registers(c)
	if one, ok := modules[plansModuleType]; ok {
		one.registers(c)
	}
	store := q.NewStore(c)
	served, err := manager.Serving(manager.Outside{
		Root: root, Store: store, As: as, Rows: opRows{heldTable{}},
		Steps: func(func()) {}, Clock: stillClock(),
		Accept: accepts(root, store, nil),
	})
	if err != nil {
		t.Fatal(err)
	}
	defer served.Stop()
	said, err := served.Call(planAction, map[string]any{"working": "w", "add": []any{map[string]any{"title": "t1", "details": "d"}}}, "s1", findWait)
	if err != nil || said.Error != "" {
		t.Fatalf("the plan calls with %v %q, and wants an answer", err, said.Error)
	}
	if text := fmt.Sprint(said.Result); !strings.HasPrefix(text, "The plan stands: 1 todo(s) open, working on w.") {
		t.Errorf("the plan answers %q, and wants it to open on the count and the work", text)
	}
	plan := planOn(t, root)
	todos, _ := plan["todos"].([]any)
	if plan["working"] != "w" || plan["kept"] != true || len(todos) != 1 {
		t.Fatalf("the plan file holds %v, and wants w, the kept key and one todo", plan)
	}
	if todo, _ := todos[0].(map[string]any); todo["title"] != "t1" || todo["details"] != "d" || todo["todo"] != "true" || todo["made"] == "" {
		t.Errorf("the todo reads %v, and wants t1, d, first, stamped", todo)
	}
}

// [[spec/tickets/plan-writes-off-go]]
func TestAPlanFieldRidingAGoCallWritesThePlanFile(t *testing.T) {
	t.Parallel()
	world := waitWorldOf(t)
	_, err := world.door.Hook(hooks.Post{Event: "tool.call", E: map[string]any{
		"tool": waitTool, "session_id": waitSession,
		"input": map[string]any{"agent": "a9", "wait": shortWait.Seconds(), "plan": map[string]any{"working": "riding"}},
	}})
	if err != nil {
		t.Fatal(err)
	}
	if plan := planOn(t, world.root); plan["working"] != "riding" {
		t.Errorf("the plan file holds %v, and wants the riding field's work", plan)
	}
}

// The answer names the place the queue gives a new todo, off the ports the real wiring binds. [[spec/tickets/plan-writes-off-go]]
func TestAPlanAnswerReadsThePlaceOffTheQueuesPorts(t *testing.T) {
	t.Parallel()
	world := waitWorldOf(t)
	wiring, err := os.ReadFile(filepath.Join(treeRoot, filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	seedFile(t, world.root, q.WiringFile, string(wiring))
	said, err := world.served.Call(planAction, map[string]any{"add": []any{map[string]any{"title": "placed"}}}, "s1", findWait)
	if err != nil || said.Error != "" {
		t.Fatalf("the plan calls with %v %q, and wants an answer", err, said.Error)
	}
	if text := fmt.Sprint(said.Result); !strings.Contains(text, "placed stands at ") || strings.Contains(text, "no place") {
		t.Errorf("the plan answers %q, and wants the place the queue gives the todo", text)
	}
}
