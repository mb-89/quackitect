// What a row reads as, and what its details show. The fixtures here are rows in
// memory, and no test reads a file.

package log

import (
	"fmt"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/charmbracelet/lipgloss"

	"quackitect/src/tui/draw"
	"quackitect/src/tui/frame"
)

func details(all []Record, at int) string {
	return frame.RenderParts(DetailOf(all, at, time.UTC), 80)
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

// The details show the door, the time, the fields and the whole text, and leave out the permalink, the file, the received time and the level. [[spec/design_output/tui]]
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
	for _, noise := range []string{"Permalink", "Received", "File:", "info"} {
		if strings.Contains(said, noise) {
			t.Fatalf("the details carry no %q, and read:\n%s", noise, said)
		}
	}
}

// A prompt's details carry its answer, its notes up to the next prompt and the reply ending its turn; a reply carries every prompt of its turn in order; an answer carries its own prompt alone; a tool row and a note carry no prompt. [[spec/design_output/tui#the-details]]
func TestTheDetailsCarryTheRowsOfTheirTurn(t *testing.T) {
	t.Parallel()
	turns := map[string][]Record{
		"reply": {row(1, "prompt", "are you bound?"), row(2, "tool", "Read"), row(3, "reply", "yes, bound"), row(4, "prompt", "and now?")},
		"two":   {row(1, "prompt", "first ask"), row(2, "tool", "Read"), row(3, "prompt", "and one more thing"), row(4, "reply", "both done")},
		"answers": {row(1, "prompt", "build the door"), row(2, "answer", "you want the door"), row(3, "tool", "Read"),
			row(4, "prompt", "and the bell"), row(5, "answer", "and the bell too"), row(6, "reply", "door and bell stand")},
		"notes": {row(1, "prompt", "are you bound?"), row(2, "note", "ahead of the answer"), row(3, "answer", "bound to the queue"),
			row(4, "note", "after the answer"), row(5, "prompt", "and now?"), row(6, "note", "under the second prompt"), row(7, "reply", "yes, bound")},
	}
	for _, one := range []struct {
		turn       string
		at         int
		has, lacks []string
	}{
		{"reply", 0, []string{"yes, bound"}, nil},
		{"reply", 2, []string{"are you bound?"}, nil},
		{"reply", 3, nil, []string{"yes, bound"}},
		{"reply", 1, nil, []string{"yes, bound", "are you bound?"}},
		{"two", 0, []string{"both done"}, nil},
		{"two", 3, []string{"first ask", "and one more thing"}, nil},
		{"answers", 0, []string{"you want the door", "door and bell stand"}, []string{"and the bell too"}},
		{"answers", 4, []string{"and the bell"}, []string{"build the door"}},
		{"notes", 0, []string{"ahead of the answer", "after the answer"}, []string{"under the second prompt"}},
		{"notes", 1, nil, []string{"are you bound?"}},
		{"notes", 3, nil, []string{"are you bound?"}},
		{"notes", 4, nil, []string{"ahead of the answer", "after the answer"}},
	} {
		said := details(turns[one.turn], one.at)
		for _, want := range one.has {
			if !strings.Contains(said, want) {
				t.Errorf("row %d of %s carries %q, and its details read:\n%s", one.at, one.turn, want, said)
			}
		}
		for _, not := range one.lacks {
			if strings.Contains(said, not) {
				t.Errorf("row %d of %s carries no %q, and its details read:\n%s", one.at, one.turn, not, said)
			}
		}
	}
	if said := details(turns["two"], 3); strings.Index(said, "first ask") > strings.Index(said, "and one more thing") {
		t.Fatalf("the reply shows its prompts in the order they came, and read:\n%s", said)
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
}

// The said column wears the colour the kind list names for its kind, and a prompt wears no background. [[spec/design_output/tui#colours]]
func TestTheSaidColumnWearsTheColourOfItsKind(t *testing.T) {
	t.Parallel()
	if draw.KindStyle("prompt").GetBackground() != (lipgloss.NoColor{}) {
		t.Fatal("a prompt wears its own text colour, and no background")
	}
	for _, kind := range []string{"prompt", "note", "answer"} {
		got, want := saidStyle(row(1, kind, "x")).GetForeground(), draw.KindStyle(kind).GetForeground()
		if got != want || want == (lipgloss.NoColor{}) {
			t.Fatalf("%s wears its kind's colour %v in the said column, and wears %v", kind, want, got)
		}
	}
}

// [[spec/design_output/tui#the-filter-language]]
func TestTheFilterReadsKQL(t *testing.T) {
	t.Parallel()
	rows := []Record{
		{Level: "info", Kind: "tool", Said: "src/tui/ui.go", Extra: map[string]string{"tool": "Read"}},
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
		f, err := draw.ParseFilter(said)
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

func row(at int, door, said string) Record {
	return Record{At: time.Date(2026, 9, 11, 15, 0, at, 0, time.UTC), Level: "info", Kind: door, Said: said}
}

// The rows wear the colours the config names, and a case run stands in for the window's start. [[spec/tickets/the-colours-stand-in-config]]
func TestMain(m *testing.M) {
	draw.LoadColoursForCases(filepath.Join("..", "..", ".."))
	m.Run()
}
