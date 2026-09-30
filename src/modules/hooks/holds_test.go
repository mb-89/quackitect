// The holds against the bridge: one case table, written off the bridge's own
// answers, which the door answers alike, text for text, and the call a held
// call asks back for.
// [[spec/tickets/cage-call-holds-port]]
package hooks

import (
	"encoding/json"
	"os"
	"strings"
	"testing"
)

// The case table the bridge's own answers wrote, which the door answers alike. [[spec/tickets/cage-call-holds-port]]
const holdCases = cageLogs + "/call-holds-cases.json"

type holdPost struct {
	Event string         `json:"event"`
	E     map[string]any `json:"e"`
}

type holdCase struct {
	Name     string         `json:"name"`
	Config   map[string]any `json:"config"`
	Cloud    bool           `json:"cloud"`
	Events   []holdPost     `json:"events"`
	Call     holdPost       `json:"call"`
	Decision string         `json:"decision"`
	Text     string         `json:"text"`
}

// The bridge's dotted keys, as the Settings fields carrying them. [[spec/tickets/cage-call-holds-port]]
var settingsKeys = map[string]string{
	"stop.hold":       "hold",
	"ask.wanted":      "ask",
	"engine.binding":  "binding",
	"grace.finish":    "finishGrace",
	"grace.update":    "updateGrace",
	"plan.everyCalls": "planEvery",
	"plan.grace":      "planGrace",
	"plan.mostOpen":   "planMostOpen",
}

// The tier a helper key names, the prefix the bridge reads each model under, and the event the bridgehead posts after a held call. [[spec/tickets/cage-call-holds-port]]
const (
	helperKey   = "helper."
	spokenEvent = "agent.spoke"
)

// The Settings a case's config says, over the words the table's tree holds. [[spec/tickets/cage-call-holds-port]]
func settingsOf(t *testing.T, config map[string]any, cloud bool) Settings {
	t.Helper()
	fields := map[string]any{"cloud": cloud}
	helpers := map[string]any{}
	for key, value := range config {
		if tier, ok := strings.CutPrefix(key, helperKey); ok {
			helpers[tier] = value
			continue
		}
		name, ok := settingsKeys[key]
		if !ok {
			t.Fatalf("the case names %s, a key no Settings field carries", key)
		}
		fields[name] = value
	}
	if len(helpers) > 0 {
		fields["helpers"] = helpers
	}
	body, err := json.Marshal(fields)
	if err != nil {
		t.Fatal(err)
	}
	settings := Settings{Words: nameWords}
	if err := json.Unmarshal(body, &settings); err != nil {
		t.Fatal(err)
	}
	return settings
}

// A post of the case under the session s1, where the spoke post names none, as the bridgehead sends it. [[spec/tickets/cage-call-holds-port]]
func postOf(one holdPost) Post {
	e := map[string]any{}
	for key, value := range one.E {
		e[key] = value
	}
	if one.Event != spokenEvent {
		e["session_id"] = "s1"
	}
	return Post{Event: one.Event, E: e}
}

func holdDoor(t *testing.T, settings Settings) *Door {
	t.Helper()
	door := doorOver(t, &calls{}, &book{}).door
	door.from.Config = func(string) Settings { return settings }
	return door
}

// Every call the bridge holds or refuses, the door holds or refuses with the same text, and every one it passes the door passes. [[spec/tickets/cage-call-holds-port]]
func TestTheHoldsAnswerWhatTheBridgeAnswers(t *testing.T) {
	body, err := os.ReadFile(holdCases)
	if err != nil {
		t.Fatal(err)
	}
	var table struct {
		Cases []holdCase `json:"cases"`
	}
	if err := json.Unmarshal(body, &table); err != nil {
		t.Fatal(err)
	}
	for _, one := range table.Cases {
		t.Run(one.Name, func(t *testing.T) {
			door := holdDoor(t, settingsOf(t, one.Config, one.Cloud))
			for _, each := range one.Events {
				hooks(t, door, postOf(each))
			}
			post := postOf(one.Call)
			said := hooks(t, door, post)
			if got := NewDecisionOf(post, said); got != one.Decision {
				t.Fatalf("the door reads %s where the bridge reads %s, answering %+v", got, one.Decision, said)
			}
			if got := refusalOf(said); got != one.Text {
				t.Fatalf("the door says\n%s\nwhere the bridge says\n%s", got, one.Text)
			}
		})
	}
}

