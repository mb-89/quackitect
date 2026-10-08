// The tool surface reads one action the same way on every surface: the name
// and its reverse, the schema, the input past the wait, the wait and the
// still running line.
// [[spec/tickets/tool-surface-moves-into-q]]
package tool

import (
	"encoding/json"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/danielgtaylor/huma/v2"

	"quackitect/src/q"
)

type greetIn struct {
	Who string `json:"who"`
}

type waitIn struct {
	Wait int `json:"wait"`
}

func storeOf(t *testing.T) *q.Store {
	t.Helper()
	c := q.New()
	q.ActionIn(c, "greet/one", func(greetIn) []q.Request { return nil })
	q.ActionIn(c, "sleep", func(waitIn) []q.Request { return nil })
	q.ActionIn(c, "echo", func(string) []q.Request { return nil })
	if faults := c.Check(); len(faults) > 0 {
		t.Fatal(faults)
	}
	return q.NewStore(c)
}

func TestAToolNameReadsBackToItsAction(t *testing.T) {
	s := storeOf(t)
	if name := Name("greet/one"); name != "index_greet_one" {
		t.Fatalf("the tool name reads %q, and wants index_greet_one", name)
	}
	if action, ok := Action(s, "index_greet_one"); !ok || action != "greet/one" {
		t.Fatalf("index_greet_one reads back %q, and wants greet/one", action)
	}
	if _, ok := Action(s, "greet_one"); ok {
		t.Fatal("a name short of the prefix reads back an action, and wants none")
	}
}

// The name the harness calls carries the level zero server's prefix, and reads back to the same action. [[spec/tickets/tools-keep-their-own-names]]
func TestActionResolvesALevelZeroNameToItsAction(t *testing.T) {
	s := storeOf(t)
	if action, ok := Action(s, "mcp__level0__index_greet_one"); !ok || action != "greet/one" {
		t.Fatalf("mcp__level0__index_greet_one reads back %q, and wants greet/one", action)
	}
	if _, ok := Action(s, "mcp__other__index_greet_one"); ok {
		t.Fatal("a name under another server reads back an action, and wants none")
	}
}

// An action carrying its own tool name reads back from that name, bare or under the level zero prefix, and from no generated one. [[spec/tickets/tools-keep-their-own-names]]
func TestAnOwnToolNameReadsBackToItsAction(t *testing.T) {
	c := q.New()
	q.ActionIn(c, "plans/set", func(greetIn) []q.Request { return nil }, q.ToolName("plan"))
	if faults := c.Check(); len(faults) > 0 {
		t.Fatal(faults)
	}
	s := q.NewStore(c)
	if name := NameOf(s, "plans/set"); name != "plan" {
		t.Fatalf("the tool name of plans/set reads %q, and wants plan", name)
	}
	for _, called := range []string{"plan", "mcp__level0__plan"} {
		if action, ok := Action(s, called); !ok || action != "plans/set" {
			t.Fatalf("%s reads back %q, and wants plans/set", called, action)
		}
	}
	if _, ok := Action(s, "index_plans_set"); ok {
		t.Fatal("the generated name reads back an action carrying its own, and wants none")
	}
}

func TestABareInputRidesUnderItsOneProperty(t *testing.T) {
	registry := huma.NewMapRegistry("#/components/schemas/", huma.DefaultSchemaNamer)
	schema, bare, err := Schema(registry, reflect.TypeOf(""))
	if err != nil || !bare {
		t.Fatalf("a string input reads bare %v, err %v, and wants bare", bare, err)
	}
	if _, ok := schema["properties"].(map[string]any)[BareArg]; !ok || schema["type"] != "object" {
		t.Fatalf("the bare schema reads %v, and wants an object with the one property input", schema)
	}
	schema, bare, err = Schema(registry, reflect.TypeOf(greetIn{}))
	if err != nil || bare {
		t.Fatalf("a struct input reads bare %v, err %v, and wants it whole", bare, err)
	}
	if _, ok := schema["properties"].(map[string]any)["who"]; !ok {
		t.Fatalf("the struct schema reads %v, and wants the property who with its reference resolved", schema)
	}
}

