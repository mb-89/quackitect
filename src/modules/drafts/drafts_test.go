// The prose check and the answer check answer every case of the table the bridge's own
// answers fill, over a Vale that answers the case's rows.
// [[spec/tickets/prose-tools-answer-in-go]]
package drafts

import (
	_ "embed"
	"encoding/json"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
	"quackitect/src/q/tool"
)

// The name an answer lints as. [[spec/tickets/prose-tools-answer-in-go]]
const answerFile = "level0-answer.md"

//go:embed testdata/draft-cases.json
var draftCases []byte // The case table the bridge answers alike, riding in through embed so the module imports no os. [[spec/tickets/io-answers-take-result-shape]]

// One case: the tool, its input, what Vale answers, the owner's question count, and the text the bridge answers. [[spec/tickets/prose-tools-answer-in-go]]
type draftCase struct {
	Name  string `json:"name"`
	Tool  string `json:"tool"`
	Asked int    `json:"asked"`
	Input struct {
		Path string `json:"path"`
		Text string `json:"text"`
		Stop bool   `json:"stop"`
	} `json:"input"`
	Vale struct {
		Stands bool      `json:"stands"`
		Ran    bool      `json:"ran"`
		Why    string    `json:"why"`
		Found  []Finding `json:"found"`
	} `json:"vale"`
	Answer string `json:"answer"`
}

type draftTable struct {
	Bands Bands       `json:"bands"`
	Cases []draftCase `json:"cases"`
}

// The table, read once a case. [[spec/tickets/prose-tools-answer-in-go]]
func readTable(t *testing.T) draftTable {
	t.Helper()
	var table draftTable
	if err := json.Unmarshal(draftCases, &table); err != nil {
		t.Fatal(err)
	}
	return table
}

// An outside whose Vale answers the case's rows and keeps the names it lints as. [[spec/tickets/prose-tools-answer-in-go]]
func outsideOf(table draftTable, one draftCase, linted *[]string) Outside {
	return Outside{
		Lint: func(text, name string) Linted {
			*linted = append(*linted, name)
			return Linted{Found: one.Vale.Found, Stands: one.Vale.Stands, Ran: one.Vale.Ran, Why: one.Vale.Why}
		},
		Questions: func() int { return one.Asked },
		Bands:     func() Bands { return table.Bands },
	}
}

// The request a case's tool lists. [[spec/tickets/prose-tools-answer-in-go]]
func requestOf(one draftCase) q.Request {
	if one.Tool == ProseVerb {
		return q.Request{Module: Module, Verb: ProseVerb, Args: Prose{Path: one.Input.Path, Text: one.Input.Text}}
	}
	return q.Request{Module: Module, Verb: AnswerVerb, Args: Answer{Text: one.Input.Text, Stop: one.Input.Stop}}
}

// [[spec/tickets/prose-tools-answer-in-go]]
func TestTheDraftCasesAnswerOffTheModule(t *testing.T) {
	table := readTable(t)
	if len(table.Cases) == 0 {
		t.Fatal("the table holds no case")
	}
	for _, one := range table.Cases {
		t.Run(one.Name, func(t *testing.T) {
			var linted []string
			said, err := Accept(outsideOf(table, one, &linted))(requestOf(one))
			if err != nil {
				t.Fatal(err)
			}
			if said != one.Answer {
				t.Errorf("the check answers %q, and the bridge answers %q", said, one.Answer)
			}
		})
	}
}

// A prose check lints as its own path, and an answer check as the answer file, so Vale reads the kind each is. [[spec/tickets/prose-tools-answer-in-go]]
func TestEachCheckLintsAsTheFileItReads(t *testing.T) {
	table := readTable(t)
	for _, one := range []draftCase{table.Cases[2], table.Cases[12]} {
		var linted []string
		if _, err := Accept(outsideOf(table, one, &linted))(requestOf(one)); err != nil {
			t.Fatal(err)
		}
		want := one.Input.Path
		if one.Tool == AnswerVerb {
			want = answerFile
		}
		if len(linted) != 1 || linted[0] != want {
			t.Errorf("%s lints as %q, and wants %q once", one.Name, linted, want)
		}
	}
}

// A request naming another verb meets a refusal, as a find does. [[spec/tickets/prose-tools-answer-in-go]]
func TestAnotherVerbMeetsARefusal(t *testing.T) {
	if _, err := Accept(Outside{})(q.Request{Module: Module, Verb: "mint", Args: Prose{}}); err == nil {
		t.Errorf("the module answers the verb mint, and wants a refusal naming its two checks")
	}
}

// [[spec/tickets/level0-tools-leave-the-bridge]]
func TestEachCheckListsUnderTheNameTheAgentCalls(t *testing.T) {
	ix := qtest.New(t, func(cat *q.Catalog) { Registers(cat) })
	for verb, action := range map[string]string{ProseVerb: Module + "/" + proseAction, AnswerVerb: Module + "/" + answerAction} {
		if got, ok := tool.Action(ix.Store(), verb); !ok || got != action {
			t.Errorf("%s resolves to %q, %v, and wants %s", verb, got, ok, action)
		}
	}
}
