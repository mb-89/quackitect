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
			door.from.Now = func() time.Time { return now }
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
