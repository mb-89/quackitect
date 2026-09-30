// The brief package's counts over a layered tree, the tools block off a
// survey, and the canary on an answer's first line.
// [[spec/tickets/brief-answers-off-the-door]]
package brief

import (
	"path"
	"strings"
	"testing"
)

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
