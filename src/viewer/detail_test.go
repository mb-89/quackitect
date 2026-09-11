// What a row reads as, and what its details show. The fixtures here are rows in
// memory, and no test reads a file.

package main

import (
	"errors"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/charmbracelet/lipgloss"
)

func details(all []Record, at int) string {
	return renderParts(detailOf(all, at, time.UTC), 80)
}

func TestAParsedRowKeepsItsOwnFieldsAndHandsTheRestToExtra(t *testing.T) {
	t.Parallel()
	r := ParseRecord(`{"at":"2026-09-11T15:08:36.490Z","level":"info","kind":"prompt","said":"Are you bound?","detail":"composer","text":"Are you bound?","ms":12}`)
	if r.Broken || r.Kind != "prompt" || r.Said != "Are you bound?" || r.Text != "Are you bound?" {
		t.Fatalf("the row keeps door, said and text, and read %+v", r)
	}
	if r.Extra["detail"] != "composer" || r.Extra["ms"] != "12" || len(r.Extra) != 2 {
		t.Fatalf("extra holds detail and ms and nothing else, and holds %v", r.Extra)
	}
}

func TestALineThatDoesNotParseStandsAsAnUnparsedRow(t *testing.T) {
	t.Parallel()
	r := ParseRecord(`{"at": half a line`)
	if !r.Broken || r.Kind != "unparsed" || r.Level != "error" || r.Raw != `{"at": half a line` {
		t.Fatalf("a broken line stands as an unparsed error holding its raw text, and read %+v", r)
	}
}

func TestTheDetailsShowTheDoorTheTimeTheFieldsAndTheWholeText(t *testing.T) {
	t.Parallel()
	long := strings.Repeat("word ", 40)
	all := []Record{{
		At: time.Date(2026, 9, 11, 15, 8, 36, 490e6, time.UTC), Level: "info", Kind: "tool",
		Said: long[:80], Text: long, Extra: map[string]string{"tool": "Bash"},
	}}
	said := details(all, 0)
	for _, want := range []string{"tool", "15:08:36.490", "Bash"} {
		if !strings.Contains(said, want) {
			t.Fatalf("the details name %q, and read:\n%s", want, said)
		}
	}
	if strings.Count(said, "word") != 40 {
		t.Fatalf("the details hold all 40 words of the text, and hold %d", strings.Count(said, "word"))
	}
}

func TestTheDetailsLeaveOutPermalinkFileAndReceivedTime(t *testing.T) {
	t.Parallel()
	said := details([]Record{row(1, "stop", "the turn ends")}, 0)
	for _, noise := range []string{"Permalink", "Received", "File:", "info"} {
		if strings.Contains(said, noise) {
			t.Fatalf("the details carry no %q, and read:\n%s", noise, said)
		}
	}
}

func TestAPromptShowsItsReplyAndTheReplyShowsItsPrompt(t *testing.T) {
	t.Parallel()
	all := []Record{
		row(1, "prompt", "are you bound?"),
		row(2, "tool", "Read"),
		row(3, "reply", "yes, bound"),
		row(4, "prompt", "and now?"),
	}
	if said := details(all, 0); !strings.Contains(said, "yes, bound") {
		t.Fatalf("the prompt's details carry its reply, and read:\n%s", said)
	}
	if said := details(all, 2); !strings.Contains(said, "are you bound?") {
		t.Fatalf("the reply's details carry its prompt, and read:\n%s", said)
	}
	if said := details(all, 3); strings.Contains(said, "yes, bound") {
		t.Fatalf("a prompt with no reply after it borrows none, and read:\n%s", said)
	}
	if said := details(all, 1); strings.Contains(said, "yes, bound") || strings.Contains(said, "are you bound?") {
		t.Fatalf("a tool row carries no pair, and read:\n%s", said)
	}
}

func TestAPromptInsideATurnShowsTheReplyEndingItAndTheReplyShowsEveryPrompt(t *testing.T) {
	t.Parallel()
	all := []Record{
		row(1, "prompt", "first ask"),
		row(2, "tool", "Read"),
		row(3, "prompt", "and one more thing"),
		row(4, "reply", "both done"),
	}
	if said := details(all, 0); !strings.Contains(said, "both done") {
		t.Fatalf("the first prompt of the turn shows the reply ending it, and read:\n%s", said)
	}
	said := details(all, 3)
	if !strings.Contains(said, "first ask") || !strings.Contains(said, "and one more thing") {
		t.Fatalf("the reply shows both prompts of its turn, and read:\n%s", said)
	}
	if strings.Index(said, "first ask") > strings.Index(said, "and one more thing") {
		t.Fatalf("the reply shows its prompts in the order they came, and read:\n%s", said)
	}
}

