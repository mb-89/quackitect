// The write door against the shared case table: each harness write the bridge
// answers, which the door answers with the same decision and text.
// [[spec/tickets/cage-write-door-port]]
package hooks

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/modules/hooks/write"
)

const writeCases = "../../../test/replay/cage/write-door-cases.json"

// The root the bridge's recordings stand under, which a replay maps onto its own tree. [[spec/tickets/cage-write-door-port]]
const recordedRoot = "/tree"

type writeCase struct {
	Name     string            `json:"name"`
	Rule     string            `json:"rule"`
	Files    map[string]string `json:"files"`
	Voice    []write.Finding   `json:"voice"`
	E        map[string]any    `json:"e"`
	Decision string            `json:"decision"`
	Text     string            `json:"text"`
}

type writeTable struct {
	Root  string            `json:"root"`
	Live  []string          `json:"live"`
	Tree  map[string]string `json:"tree"`
	Cases []writeCase       `json:"cases"`
}

func writeTableOf(t *testing.T) writeTable {
	t.Helper()
	body, err := os.ReadFile(writeCases)
	if err != nil {
		t.Fatal(err)
	}
	var table writeTable
	if err := json.Unmarshal(body, &table); err != nil {
		t.Fatal(err)
	}
	return table
}

// A Prose answering the findings a case teaches, or none where it teaches none. [[spec/tickets/cage-write-door-port]]
func taughtProse(found []write.Finding) func(root, where, text string) []write.Finding {
	if found == nil {
		return nil
	}
	return func(string, string, string) []write.Finding { return found }
}

// The recorded root in a text, moved onto the tree a test stands in. [[spec/tickets/cage-write-door-port]]
func movedRoot(text, root string) string {
	return strings.ReplaceAll(text, recordedRoot+"/", filepath.ToSlash(root)+"/")
}

func TestTheWriteDoorRefusesWhatTheBridgeRefuses(t *testing.T) {
	table := writeTableOf(t)
	for _, one := range table.Cases {
		t.Run(one.Name, func(t *testing.T) {
			files := map[string]string{}
			for path, text := range table.Tree {
				files[path] = text
			}
			for path, text := range one.Files {
				files[path] = text
			}
			door := doorOver(t, &calls{}, &book{}).door
			door.from.Root = stopTreeOf(t, stopTable{Live: table.Live}, stopCase{Files: files})
			door.from.Prose = taughtProse(one.Voice)
			body, err := json.Marshal(one.E)
			if err != nil {
				t.Fatal(err)
			}
			var e map[string]any
			if err := json.Unmarshal([]byte(movedRoot(string(body), door.from.Root)), &e); err != nil {
				t.Fatal(err)
			}
			e["session_id"] = "s1"
			post := Post{Event: toolEvent, E: e}
			said := hooks(t, door, post)
			if got := NewDecisionOf(post, said); got != one.Decision {
				t.Fatalf("the door reads %s over %+v, want %s", got, said, one.Decision)
			}
			text := ""
			for _, each := range said.Effects {
				if each.Kind == resultKind {
					text = each.Text
				}
			}
			if text != one.Text {
				t.Fatalf("the door refuses with %q, want the bridge's %q", text, one.Text)
			}
		})
	}
}
