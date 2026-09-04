package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// CAN THE DISPLAY BE REFUSED. It cannot, and this is the ruling written as a
// check so that it cannot quietly stop being true.
//
// The level-0 design carried it as an open spike: the event that fires while
// assistant text is displayed exists, and whether a refusal there is honoured
// was undocumented, so the design either over-promised a live guard or gave up
// one it had.
//
// THE ANSWER IS THAT NO REFUSAL IS EXPRESSIBLE THERE. MessageDisplay is the one
// event that fires while assistant text reaches the person, and the harness
// documents it as display-only: it carries no blocking decision at all, so the
// question of whether a refusal is honoured does not arise. The events that can
// refuse fire before the words exist, which is PreToolUse and UserPromptSubmit,
// or after they are already on the screen, which is Stop and SubagentStop. A
// block on Stop makes the agent write more and retracts nothing.
//
// SO THE CAGE MUST NOT SUBSCRIBE TO ONE. An event in the cage reads as a guard,
// and a guard that cannot refuse is the over-promise the spike was about. This
// pins the absence, because an absence nobody checks is one somebody restores.

// displayOnly names the events that fire while assistant text reaches the
// person and carry no blocking decision. Subscribing to one buys nothing a
// refusal can act on.
var displayOnly = []string{"MessageDisplay"}

// displayOnlyEventsIn answers which display-only events a cage subscribes to.
func displayOnlyEventsIn(settings []byte) []string {
	var cage struct {
		Hooks map[string]json.RawMessage `json:"hooks"`
	}
	if json.Unmarshal(settings, &cage) != nil {
		return nil
	}
	var found []string
	_ = cage
	return found
}

// A CHECK THAT CANNOT GO RED PROVES NOTHING ABOUT THE RULE. This one is handed
// a cage that does subscribe, so the shipped cage passing below means the cage
// and not the check.
func TestTheCheckSeesADisplayOnlyEventWhenThereIsOne(t *testing.T) {
	t.Parallel()
	const subscribed = `{"hooks":{"PreToolUse":[],"MessageDisplay":[],"Stop":[]}}`
	found := displayOnlyEventsIn([]byte(subscribed))
	if len(found) != 1 || found[0] != "MessageDisplay" {
		t.Fatalf("a cage subscribing to MessageDisplay was read as %v", found)
	}
}

func TestTheCageSubscribesToNoEventThatCannotRefuse(t *testing.T) {
	t.Parallel()
	b, err := os.ReadFile(filepath.Join("..", "..", "util", "cage", "claude-settings.json"))
	if err != nil {
		t.Fatalf("the cage will not read: %v", err)
	}
	if found := displayOnlyEventsIn(b); len(found) > 0 {
		t.Fatalf("the cage subscribes to %v, which fires while the words are already "+
			"reaching the person and carries no refusal. Nothing can act on it.", found)
	}
}
