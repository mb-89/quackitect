// The turn's end against the bridge: one case table, written off the
// bridge's own answers over the live stop rules, which the door answers alike.
// [[spec/tickets/cage-stop-rules-port]]
package hooks

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/hooks/stop"
	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The case table the bridge's own answers wrote, the tree's root the live files stand under, and the layer the config and the schema answer from. [[spec/tickets/cage-stop-rules-port]]
const (
	stopCases    = cageLogs + "/stop-cases.json"
	treeRoot     = "../../.."
	trackedLayer = "spec/config/level0.json"
	builtInLayer = "built-in"
	queueBinding = "queue"
)

type stopCase struct {
	Name     string            `json:"name"`
	Config   map[string]any    `json:"config"`
	Cloud    bool              `json:"cloud"`
	Git      map[string]string `json:"git"`
	Files    map[string]string `json:"files"`
	Events   []holdPost        `json:"events"`
	Call     holdPost          `json:"call"`
	Decision string            `json:"decision"`
	Text     string            `json:"text"`
}

type stopTable struct {
	Now   string     `json:"now"`
	Live  []string   `json:"live"`
	Cases []stopCase `json:"cases"`
}

func stopTableOf(t *testing.T) stopTable {
	t.Helper()
	body, err := os.ReadFile(stopCases)
	if err != nil {
		t.Fatal(err)
	}
	var table stopTable
	if err := json.Unmarshal(body, &table); err != nil {
		t.Fatal(err)
	}
	return table
}

// The tree a case stands in: the live rules and schema, the case's config as the tracked layer, and its own files. [[spec/tickets/cage-stop-rules-port]]
func stopTreeOf(t *testing.T, table stopTable, one stopCase) string {
	t.Helper()
	files := map[string]string{}
	for _, path := range table.Live {
		body, err := os.ReadFile(filepath.Join(treeRoot, filepath.FromSlash(path)))
		if err != nil {
			t.Fatal(err)
		}
		files[path] = string(body)
	}
	nested := map[string]map[string]any{}
	for key, value := range one.Config {
		section, leaf, _ := strings.Cut(key, ".")
		if nested[section] == nil {
			nested[section] = map[string]any{}
		}
		nested[section][leaf] = value
	}
	config, err := json.Marshal(nested)
	if err != nil {
		t.Fatal(err)
	}
	files[trackedLayer] = string(config)
	for path, text := range one.Files {
		files[path] = text
	}
	return treeOf(t, files, "")
}

// The Settings a case's config says, with the binding the schema answers where the case sets none. [[spec/tickets/cage-stop-rules-port]]
func stopSettingsOf(one stopCase) Settings {
	settings := Settings{Words: nameWords, Cloud: one.Cloud, Binding: queueBinding, BindingLayer: builtInLayer}
	for key, value := range one.Config {
		switch key {
		case heldHold:
			settings.Hold, _ = value.(string)
		case heldAsk:
			settings.Ask, _ = value.(string)
		case "stop.enabled":
			on, _ := value.(bool)
			settings.StopOff = !on
		case "stop.mostInARow":
			most, _ := value.(float64)
			settings.MostInARow = int(most)
		case "context.handoverAt":
			at, _ := value.(float64)
			settings.HandoverAt = int(at)
		case heldBinding:
			settings.Binding, _ = value.(string)
			settings.BindingLayer = trackedLayer
		}
	}
	return settings
}

// The text a block carries, off the block effect answering the Stop. [[spec/tickets/cage-stop-rules-port]]
func blockOf(said Answer) string {
	for _, one := range said.Effects {
		if one.Kind == blockKind {
			return one.Text
		}
	}
	return ""
}

// Every turn's end the bridge blocks, the door blocks with the same text, and every one it lets end the door lets end. [[spec/tickets/cage-stop-rules-port]]
func TestTheStopBlocksWhatTheBridgeBlocks(t *testing.T) {
	table := stopTableOf(t)
	now, err := time.Parse(time.RFC3339, table.Now)
	if err != nil {
		t.Fatal(err)
	}
	for _, one := range table.Cases {
		t.Run(one.Name, func(t *testing.T) {
			root := stopTreeOf(t, table, one)
			door := holdDoor(t, stopSettingsOf(one))
			door.from.Git = taughtGit(one.Git)
			door.from.Clock = qtest.NewFake(now)
			for _, each := range one.Events {
				post := postOf(each)
				post.Root = root
				if _, err := door.Hook(post); err != nil {
					t.Fatal(err)
				}
			}
			post := postOf(one.Call)
			post.Root = root
			said, err := door.Hook(post)
			if err != nil {
				t.Fatal(err)
			}
			if got := NewDecisionOf(post, said); got != one.Decision {
				t.Fatalf("the door reads %s where the bridge reads %s, answering %+v", got, one.Decision, said)
			}
			if got := blockOf(said); got != one.Text {
				t.Fatalf("the door says\n%s\nwhere the bridge says\n%s", got, one.Text)
			}
		})
	}
}