// A call the owner's prompt holds answers the rows effect, carrying the call id the spoke post answers under. [[spec/tickets/cage-call-holds-port]]
func TestAHeldCallAsksBackForRows(t *testing.T) {
	door := holdDoor(t, Settings{Words: nameWords})
	hooks(t, door, postOf(holdPost{Event: "prompt.submit", E: map[string]any{"text": "carry on", "origin": map[string]any{"kind": "composer"}}}))
	said := hooks(t, door, postOf(holdPost{Event: toolEvent, E: map[string]any{"tool": "Read", "tool_use_id": "c1"}}))
	for _, one := range said.Effects {
		if one.Kind != rowsKind {
			continue
		}
		body, _ := json.Marshal(one)
		var fields map[string]any
		if err := json.Unmarshal(body, &fields); err != nil {
			t.Fatal(err)
		}
		if call, _ := fields["call"].(string); call == "" {
			t.Fatalf("the rows effect reads %s, and wants the call id it asks back under", body)
		}
		return
	}
	t.Fatalf("the held call answers %+v, and wants the rows effect", said)
}

// The Agent door names each tier's model where it refuses, and passes a call naming one. [[spec/tickets/cage-call-holds-port]]
func TestTheAgentDoorReadsTheTiers(t *testing.T) {
	settings := settingsOf(t, map[string]any{"helper.find": "haiku", "helper.change": "opus", "helper.decide": "opus"}, false)
	agent := func(model string) Answer {
		return hooks(t, holdDoor(t, settings), postOf(holdPost{Event: toolEvent, E: map[string]any{"tool": "Agent", "prompt": "map them", "model": model}}))
	}
	refused := refusalOf(agent("sonnet"))
	for _, want := range []string{"names model sonnet, a model of no tier", "find takes `haiku`", "change takes `opus`", "decide takes `opus`"} {
		if !strings.Contains(refused, want) {
			t.Fatalf("the refusal reads %q, and wants %q", refused, want)
		}
	}
	if said := agent("opus"); refusalOf(said) != "" {
		t.Fatalf("a call naming a tier's model answers %+v, and wants it passed", said)
	}
}

// Each drop the fold names reaches the local layer through the door's writer: the hold at the turn's end, and the ask at its pay. [[spec/tickets/cage-hold-drops-port]]
func TestTheDoorWritesEachDropItsFoldNames(t *testing.T) {
	type dropped struct{ key, value string }
	for _, one := range []struct {
		name     string
		settings Settings
		posts    []Post
		want     dropped
	}{
		{"the turn's end drops the hold", Settings{Hold: finishHold}, []Post{
			{Event: turnEvent, E: map[string]any{"reason": answerReason, "answer": "done", "session_id": "s1"}},
		}, dropped{heldHold, offHold}},
		{"the paid update drops the ask", Settings{Ask: "brief"}, []Post{
			{Event: toolEvent, E: map[string]any{"tool": "Read", "session_id": "s1"}},
			{Event: displayEvent, E: map[string]any{"delta": "The tests stand green.", "session_id": "s1"}},
		}, dropped{heldAsk, quiet}},
	} {
		t.Run(one.name, func(t *testing.T) {
			door := holdDoor(t, one.settings)
			var got []dropped
			door.from.Drop = func(_, key, value string) error {
				got = append(got, dropped{key, value})
				return nil
			}
			for _, post := range one.posts {
				if _, err := door.Hook(post); err != nil {
					t.Fatal(err)
				}
			}
			if len(got) != 1 || got[0] != one.want {
				t.Fatalf("the door writes %v, and wants %v alone", got, one.want)
			}
		})
	}
}
