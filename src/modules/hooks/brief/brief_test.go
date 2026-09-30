// The brief package against the shared case table the JavaScript counts
// write, and the tools block off a survey.
// [[spec/tickets/brief-answers-off-the-door]]
package brief

import (
	"encoding/json"
	"os"
	"path"
	"strings"
	"testing"
)

// The case table both sides read. [[spec/tickets/brief-answers-off-the-door]]
const briefCases = "../../../../test/replay/cage/brief-cases.json"

type row struct {
	Name     string            `json:"name"`
	Stop     bool              `json:"stop"`
	Files    map[string]string `json:"files"`
	Rules    int               `json:"rules"`
	Notes    int               `json:"notes"`
	Sentence string            `json:"sentence"`
	Canary   string            `json:"canary"`
	Owes     string            `json:"owes"`
}

// A tree over a map of paths to texts. [[spec/tickets/brief-answers-off-the-door]]
type files map[string]string

func (one files) Read(at string) (string, bool) {
	text, ok := one[at]
	return text, ok
}

func (one files) List(folder string) []string {
	seen := map[string]bool{}
	var out []string
	for at := range one {
		rest, under := strings.CutPrefix(at, folder+"/")
		if !under {
			continue
		}
		name, _, _ := strings.Cut(rest, "/")
		if !seen[name] {
			seen[name] = true
			out = append(out, name)
		}
	}
	return out
}

func noEnv(string) string { return "" }

// Every row's counts, sentence, canary block and debt line match what the JavaScript gives. [[spec/tickets/brief-answers-off-the-door]]
func TestTheCountsMatchTheCaseTable(t *testing.T) {
	body, err := os.ReadFile(briefCases)
	if err != nil {
		t.Fatal(err)
	}
	var table struct {
		Cases []row `json:"cases"`
	}
	if err := json.Unmarshal(body, &table); err != nil {
		t.Fatal(err)
	}
	if len(table.Cases) == 0 {
		t.Fatalf("no case stands in %s", briefCases)
	}
	for _, one := range table.Cases {
		t.Run(one.Name, func(t *testing.T) {
			counts := CountsOf(files(one.Files), noEnv)
			if counts.Rules != one.Rules || counts.Notes != one.Notes {
				t.Fatalf("the counts read %+v, and the table says %d rules, %d notes", counts, one.Rules, one.Notes)
			}
			sentence := Canary(counts, one.Stop)
			if sentence != one.Sentence {
				t.Fatalf("the sentence reads %q, and the table says %q", sentence, one.Sentence)
			}
			if got := CanaryText(sentence); got != one.Canary {
				t.Fatalf("the canary block reads\n%s\nand the table says\n%s", got, one.Canary)
			}
			if got := Owes(sentence); got != one.Owes {
				t.Fatalf("the debt line reads\n%s\nand the table says\n%s", got, one.Owes)
			}
		})
	}
}

// A note binding a variable counts where the variable reads true, and the work root's note stands over the method root's. [[spec/tickets/brief-answers-off-the-door]]
func TestAVariableAndTheWorkRootMoveTheCounts(t *testing.T) {
	note := func(rules ...string) string {
		return "---\nkind: [[guidance]]\nenv: [SE_CLOUD]\n---\n\n# Actionables\n\n1. " + strings.Join(rules, "\n1. ") + "\n"
	}
	at := path.Join(Guidance, "cloud.md")
	method, work := files{at: note("One.")}, files{at: note("One.", "Two.")}
	if got := CountsOf(method, noEnv); got.Notes != 0 {
		t.Fatalf("a note binding an unset variable counts %+v", got)
	}
	cloud := func(name string) string { return map[string]string{"SE_CLOUD": "1"}[name] }
	if got := CountsOf(Layered(method, work), cloud); got != (Counts{Rules: 2, Notes: 1}) {
		t.Fatalf("the layered tree counts %+v, and wants the work root's two rules", got)
	}
}

// The tools block lists the surveyed tools in the wanted order, with the tier line under them. [[spec/tickets/brief-answers-off-the-door]]
func TestTheToolsBlockReadsTheSurvey(t *testing.T) {
	tiers := TiersLine(map[string]string{"find": "haiku"})
	got := ToolsText(`{"git":{"version":"2.43.0"},"sh":{}}`, tiers)
	want := "# What this box has\n\n- `git` 2.43.0, for history and diffs\n- `sh`, for a shell script\n\n" + tiers
	if got != want {
		t.Fatalf("the tools block reads\n%s\nand wants\n%s", got, want)
	}
	if ToolsText("", tiers) != "" {
		t.Fatal("a missing survey answers a tools block")
	}
}

// The canary opening an answer reads same, another count reads other, and a line past the first reads none. [[spec/tickets/brief-answers-off-the-door]]
func TestTheCanaryReadsTheFirstLine(t *testing.T) {
	sentence := Canary(Counts{Rules: 1, Notes: 1}, true)
	for answer, want := range map[string]string{
		sentence + "\n\nmore":                           Same,
		Canary(Counts{Rules: 2, Notes: 1}, true) + "\n": Other,
		"first\n" + sentence:                            None,
	} {
		if got := CanaryIn(answer, sentence); got != want {
			t.Fatalf("CanaryIn(%q) reads %s, and wants %s", answer, got, want)
		}
	}
}
