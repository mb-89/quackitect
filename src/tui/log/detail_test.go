// What a row reads as, and what its details show. The fixtures here are rows in
// memory, and no test reads a file.

package log

import (
	"os"
	"path/filepath"
	"quackitect/tui/draw"
	"quackitect/tui/frame"

	"errors"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/charmbracelet/lipgloss"
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
	if draw.KindStyle("Grep").GetForeground() == draw.KindStyle("Read").GetForeground() {
		t.Fatal("Grep and Read wear different colours")
	}
}

func TestAPromptWearsOneColourOnItsDoorAndOnItsText(t *testing.T) {
	t.Parallel()
	if draw.KindStyle("prompt").GetBackground() != (lipgloss.NoColor{}) {
		t.Fatal("a prompt wears its own text colour, and no background")
	}
	if draw.KindStyle("prompt").GetForeground() != saidStyle(row(1, "prompt", "x")).GetForeground() {
		t.Fatal("a prompt wears one colour on its door and on its text")
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
		"Text: /say\\s+so/":     "2",
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

func TestAHalfFilterIsStillTypingAndABadPatternSaysSo(t *testing.T) {
	t.Parallel()
	for _, said := range []string{`"open`, "/open", "(a or", "kind:", "a and"} {
		if _, err := draw.ParseFilter(said); !errors.Is(err, draw.ErrIncomplete) {
			t.Fatalf("%q is still typing, and read %v", said, err)
		}
	}
	if _, err := draw.ParseFilter("/[a/"); err == nil || errors.Is(err, draw.ErrIncomplete) {
		t.Fatalf("a pattern that fails to compile says so, and read %v", err)
	}
}

func TestAWrappedValueLinesUpUnderItself(t *testing.T) {
	t.Parallel()
	said := draw.Wrap("tool  "+strings.Repeat("abc ", 10), 20)
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

// [[spec/design_output/tui#the-details]]
// A note takes a colour of its own, and the said column wears it too. [[spec/design_output/tui#colours]]
func TestANoteTakesAColourOfItsOwnInBothColumns(t *testing.T) {
	t.Parallel()
	mark := draw.KindStyle("note").GetForeground()
	if mark == (lipgloss.NoColor{}) {
		t.Fatal("a note row takes a colour of its own, and the kind list names none")
	}
	for _, other := range []string{"prompt", "reply", "answer", "tool"} {
		if draw.KindStyle(other).GetForeground() == mark {
			t.Fatalf("a note reads apart from %s, and the two share a colour", other)
		}
	}
	if got := saidStyle(row(1, "note", "the lint drags")).GetForeground(); got != mark {
		t.Fatalf("the said column wears the note's colour %v, and wears %v", mark, got)
	}
}

// The colour stands in the kind list alone, so the said column reads it there. [[spec/design_output/tui#colours]]
func TestTheSaidColumnReadsTheKindListAndNamesNoColourOfItsOwn(t *testing.T) {
	t.Parallel()
	for _, kind := range []string{"note", "answer"} {
		if got := saidStyle(row(1, kind, "x")).GetForeground(); got != draw.KindStyle(kind).GetForeground() {
			t.Fatalf("%s reads one colour, and the two columns read %v and %v", kind, got, draw.KindStyle(kind).GetForeground())
		}
	}
}

// A person opening the prompt reads what the session parked under it. [[spec/design_output/tui#the-details]]
func TestAPromptShowsTheNoteItCarriesAndTheNoteShowsItsPrompt(t *testing.T) {
	t.Parallel()
	all := []Record{
		row(1, "prompt", "are you bound?"),
		row(2, "note", "the lint drags"),
		row(3, "reply", "yes, bound"),
		row(4, "prompt", "and now?"),
	}
	if said := details(all, 0); !strings.Contains(said, "the lint drags") {
		t.Fatalf("the prompt's details carry the note it holds, and read:\n%s", said)
	}
	if said := details(all, 1); !strings.Contains(said, "are you bound?") {
		t.Fatalf("the note's details carry the prompt above it, and read:\n%s", said)
	}
	if said := details(all, 3); strings.Contains(said, "the lint drags") {
		t.Fatalf("a prompt after the note borrows none, and read:\n%s", said)
	}
}

// A note after the answer stands with the prompt too, up to the prompt after it. [[spec/design_output/tui#the-details]]
func TestAPromptShowsTheNotesOnBothSidesOfItsAnswer(t *testing.T) {
	t.Parallel()
	all := []Record{
		row(1, "prompt", "are you bound?"),
		row(2, "note", "ahead of the answer"),
		row(3, "answer", "bound to the queue"),
		row(4, "note", "after the answer"),
		row(5, "prompt", "and now?"),
		row(6, "note", "under the second prompt"),
		row(7, "reply", "yes, bound"),
	}
	said := details(all, 0)
	for _, want := range []string{"ahead of the answer", "after the answer"} {
		if !strings.Contains(said, want) {
			t.Fatalf("the prompt carries %q, and its details read:\n%s", want, said)
		}
	}
	if strings.Contains(said, "under the second prompt") {
		t.Fatalf("a note under the prompt after it stays there, and the details read:\n%s", said)
	}
	if got := details(all, 3); !strings.Contains(got, "are you bound?") {
		t.Fatalf("the note after the answer shows the prompt above it, and reads:\n%s", got)
	}
}

func TestAWrapLinesUpUnderAValueACharacterWiderThanAByte(t *testing.T) {
	t.Parallel()
	said := "  1…9        open the tab at that place and the next one too"
	lines := strings.Split(draw.Wrap(said, 40), "\n")
	if len(lines) < 2 {
		t.Fatalf("a long line wraps, and reads %v", lines)
	}
	under := len([]rune(lines[0][:strings.Index(lines[0], "open")]))
	if got := len([]rune(lines[1])) - len([]rune(strings.TrimLeft(lines[1], " "))); got != under {
		t.Fatalf("the rest lines up under the value at %d, and stands at %d", under, got)
	}
}

func row(at int, door, said string) Record {
	return Record{
		At:    time.Date(2026, 9, 11, 15, 0, at, 0, time.UTC),
		Level: "info",
		Kind:  door,
		Said:  said,
	}
}

// The rows wear the colours the config names, and a case run stands in for the window's start. [[spec/tickets/the-colours-stand-in-config]]
func TestMain(m *testing.M) {
	draw.LoadColours(filepath.Join("..", "..", ".."))
	os.Exit(m.Run())
}
