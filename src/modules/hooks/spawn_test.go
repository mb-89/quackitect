// The layer the door puts into a spawned helper's prompt, off onAgentSpawn in
// src/bridge/guidance.js: one case table, which the JavaScript builders write.
// [[spec/tickets/spawn-answers-off-the-door]]
package hooks

import (
	"encoding/json"
	"os"
	"testing"
)

// The case table the JavaScript builders write. [[spec/tickets/spawn-answers-off-the-door]]
const layerCases = cageLogs + "/layer-cases.json"

type layerRow struct {
	Name    string            `json:"name"`
	Files   map[string]string `json:"files"`
	Kind    string            `json:"kind"`
	Prompt  string            `json:"prompt"`
	Layer   string            `json:"layer"`
	Pass    bool              `json:"pass"`
	Wrapped string            `json:"wrapped"`
}

// The rows the JavaScript builders write. [[spec/tickets/spawn-answers-off-the-door]]
func layerRowsOf(t *testing.T) []layerRow {
	t.Helper()
	body, err := os.ReadFile(layerCases)
	if err != nil {
		t.Fatal(err)
	}
	var table struct {
		Cases []layerRow `json:"cases"`
	}
	if err := json.Unmarshal(body, &table); err != nil {
		t.Fatal(err)
	}
	if len(table.Cases) == 0 {
		t.Fatalf("no case stands in %s", layerCases)
	}
	return table.Cases
}

// The row's spawn, posted by the main agent to a door over the row's notes, and the event effect it answers, or nil. [[spec/tickets/spawn-answers-off-the-door]]
func spawns(t *testing.T, one layerRow) (Answer, map[string]any) {
	t.Helper()
	root := treeOf(t, one.Files, "")
	door := holdDoor(t, Settings{Words: nameWords, Binding: queueBinding, BindingLayer: builtInLayer})
	said, err := door.Hook(Post{Event: spawnEvent, Root: root, E: map[string]any{
		"session_id": "s1", "kind": one.Kind, "prompt": one.Prompt,
		"subagentType": "general-purpose", "description": one.Name,
	}})
	if err != nil {
		t.Fatal(err)
	}
	for _, effect := range said.Effects {
		if effect.Kind == eventEffect {
			event, _ := effect.Result.(map[string]any)
			return said, event
		}
	}
	return said, nil
}

// Whether the row's spawn takes the layer of its own kind. [[spec/tickets/spawn-answers-off-the-door]]
func kinded(one layerRow) bool {
	return one.Kind != "" && one.Layer == one.Kind
}

// A spawn naming no kind, or a kind with no layer, answers its event with the prompt wrapped in the helper layer, and a tree holding no rule passes it. [[spec/tickets/spawn-answers-off-the-door]]
func TestASpawnAnswersItsPromptWrappedInTheHelperLayer(t *testing.T) {
	for _, one := range layerRowsOf(t) {
		if kinded(one) {
			continue
		}
		t.Run(one.Name, func(t *testing.T) {
			said, event := spawns(t, one)
			if one.Pass {
				if event != nil {
					t.Fatalf("a spawn over no rule answers %+v, and wants a pass", said.Effects)
				}
				return
			}
			if event == nil {
				t.Fatalf("a spawn answers %+v, and wants an event carrying the prompt wrapped in the helper layer", said.Effects)
			}
			if got := textOf(event, "prompt"); got != one.Wrapped {
				t.Fatalf("the spawn's prompt reads\n%s\nand wants\n%s", got, one.Wrapped)
			}
			if textOf(event, "subagentType") != "general-purpose" || textOf(event, "description") != one.Name {
				t.Fatalf("the rewritten spawn drops its fields: %+v", event)
			}
		})
	}
}

// A spawn naming a kind with a layer answers its event with the prompt wrapped in that kind's layer. [[spec/tickets/spawn-answers-off-the-door]]
func TestASpawnOfAKindTakesThatKindsLayer(t *testing.T) {
	ran := false
	for _, one := range layerRowsOf(t) {
		if !kinded(one) {
			continue
		}
		ran = true
		t.Run(one.Name, func(t *testing.T) {
			said, event := spawns(t, one)
			if event == nil {
				t.Fatalf("a spawn of the kind %q answers %+v, and wants an event carrying that kind's layer", one.Kind, said.Effects)
			}
			if got := textOf(event, "prompt"); got != one.Wrapped {
				t.Fatalf("the spawn's prompt reads\n%s\nand wants\n%s", got, one.Wrapped)
			}
		})
	}
	if !ran {
		t.Fatalf("no row of %s names a kind with a layer", layerCases)
	}
}

// A helper's spawn opens on the hand of the session the session file names, and the wrapper's own spawn and a box naming no session take no line. [[spec/design_output/pull#a-hand-of-its-own]]
func TestASpawnOpensOnTheHandOfItsSession(t *testing.T) {
	const tag = "You are the hand of session s7 on this box, so you pull under no --as."
	for _, one := range []struct {
		name    string
		session string
		own     bool
		want    string
	}{
		{"a helper of a session", `{"id":"s7","harness":"claude-code"}`, false, tag + "\n\nwork one step"},
		{"the wrapper's own spawn", `{"id":"s7"}`, true, ""},
		{"a box carrying no session file", "", false, ""},
		{"a session file naming no id", `{"harness":"claude-code"}`, false, ""},
	} {
		t.Run(one.name, func(t *testing.T) {
			files := map[string]string{}
			if one.session != "" {
				files[sessionFile] = one.session
			}
			root := treeOf(t, files, "")
			door := holdDoor(t, Settings{Words: nameWords, Binding: queueBinding, BindingLayer: builtInLayer})
			said, err := door.Hook(Post{Event: spawnEvent, Root: root, E: map[string]any{
				"session_id": "s1", "prompt": "work one step", "own": one.own,
			}})
			if err != nil {
				t.Fatal(err)
			}
			got := ""
			for _, effect := range said.Effects {
				if event, ok := effect.Result.(map[string]any); ok && effect.Kind == eventEffect {
					got = textOf(event, "prompt")
				}
			}
			if got != one.want {
				t.Fatalf("the spawn's prompt reads %q, and wants %q", got, one.want)
			}
		})
	}
}