func TestTheInputLeavesTheWaitUnlessItDeclaresOne(t *testing.T) {
	s := storeOf(t)
	in, err := Input(s, "greet/one", map[string]any{"who": "owner", WaitArg: 2.0})
	if err != nil || in != (greetIn{Who: "owner"}) {
		t.Fatalf("the input reads %+v, err %v, and wants who alone", in, err)
	}
	in, err = Input(s, "sleep", map[string]any{WaitArg: 3.0})
	if err != nil || in != (waitIn{Wait: 3}) {
		t.Fatalf("the input reads %+v, err %v, and wants the wait it declares", in, err)
	}
	in, err = Input(s, "echo", map[string]any{BareArg: "hi"})
	if err != nil || in != "hi" {
		t.Fatalf("the bare input reads %+v, err %v, and wants hi", in, err)
	}
}

// A call's arguments read nested under its input, or spread on the event beside its tool, and the spread keeps the fields the input declares alone. [[spec/tickets/the-bridge-server-leaves]]
func TestArgsReadNestedOrSpreadOnTheEvent(t *testing.T) {
	s := storeOf(t)
	nested := Args(s, "greet/one", map[string]any{"tool": "greet", BareArg: map[string]any{"who": "owner"}})
	if len(nested) != 1 || nested["who"] != "owner" {
		t.Fatalf("the nested arguments read %v, and want who alone", nested)
	}
	spread := Args(s, "greet/one", map[string]any{"tool": "greet", "agentId": "a1", "who": "owner", WaitArg: 2.0})
	if len(spread) != 2 || spread["who"] != "owner" || spread[WaitArg] != 2.0 {
		t.Fatalf("the spread arguments read %v, and want who and the wait", spread)
	}
	bare := Args(s, "echo", map[string]any{"tool": "echo", BareArg: "hi"})
	if in, err := Input(s, "echo", bare); err != nil || in != "hi" {
		t.Fatalf("the bare input reads %+v, err %v, and wants hi", in, err)
	}
}

// The plan field and the plan tool keep the names the guidance quotes. [[spec/tickets/plan-writes-off-go]]
func TestThePlanFieldAndToolKeepTheBridgesNames(t *testing.T) {
	if PlanArg != "plan" || PlanTool != "plan" {
		t.Fatalf("the plan field reads %q and the tool %q, and both want plan", PlanArg, PlanTool)
	}
}

// A plan field riding a call leaves the action's input, bare or whole. [[spec/tickets/plan-writes-off-go]]
func TestInputDropsARidingPlanField(t *testing.T) {
	s := storeOf(t)
	riding := map[string]any{"working": "w"}
	in, err := Input(s, "greet/one", map[string]any{"who": "owner", PlanArg: riding})
	if err != nil || in != (greetIn{Who: "owner"}) {
		t.Fatalf("the input reads %+v, err %v, and wants who alone", in, err)
	}
	in, err = Input(s, "echo", map[string]any{BareArg: "hi", PlanArg: riding})
	if err != nil || in != "hi" {
		t.Fatalf("the bare input reads %+v, err %v, and wants hi past the plan field", in, err)
	}
}

func TestTheWaitTakesTheArgumentThenTheKeyThenTheFallback(t *testing.T) {
	if wait := Wait(map[string]any{WaitArg: json.Number("0.5")}, 3, time.Second); wait != 500*time.Millisecond {
		t.Fatalf("the argument sets %v, and wants half a second", wait)
	}
	if wait := Wait(nil, 3, time.Second); wait != 3*time.Second {
		t.Fatalf("the key sets %v, and wants three seconds", wait)
	}
	if wait := Wait(nil, nil, time.Second); wait != time.Second {
		t.Fatalf("the fallback sets %v, and wants a second", wait)
	}
}

func TestTheRunningLineNamesTheFractionTheTimeAndTheHandle(t *testing.T) {
	line := Running("greet/one", 0.25, 2*time.Second, "h1")
	for _, want := range []string{"greet/one still running", "25% done", "after 2s", "handle h1"} {
		if !strings.Contains(line, want) {
			t.Fatalf("the line reads %q, and wants %q", line, want)
		}
	}
}
