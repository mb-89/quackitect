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
	// What the schemas answer over each written text, which src/quack holds to the check. [[spec/tickets/cage-write-door-port]]
	Schema map[string]write.Judged `json:"schema"`
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

// A Schema answering what the schemas say over each text a table teaches, or none where it teaches none. [[spec/tickets/cage-write-door-port]]
func taughtSchema(said map[string]write.Judged) func(root, where, text string) write.Judged {
	if said == nil {
		return nil
	}
	return func(_, _, text string) write.Judged { return said[text] }
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
			door.from.Schema = taughtSchema(table.Schema)
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

// [[spec/tickets/edit-tools-answer-in-go]]
func TestJudgeRefusesTheSchemaBeforeTheVoice(t *testing.T) {
	where := "spec/a.md"
	schema := func() write.Judged {
		return write.Judged{Kind: "rationale", Found: []write.Finding{{Rule: "Front", Line: 1, Column: 1, Message: "a fault"}}}
	}
	voiced := false
	voice := func() []write.Finding {
		voiced = true
		return []write.Finding{{Rule: "Level0.Private", Line: 2, Column: 1, Message: "a name"}}
	}
	if got := Judge(where, schema, voice); !strings.HasPrefix(got, "The rationale schema refuses this write to spec/a.md.") || voiced {
		t.Errorf("Judge answers %q, reading the voice %v, and wants the schema's refusal alone", got, voiced)
	}
	if got := Judge(where, func() write.Judged { return write.Judged{} }, voice); !strings.HasPrefix(got, "The voice rules refuse this write to spec/a.md.") {
		t.Errorf("Judge answers %q past a clean schema, and wants the voice's refusal", got)
	}
	if got := Judge(where, nil, func() []write.Finding { return []write.Finding{{Rule: "Level0.Modal"}} }); got != "" {
		t.Errorf("Judge answers %q over a warning alone, and wants nothing", got)
	}
}

// The voice refusal reads as it reads before its body moves into src/prose. [[spec/tickets/prose-tools-answer-in-go]]
func TestTheRefusalBodyReadsAsBefore(t *testing.T) {
	said := RefusedVoice("spec/a.md", []write.Finding{
		{Rule: "VoiceVale.Jargon", Line: 1, Column: 10, Said: "leverages", Message: "Name the thing."},
		{Rule: "VoiceVale.Hedge", Line: 2, Column: 1, Message: "Cut the hedge."},
	})
	want := "The voice rules refuse this write to spec/a.md.\n\n" +
		"  spec/a.md:1:10  VoiceVale.Jargon\n    wrote: leverages\n    Name the thing.\n\n" +
		"  spec/a.md:2:1  VoiceVale.Hedge\n    Cut the hedge.\n\n" +
		"Hold VoiceVale.Jargon and VoiceVale.Hedge for the rest of this turn: apply the same rule to every line you write next, and fix the lines you already wrote if they break it."
	if said != want {
		t.Errorf("the refusal reads %q, and wants %q", said, want)
	}
}
