// The command door against the bridge: one case table, written off the
// bridge's own answers, which the door answers alike, text for text.
// [[spec/tickets/cage-command-rules-port]]
package hooks

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// The case table the bridge's own answers wrote, which the door answers alike. [[spec/tickets/cage-command-rules-port]]
const commandCases = cageLogs + "/command-cases.json"

type commandCase struct {
	Name        string `json:"name"`
	Tool        string `json:"tool"`
	Command     string `json:"command"`
	Description string `json:"description"`
	Todo        string `json:"todo"`
	Decision    string `json:"decision"`
	Text        string `json:"text"`
}

type commandTable struct {
	Tree  map[string]string `json:"tree"`
	Cases []commandCase     `json:"cases"`
}

func commandTableOf(t *testing.T) commandTable {
	t.Helper()
	body, err := os.ReadFile(commandCases)
	if err != nil {
		t.Fatal(err)
	}
	var table commandTable
	if err := json.Unmarshal(body, &table); err != nil {
		t.Fatal(err)
	}
	return table
}

// A tree holding the table's files, and the plan naming the case's todo where it names one. [[spec/tickets/cage-command-rules-port]]
func treeOf(t *testing.T, files map[string]string, todo string) string {
	t.Helper()
	root := t.TempDir()
	if todo != "" {
		plan, _ := json.Marshal(map[string]string{"working": todo})
		files = with(files, ".se/.runtime/plan.json", string(plan))
	}
	for path, text := range files {
		at := filepath.Join(root, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return root
}

func with(files map[string]string, path, text string) map[string]string {
	out := make(map[string]string, len(files)+1)
	for key, value := range files {
		out[key] = value
	}
	out[path] = text
	return out
}

// The text a refusal carries, off the result effect answering the call. [[spec/tickets/cage-command-rules-port]]
func refusalOf(said Answer) string {
	for _, one := range said.Effects {
		if one.Kind == resultKind {
			return one.Text
		}
	}
	return ""
}

// Every command the bridge refuses, the door refuses with the same text, and every one it passes the door passes. [[spec/tickets/cage-command-rules-port]]
func TestTheDoorRefusesWhatTheBridgeRefuses(t *testing.T) {
	table := commandTableOf(t)
	for _, one := range table.Cases {
		t.Run(one.Name, func(t *testing.T) {
			e := map[string]any{"tool": one.Tool, "command": one.Command, "session_id": "s1"}
			if one.Description != "" {
				e["description"] = one.Description
			}
			post := Post{Event: toolEvent, E: e, Root: treeOf(t, table.Tree, one.Todo)}
			said, err := doorOver(t, &calls{}, &book{}).door.Hook(post)
			if err != nil {
				t.Fatal(err)
			}
			if got := NewDecisionOf(post, said); got != one.Decision {
				t.Fatalf("the door reads %s where the bridge reads %s, answering %+v", got, one.Decision, said)
			}
			if got := refusalOf(said); got != one.Text {
				t.Fatalf("the door says\n%s\nwhere the bridge says\n%s", got, one.Text)
			}
		})
	}
}