// The fill a case measures, past the handover mark it sets, and the rules it votes over. [[spec/tickets/cage-stop-rules-port]]
const (
	caseMark  = 1000
	caseFill  = 5000
	caseRules = `- id: the-work-stands-complete
  side: stop
  priority: 45
  decides: claimed
  runs: the-plan-is-empty
  asks: Does the work stand complete?

- id: the-last-line-names-no-stop
  side: continue
  priority: 50
  decides: mechanical
  runs: no-stop-line
  says: The last line names no stop reason.

- id: the-owner-holds-this-session
  side: stop
  priority: 85
  decides: mechanical
  runs: owner-holds
`
)

// One event of the session s1, or of the helper a1, at the next place, beside the holds the same event left. [[spec/tickets/cage-stop-rules-port]]
func stopStepper() func(kind, agent string, fields map[string]any, holds Holds) Stops {
	var state Stops
	seq := int64(0)
	return func(kind, agent string, fields map[string]any, holds Holds) Stops {
		seq++
		with := map[string]any{holdsField: holds}
		for key, value := range fields {
			with[key] = value
		}
		state = stepStops(state, q.Event{Seq: seq, At: fixed, Kind: kind, Hand: q.Hand{Session: "s1", Agent: agent}, Fields: with})
		return state
	}
}

// The fold counts the owner's prompts, the helpers and the todos, keeps the stop call's claim until the Stop reads it, goes due past the mark and clears at the turn the clear ends, and reads the owner's dropped hold off the holds fold alone. [[spec/tickets/cage-stop-rules-port]]
func TestTheStopsFoldKeepsWhatTheBoxKeeps(t *testing.T) {
	rules, _ := stop.RulesOf(caseRules)
	queue := map[string]any{heldBinding: queueBinding}
	facts := Stopped{HandoverAt: caseMark, Rules: rules, Layer: builtInLayer}
	land := stopStepper()
	owner := map[string]any{"origin": map[string]any{"kind": "composer"}, heldField: queue, stoppedField: facts}
	land(promptEvent, "", owner, Holds{})
	land(promptEvent, "", map[string]any{"origin": map[string]any{"kind": "task"}, heldField: queue, stoppedField: facts}, Holds{})
	land(spawnEvent, "", map[string]any{"background": true}, Holds{})
	state := land(toolEvent, "", map[string]any{"tool": "TodoWrite", "todos": []any{map[string]any{"status": "pending"}}}, Holds{})
	if state.Prompts != 1 || state.Helpers != 1 || !state.standing() || state.Binding == nil || state.Binding.Layer != builtInLayer {
		t.Fatalf("the fold keeps %+v, and wants one owner prompt, one helper, a todo standing and the binding read", state)
	}
	if state = land(stopEvent, "a1", nil, Holds{}); state.Helpers != 0 || state.Said.Word != "" {
		t.Fatalf("a helper's stop leaves %+v, and wants its mark off and a pass", state)
	}
	call := map[string]any{"tool": stopCall, "reason": "the-work-stands-complete", heldField: queue, stoppedField: facts}
	if state = land(toolEvent, "", call, Holds{Said: Said{Word: HoldWord}}); state.Claim != "" {
		t.Fatalf("a stop call the holds hold claims %q, and wants no claim", state.Claim)
	}
	if state = land(toolEvent, "", call, Holds{}); state.Claim != "the-work-stands-complete" {
		t.Fatalf("a stop call over an empty plan claims %q, and wants its reason", state.Claim)
	}
	end := map[string]any{"last_assistant_message": "done", heldField: queue, stoppedField: facts}
	if state = land(stopEvent, "", end, Holds{}); state.Said.Word != "" || state.Claim != "" || state.InARow != 0 {
		t.Fatalf("the Stop over the call's claim leaves %+v, and wants a pass with the claim spent", state)
	}
	if state = land(stopEvent, "", end, Holds{}); state.Said.Word != BlockWord || state.InARow != 1 {
		t.Fatalf("a Stop naming no line leaves %+v, and wants a block and one hold in a row", state)
	}
	if state = land(stopEvent, "", end, Holds{Stood: stopHold}); state.Said.Word != "" || state.InARow != 0 {
		t.Fatalf("a Stop under the stood hold leaves %+v, and wants a pass", state)
	}
	measure := map[string]any{"context": map[string]any{"tokens": float64(caseFill)}, heldField: queue, stoppedField: facts}
	if state = land(measureEvent, "", measure, Holds{}); state.Handover == nil || state.Handover.Phase != dueFinish {
		t.Fatalf("a fill past the mark leaves %+v, and wants the session due", state.Handover)
	}
	cleared := facts
	cleared.Clear = true
	if state = land(stopEvent, "", map[string]any{"last_assistant_message": "done", heldField: queue, stoppedField: cleared}, Holds{}); state.Said.Word != ClearWord || state.Said.Text != ResumePrompt || state.Handover != nil {
		t.Fatalf("a held clear leaves %+v, and wants the turn to end on the clear with the resume prompt and the mark off", state)
	}
}