func TestAPromptShowsItsAnswerAndItsReplyAndTheAnswerShowsItsPrompt(t *testing.T) {
	t.Parallel()
	all := []Record{
		row(1, "prompt", "build the door"),
		row(2, "answer", "you want the door"),
		row(3, "tool", "Read"),
		row(4, "prompt", "and the bell"),
		row(5, "answer", "and the bell too"),
		row(6, "reply", "door and bell stand"),
	}
	said := details(all, 0)
	if !strings.Contains(said, "you want the door") || !strings.Contains(said, "door and bell stand") {
		t.Fatalf("the prompt shows its answer and the reply ending its turn, and read:\n%s", said)
	}
	if strings.Contains(said, "and the bell too") {
		t.Fatalf("the prompt borrows no answer of a later prompt, and read:\n%s", said)
	}
	if said := details(all, 4); !strings.Contains(said, "and the bell") || strings.Contains(said, "build the door") {
		t.Fatalf("the answer shows its own prompt alone, and read:\n%s", said)
	}
}

func TestAToolRowNamesTheToolAndEveryOtherRowItsDoor(t *testing.T) {
	t.Parallel()
	read := Record{Kind: "tool", Extra: map[string]string{"tool": "Grep"}}
	bare := Record{Kind: "tool"}
	other := Record{Kind: "write", Extra: map[string]string{"tool": "Edit"}}
	if read.Label() != "Grep" || bare.Label() != "tool" || other.Label() != "write" {
		t.Fatalf("labels read %q %q %q", read.Label(), bare.Label(), other.Label())
	}
	if kindStyle("Grep").GetForeground() == kindStyle("Read").GetForeground() {
		t.Fatal("Grep and Read wear different colours")
	}
}

func TestEveryKnownDoorAndToolWearsItsOwnColour(t *testing.T) {
	t.Parallel()
	seen := map[string]string{"220": "prompt", "114": "reply"}
	for _, table := range []map[string]string{kindColours, toolColours} {
		for name, colour := range table {
			if other, found := seen[colour]; found {
				t.Fatalf("%s and %s both wear %s", name, other, colour)
			}
			seen[colour] = name
		}
	}
	if kindStyle("prompt").GetBackground() != (lipgloss.NoColor{}) {
		t.Fatal("a prompt wears yellow text, and no background")
	}
	if kindStyle("prompt").GetForeground() != lipgloss.Color("220") || saidStyle(row(1, "prompt", "x")).GetForeground() != lipgloss.Color("220") {
		t.Fatal("a prompt wears yellow on its door and on its text")
	}
}

// [[spec/design_output/viewer#the-filter-language]]
func TestTheFilterReadsKQL(t *testing.T) {
	t.Parallel()
	rows := []Record{
		{Level: "info", Kind: "tool", Said: "src/viewer/ui.go", Extra: map[string]string{"tool": "Read"}},
		{Level: "warn", Kind: "vale", Said: "1 line breaks a rule", Extra: map[string]string{"detail": "DoorsOnly"}},
		{Level: "info", Kind: "prompt", Said: "are you bound?", Text: "are you bound? say so"},
	}
	cases := map[string]string{
		"read":                  "0",
		"tool: read":            "0",
		"level: warn":           "1",
		"kind: prompt or vale":  "1 2",
		"not kind: tool":        "1 2",
		"-kind:tool":            "1 2",
		`said: "breaks a rule"`: "1",
		"detail: doors*":        "1",
		"text: /say\\s+so/":     "2",
		"details: say":          "2",
		"nosuchfield: x":        "",
		"(tool or vale) warn":   "1",
	}
	for said, want := range cases {
		f, err := ParseFilter(said)
		if err != nil {
			t.Fatalf("%q reads as a filter, and fails: %v", said, err)
		}
		var got []string
		for at, r := range rows {
			if f.Match(r) {
				got = append(got, fmt.Sprint(at))
			}
		}
		if strings.Join(got, " ") != want {
			t.Fatalf("%q keeps rows %q, and kept %q", said, want, strings.Join(got, " "))
		}
	}
}

func TestAHalfFilterIsStillTypingAndABadPatternSaysSo(t *testing.T) {
	t.Parallel()
	for _, said := range []string{`"open`, "/open", "(a or", "kind:", "a and"} {
		if _, err := ParseFilter(said); !errors.Is(err, ErrIncomplete) {
			t.Fatalf("%q is still typing, and read %v", said, err)
		}
	}
	if _, err := ParseFilter("/[a/"); err == nil || errors.Is(err, ErrIncomplete) {
		t.Fatalf("a pattern that fails to compile says so, and read %v", err)
	}
}

func TestAWrappedValueLinesUpUnderItself(t *testing.T) {
	t.Parallel()
	said := Wrap("tool  "+strings.Repeat("abc ", 10), 20)
	for _, line := range strings.Split(said, "\n")[1:] {
		if !strings.HasPrefix(line, "      ") {
			t.Fatalf("a continuation starts under the value at column 6, and read %q", line)
		}
	}
	for _, line := range strings.Split(said, "\n") {
		if len([]rune(line)) > 20 {
			t.Fatalf("no line runs past 20, and %q does", line)
		}
	}
}
