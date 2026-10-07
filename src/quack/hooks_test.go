// The wiring loads the hooks IO module and the folds over session/, and an
// event the door writes lands under session/<id>/ by the names it binds.
// [[spec/tickets/the-hooks-door-lands]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"os" // level0: OutsideInDoors - the case reads the tree's own wiring, as a build check reads source
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/modules/hooks"
	"quackitect/src/q"
)

func TestTheWiringBindsTheHooksEventsAndTheSessionFolds(t *testing.T) {
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
	_, hands, err := loaded(w, c)
	if err != nil {
		t.Fatal(err)
	}
	if faults := c.Check(); len(faults) > 0 {
		t.Fatal(faults)
	}
	hook := hookedOf(w, hands, hooksModule)
	if !hook.on || hook.bound("events/s1") != "session/s1/events" || hook.bound("config/wait") != "hooks/config/wait" {
		t.Fatalf("the hooks instance binds events/s1 to %q, and wants session/s1/events", hook.bound("events/s1"))
	}
	s := q.NewStore(c)
	if folds := strings.Join(s.Folds("session/<id>/"), " "); folds != "session/<id>/fill session/<id>/last session/<id>/reports" {
		t.Fatalf("the folds under session/ read %q, and want the fill, the last and the reports", folds)
	}
	door := hooks.New(hooks.Outside{Store: s, As: hook.as, Bound: hook.bound, Clock: wall})
	if _, err := door.Hook(hooks.Post{Event: "tool.call", E: map[string]any{"tool": "Read", "session_id": "s1"}, Fill: 900}); err != nil {
		t.Fatal(err)
	}
	read := s.Snapshot()
	if event, ok := read.Read("session/s1/events").(q.Event); !ok || event.Seq != 1 {
		t.Fatalf("session/s1/events holds %+v, and wants the first event", read.Read("session/s1/events"))
	}
	if fill := read.Read("session/s1/fill"); fill != 900 {
		t.Fatalf("session/s1/fill reads %v, and wants the 900 the post carries", fill)
	}
}

// The command rules read the name cap off the root's config and the cloud flag off the environment. [[spec/tickets/cage-command-rules-port]]
func TestTheCommandSettingsReadTheRootAndTheBox(t *testing.T) {
	root := t.TempDir()
	seedTree(t, root, map[string]string{"spec/config/level0.json": `{"names":{"words":3}}`})
	for _, name := range cloudVariables {
		t.Setenv(name, "")
	}
	if said := commandSettings(quietBox(), root); said.Words != 3 || said.Cloud {
		t.Fatalf("the settings read %+v, and want three words off the box's desk", said)
	}
	t.Setenv(cloudVariables[0], "1")
	if said := commandSettings(quietBox(), root); !said.Cloud {
		t.Fatalf("the settings read %+v, and want the cloud flag", said)
	}
	if said := gitRead(root, "no-such-verb"); said != "" {
		t.Fatalf("a failing git read prints %q, and wants nothing", said)
	}
}

// The holds read the hold, the ask, the binding, the graces, the plan's numbers and the helper tiers off the root's config. [[spec/tickets/cage-call-holds-port]]
func TestCommandSettingsReadTheHoldKeys(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	config := `{"stop":{"hold":"finish"},"ask":{"wanted":"short"},"engine":{"binding":"god"},"grace":{"finish":3,"update":2},"plan":{"everyCalls":4,"grace":1,"mostOpen":5},"helper":{"find":"haiku","change":"opus","decide":"opus"}}`
	seedTree(t, root, map[string]string{"spec/config/level0.json": config})
	body, _ := json.Marshal(commandSettings(quietBox(), root))
	var said map[string]any
	if err := json.Unmarshal(body, &said); err != nil {
		t.Fatal(err)
	}
	for key, want := range map[string]any{"Hold": "finish", "Ask": "short", "Binding": "god", "FinishGrace": float64(3), "UpdateGrace": float64(2), "PlanEvery": float64(4), "PlanGrace": float64(1), "PlanMostOpen": float64(5)} {
		if said[key] != want {
			t.Errorf("the settings read %s=%v, and want %v", key, said[key], want)
		}
	}
	helpers, _ := said["Helpers"].(map[string]any)
	if helpers["find"] != "haiku" || helpers["change"] != "opus" || helpers["decide"] != "opus" {
		t.Fatalf("the settings read the tiers %v, and want each tier's model", said["Helpers"])
	}
}
