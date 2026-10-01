// The wait tool answers in Go: it returns on a helper's report the hooks door
// lands, and a wait past the caller's wait answers a running handle whose
// result reaches the session later. Each case runs the real wiring over a
// temp tree, with the waits module beside it.
// [[spec/tickets/find-and-wait-in-go]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/config"
	"quackitect/src/modules/hooks"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
)

// The wait action and its tool, the session the cases post in, a call wait shorter than any signal, and the span a case waits on an operation's end. [[spec/tickets/find-and-wait-in-go]]
const (
	waitAction  = "waits/wait"
	waitTool    = "mcp__level0__wait"
	waitSession = "s1"
	shortWait   = 50 * time.Millisecond
	endsWithin  = 5 * time.Second
)

// The config a wait reads in its tree: a cap far past every case, and a quiet span of a second. [[spec/tickets/find-and-wait-in-go]]
const waitConfig = `{"wait":{"most":30,"quiet":1}}`

// The manager and the hooks door over the real wiring, with the waits module beside it. [[spec/tickets/find-and-wait-in-go]]
type waitWorld struct {
	served manager.Served
	door   *hooks.Door
	root   string
}

// [[spec/tickets/find-and-wait-in-go]]
func waitWorldOf(t *testing.T) waitWorld {
	t.Helper()
	root := t.TempDir()
	seedFile(t, root, "spec/config/level0.json", waitConfig)
	text, err := os.ReadFile(filepath.Join(treeRoot, filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	as := manager.Registers(c)
	_, hands, err := loaded(w, c)
	if err != nil {
		t.Fatal(err)
	}
	// [[spec/tickets/plan-writes-off-go]]
	for _, kind := range []string{waitsModuleType, plansModuleType} {
		if one, ok := modules[kind]; ok {
			one.registers(c)
		}
	}
	config.Registers(c)
	store := q.NewStore(c)
	served, err := manager.Serving(manager.Outside{
		Root: root, Store: store, As: as, Rows: opRows{heldTable{}},
		Steps: func(func()) {}, Now: time.Now,
		Every:  func(time.Duration, func(time.Time)) func() { return func() {} },
		Accept: accepts(root, store, nil),
	})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(served.Stop)
	hook := hookedOf(w, hands, hooksModule)
	door := hooks.New(hooks.Outside{
		Store: store, As: hook.as, Bound: hook.bound, Now: time.Now, Root: root,
		Call: func(name string, input any, caller string, wait time.Duration) (hooks.Called, error) {
			said, err := served.Call(name, input, caller, wait)
			return hooks.Called(said), err
		},
		Ops: func(caller string) []hooks.Op { return opsOf(served.Of(caller), time.Now()) },
	})
	return waitWorld{served: served, door: door, root: root}
}

// The hooks door lands a helper's stop, as the harness posts it. [[spec/tickets/find-and-wait-in-go]]
func (one waitWorld) reports(t *testing.T, agent string) {
	t.Helper()
	if _, err := one.door.Hook(hooks.Post{Event: "classic.Stop", E: map[string]any{"session_id": waitSession, "agent_id": agent}}); err != nil {
		t.Fatal(err)
	}
}

// The operation of the action the session started, once it ends, or the zero op where none ends in the span. [[spec/tickets/find-and-wait-in-go]]
func (one waitWorld) ended(action string) manager.Op {
	for stop := time.Now().Add(endsWithin); time.Now().Before(stop); time.Sleep(shortWait) {
		for _, op := range one.served.Of(waitSession) {
			if op.Action == action && !op.Ended.IsZero() {
				return op
			}
		}
	}
	return manager.Op{}
}

// [[spec/tickets/find-and-wait-in-go]]
func TestAWaitReturnsOnAHelpersReport(t *testing.T) {
	world := waitWorldOf(t)
	world.reports(t, "a1")
	said, err := world.served.Call(waitAction, map[string]any{"agent": "a1"}, waitSession, endsWithin)
	if err != nil {
		t.Fatalf("the wait calls with %v, and wants the helper's report", err)
	}
	if said.Running || said.Error != "" || said.Result != "The helper a1 reports." {
		t.Errorf("the wait answers %+v, and wants the result: The helper a1 reports.", said)
	}
}

// [[spec/tickets/find-and-wait-in-go]]
func TestAWaitPastTheCallWaitAnswersARunningHandle(t *testing.T) {
	world := waitWorldOf(t)
	said, err := world.served.Call(waitAction, map[string]any{"agent": "a2"}, waitSession, shortWait)
	if err != nil {
		t.Fatalf("the wait calls with %v, and wants a running handle", err)
	}
	if !said.Running || said.Handle == "" {
		t.Fatalf("the wait answers %+v past a call wait of %s, and wants it running with a handle", said, shortWait)
	}
	world.reports(t, "a2")
	if op := world.ended(waitAction); op.ID != said.Handle || op.Result != "The helper a2 reports." {
		t.Errorf("the operation %s ends as %+v, and wants the result: The helper a2 reports.", said.Handle, op)
	}
}

// [[spec/tickets/find-and-wait-in-go]]
func TestTheDoorAnswersAWaitPastItsCallWaitAsRunning(t *testing.T) {
	world := waitWorldOf(t)
	answer, err := world.door.Hook(hooks.Post{Event: "tool.call", E: map[string]any{
		"tool": waitTool, "session_id": waitSession,
		"input": map[string]any{"agent": "a3", "wait": shortWait.Seconds()},
	}})
	if err != nil {
		t.Fatal(err)
	}
	var texts []string
	for _, one := range answer.Effects {
		texts = append(texts, one.Text)
	}
	told := strings.Join(texts, "\n")
	if !strings.Contains(told, waitAction+" still running") || !strings.Contains(told, "Its result reaches your next turn.") {
		t.Errorf("the door answers %q to a wait past its call wait, and wants: %s still running ... Its result reaches your next turn.", told, waitAction)
	}
}
