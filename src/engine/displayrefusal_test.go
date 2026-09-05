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
// The level-0 design carried it as an open spike: whether a refusal from the
// event that fires while assistant text is displayed is honoured was
// undocumented, so the design either over-promised a live guard or gave up one
// it had.
//
// THE ANSWER IS THAT NO REFUSAL IS EXPRESSIBLE THERE. The harness fires only the
// events it names in one list inside its own bundle. No event in that list
// arrives while the words reach the person. So there is nothing to fire, nothing
// to refuse from, and the words arrive whatever a hook would have said. The
// events that can refuse fire before the words exist, which is PreToolUse and
// UserPromptSubmit, or after they are already on the screen, which is Stop and
// SubagentStop. A block on Stop makes the agent write more and retracts nothing.
//
// MEASURED ON claude-code 2.1.42, the harness this tree runs under. Its list is
// PreToolUse, PostToolUse, PostToolUseFailure, Notification, UserPromptSubmit,
// SessionStart, SessionEnd, Stop, SubagentStart, SubagentStop, PreCompact,
// PermissionRequest, Setup, TeammateIdle and TaskCompleted. Read it again by
// searching the installed cli.js of @anthropic-ai/claude-code for the array
// whose first name is PreToolUse. MessageDisplay is in no array there and
// nowhere in that file, so this rule watches for an event 2.1.42 never sends.
//
// SO THE CAGE MUST NOT SUBSCRIBE TO ONE. An event in the cage reads as a guard,
// and a guard that cannot refuse is the over-promise the spike was about. This
// pins the absence, because an absence nobody checks is one somebody restores.

// displayOnly names the events that fire while assistant text reaches the
// person and carry no blocking decision. Subscribing to one buys nothing a
// refusal can act on. The name below is the one to watch for, and the harness
// measured above sends nothing by it.
var displayOnly = []string{"MessageDisplay"}

// displayOnlyEventsIn answers which display-only events a cage subscribes to.
//
// IT ANSWERED NOTHING, WHATEVER IT WAS HANDED. The rule below and the check
// that the check works were both written, and the reading between them was not,
// so the shipped cage passed on a function that could only ever say yes. That
// is the half-a-mechanism defect the work-token guidance names: ask which half
// has no output, because that is the one that will be missing.
func displayOnlyEventsIn(settings []byte) []string {
	var cage struct {
		Hooks map[string]json.RawMessage `json:"hooks"`
	}
	if json.Unmarshal(settings, &cage) != nil {
		return nil
	}
	var found []string
	for _, name := range displayOnly {
		if _, subscribed := cage.Hooks[name]; subscribed {
			found = append(found, name)
		}
	}
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
