// The drafts module loads beside the others, and quack answers its checks
// through the IO side, with Vale off heardOver.
// [[spec/tickets/prose-tools-answer-in-go]]
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"quackitect/src/modules/drafts"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
	"quackitect/src/q/tool"
)

// [[spec/tickets/prose-tools-answer-in-go]]
func TestTheDraftsModuleLoads(t *testing.T) {
	t.Parallel()
	if _, ok := modules[drafts.Module]; !ok {
		t.Errorf("quack loads no module type %q", drafts.Module)
	}
}

// A tree with no Vale reads the draft nowhere, as the bridge says. [[spec/tickets/prose-tools-answer-in-go]]
func TestQuackAnswersAnAnswerCheckWithNoValeAsTheBridgeDoes(t *testing.T) {
	t.Parallel()
	ask := accepts(t.TempDir(), nil, nil)
	said, err := ask(q.Request{Module: drafts.Module, Verb: drafts.AnswerVerb, Args: drafts.Answer{Text: "The door reads the note."}})
	if err != nil {
		t.Fatalf("quack refuses the drafts module: %v", err)
	}
	if want := "No vale stands here, so the draft goes unread."; said != want {
		t.Errorf("the answer check answers %q, and wants %q", said, want)
	}
}

// The table the module answers, in the tree. [[spec/tickets/prose-tools-answer-in-go]]
const draftCasesFile = "src/modules/drafts/testdata/draft-cases.json"

// The case table, as the module test reads it. [[spec/tickets/prose-tools-answer-in-go]]
type wiredDrafts struct {
	Bands drafts.Bands `json:"bands"`
	Cases []struct {
		Name  string `json:"name"`
		Tool  string `json:"tool"`
		Asked int    `json:"asked"`
		Input struct {
			Path string `json:"path"`
			Text string `json:"text"`
			Stop bool   `json:"stop"`
		} `json:"input"`
		Vale struct {
			Stands bool             `json:"stands"`
			Ran    bool             `json:"ran"`
			Why    string           `json:"why"`
			Found  []drafts.Finding `json:"found"`
		} `json:"vale"`
		Answer string `json:"answer"`
	} `json:"cases"`
}

// Each case of the table reaches the wired module as a call, through the outside quack builds over a Vale the case fakes. [[spec/tickets/prose-tools-answer-in-go]]
func TestTheDraftCasesAnswerOffTheWiredModule(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join(treeRoot, filepath.FromSlash(draftCasesFile)))
	if err != nil {
		t.Fatal(err)
	}
	var table wiredDrafts
	if err := json.Unmarshal(text, &table); err != nil || len(table.Cases) == 0 {
		t.Fatalf("the table reads %v with %d cases, and wants cases", err, len(table.Cases))
	}
	for _, one := range table.Cases {
		t.Run(one.Name, func(t *testing.T) {
			root := t.TempDir()
			c := q.New()
			as := manager.Registers(c)
			drafts.Registers(c)
			store := q.NewStore(c)
			out := draftsOutside(root, store, func(string, string) drafts.Linted {
				return drafts.Linted{Found: one.Vale.Found, Stands: one.Vale.Stands, Ran: one.Vale.Ran, Why: one.Vale.Why}
			})
			out.Questions = func() int { return one.Asked }
			out.Bands = func() drafts.Bands { return table.Bands }
			served, err := manager.Serving(manager.Outside{
				Root: root, Store: store, As: as, Rows: opRows{heldTable{}},
				Steps: func(func()) {}, Clock: stillClock(),
				Accept: drafts.Accept(out),
			})
			if err != nil {
				t.Fatal(err)
			}
			defer served.Stop()
			input := map[string]any{"text": one.Input.Text, "stop": one.Input.Stop}
			if one.Tool == drafts.ProseVerb {
				input = map[string]any{"path": one.Input.Path, "text": one.Input.Text}
			}
			action, ok := tool.Action(store, one.Tool)
			if !ok {
				t.Fatalf("no action answers the tool %s", one.Tool)
			}
			said, err := served.Call(action, input, "s1", findWait)
			if err != nil || said.Error != "" || fmt.Sprint(said.Result) != one.Answer {
				t.Errorf("the wired check answers %v, err %v %q, and the bridge answers %q", said.Result, err, said.Error, one.Answer)
			}
		})
	}
}
