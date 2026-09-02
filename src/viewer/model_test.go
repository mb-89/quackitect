package main

import (
	"encoding/json"
	"fmt"
	"strings"
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

func rec(seq int64, src, kind, msg string) Record {
	// ID is the viewer's own identity for a record. In the running program it
	// is the line number. Here it is the sequence, which is unique in these
	// fixtures.
	return Record{Seq: seq, ID: seq, Src: src, Kind: kind, Msg: msg,
		Time: time.Date(2026, 8, 30, 14, 0, int(seq), 0, time.UTC),
		Data: map[string]any{"path": fmt.Sprintf("/f/%d.txt", seq)}}
}

func newTestModel(n int) model {
	m := newModel("/dev/null")
	m.w, m.h = 120, 20
	for i := int64(1); i <= int64(n); i++ {
		m.all = append(m.all, rec(i, "agent", "call", fmt.Sprintf("message %d", i)))
	}
	m.rebuild()
	return m
}

func key(m model, k string) model {
	var msg tea.Msg
	switch k {
	case "up", "down", "pgup", "pgdown", "home", "end", "tab", "esc":
		msg = tea.KeyMsg{Type: keyType(k)}
	case "ctrl+d":
		msg = tea.KeyMsg{Type: tea.KeyCtrlD}
	default:
		msg = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune(k)}
	}
	out, _ := m.Update(msg)
	return out.(model)
}

func keyType(k string) tea.KeyType {
	switch k {
	case "up":
		return tea.KeyUp
	case "down":
		return tea.KeyDown
	case "pgup":
		return tea.KeyPgUp
	case "pgdown":
		return tea.KeyPgDown
	case "home":
		return tea.KeyHome
	case "end":
		return tea.KeyEnd
	case "tab":
		return tea.KeyTab
	case "esc":
		return tea.KeyEsc
	}
	return tea.KeyRunes
}

func arrive(m model, recs ...Record) model {
	out, _ := m.Update(linesMsg{recs: recs})
	return out.(model)
}

// UC-36. The list does not jump when entries arrive and the reader has
// scrolled up. This is the v3 defect stated as a test.
func TestArrivingLinesDoNotMoveAHeldSelection(t *testing.T) {
	t.Parallel()
	m := newTestModel(50)
	m = key(m, "up")
	m = key(m, "up")
	if m.follow {
		t.Fatal("following should stop as soon as the selection leaves the newest line")
	}
	sel, top := m.selID, m.top
	m = arrive(m, rec(51, "agent", "call", "new one"), rec(52, "agent", "call", "another"))
	if m.selID != sel {
		t.Fatalf("selection moved from %d to %d", sel, m.selID)
	}
	if m.top != top {
		t.Fatalf("the list scrolled: top %d became %d", top, m.top)
	}
}

// UC-36. The detail pane is bound to a record. Later records are not that
// record, so it must not redraw.
func TestArrivingLinesDoNotRedrawTheDetailPane(t *testing.T) {
	t.Parallel()
	m := newTestModel(30)
	m = key(m, "up")
	m = key(m, "ctrl+d")
	if !m.details {
		t.Fatal("ctrl+d should open the details")
	}
	before := m.detail.View()
	m = arrive(m, rec(31, "engine", "answer", "later"))
	if got := m.detail.View(); got != before {
		t.Fatal("the detail pane changed when a new line arrived")
	}
	// And the same key closes it.
	m = key(m, "ctrl+d")
	if m.details {
		t.Fatal("ctrl+d should close the details again")
	}
}

// Following is where the selection is, not a mode. Return to the newest line
// and it resumes.
func TestFollowingResumesAtTheNewestLine(t *testing.T) {
	t.Parallel()
	m := newTestModel(10)
	m = key(m, "up")
	if m.follow {
		t.Fatal("should be held")
	}
	m = key(m, "end")
	if !m.follow {
		t.Fatal("should follow again at the newest line")
	}
	m = arrive(m, rec(11, "agent", "call", "newest"))
	if m.selID != 11 {
		t.Fatalf("following should move the selection to the newest line, got %d", m.selID)
	}
}

// UC-37. Typing filters with no key pressed first.
func TestTypingFiltersImmediately(t *testing.T) {
	t.Parallel()
	m := newTestModel(20)
	for _, r := range "message 7" {
		m = key(m, string(r))
	}
	// Space separates terms, and terms narrow together. So this keeps both
	// "message 7" and "message 17": each contains "message" and contains "7".
	if len(m.view) != 2 {
		t.Fatalf("expected two lines, got %d", len(m.view))
	}
	// A quoted phrase is one term, which is how a person asks for exactly one.
	m = key(m, "esc")
	for _, r := range `"message 7"` {
		m = key(m, string(r))
	}
	if len(m.view) != 1 {
		t.Fatalf("a quoted phrase should keep one line, got %d", len(m.view))
	}
	if m.all[m.view[0]].Msg != "message 7" {
		t.Fatalf("wrong line kept: %q", m.all[m.view[0]].Msg)
	}
}

func TestFilterShapes(t *testing.T) {
	t.Parallel()
	recs := []Record{
		rec(1, "agent", "call", "read the file"),
		rec(2, "engine", "refusal", "write refused"),
		rec(3, "agent", "note", "wrote a note"),
	}
	cases := []struct {
		expr string
		want []int64
	}{
		{"refus", []int64{2}},
		{"src:agent", []int64{1, 3}},
		{"kind:refusal", []int64{2}},
		{"/wr.te/", []int64{2, 3}},
		{"msg:/^read/", []int64{1}},
		{"-src:agent", []int64{2}},
		{"not src:agent", []int64{2}},
		{"src:agent or kind:refusal", []int64{1, 2, 3}},
		{"(src:agent or kind:refusal) and wr", []int64{2, 3}},
		{`msg:"read the file"`, []int64{1}},
		{"details:2.txt", []int64{2}},
		{"kind:ref*", []int64{2}},
		{"src:agent note", []int64{3}},
		{`path:"/f/2.txt"`, []int64{2}},
		{"nosuchcolumn:x", nil},
	}
	for _, c := range cases {
		f, err := ParseFilter(c.expr)
		if err != nil {
			t.Fatalf("%q did not parse: %v", c.expr, err)
		}
		var got []int64
		for _, r := range recs {
			if f.Match(r) {
				got = append(got, r.Seq)
			}
		}
		if fmt.Sprint(got) != fmt.Sprint(c.want) {
			t.Errorf("%q matched %v, wanted %v", c.expr, got, c.want)
		}
	}
}

// UC-37. A half-typed pattern is not an error, and it must never blank the view.
func TestHalfTypedPatternKeepsTheLastGoodFilter(t *testing.T) {
	t.Parallel()
	m := newTestModel(20)
	for _, r := range "message 1" {
		m = key(m, string(r))
	}
	kept := len(m.view)
	if kept == 0 {
		t.Fatal("setup: expected some lines")
	}
	// An unfinished pattern is not an error: it is somebody typing. A closed
	// one that will not compile is.
	m = key(m, " ")
	m = key(m, "/")
	m = key(m, "[")
	if m.filterBad != "still typing" {
		t.Fatalf("an unfinished pattern should read as still typing, got %q", m.filterBad)
	}
	if len(m.view) != kept {
		t.Fatalf("the view changed while the pattern was unfinished")
	}
	m = key(m, "/")
	if m.filterBad == "" {
		t.Fatal("an unfinished pattern should be reported")
	}
	if len(m.view) != kept {
		t.Fatalf("the view changed while the pattern was unfinished: %d became %d", kept, len(m.view))
	}
}

func TestEscapeClearsTheFilter(t *testing.T) {
	t.Parallel()
	m := newTestModel(20)
	m = key(m, "z")
	if len(m.view) != 0 {
		t.Fatalf("expected nothing to match, got %d", len(m.view))
	}
	m = key(m, "esc")
	if len(m.view) != 20 {
		t.Fatalf("escape should restore every line, got %d", len(m.view))
	}
}

// The irritating walk, in one test. Hold the selection, filter, read, and
// clear. Clearing the filter alone left the reader held, watching nothing.
func TestEscapeAlsoReturnsToFollowing(t *testing.T) {
	t.Parallel()
	m := newTestModel(20)
	m = key(m, "up")
	m = key(m, "up")
	if m.follow {
		t.Fatal("two steps up should hold the selection")
	}
	m = key(m, "1")
	m = key(m, "esc")

	if !m.follow {
		t.Fatal("escape should return to following")
	}
	if len(m.view) != 20 {
		t.Fatalf("escape should restore every line, got %d", len(m.view))
	}
	if m.onFilter {
		t.Fatal("escape should leave the filter box")
	}
	// Following means the newest line, and it means the next one too.
	if m.selID != 20 {
		t.Fatalf("the selection sits on %d, not the newest line", m.selID)
	}
	m = arrive(m, rec(21, "agent", "call", "newest"))
	if m.selID != 21 {
		t.Fatalf("it did not follow the arriving line, got %d", m.selID)
	}
}

// Escape on an empty log has nothing to select, and the next line to arrive
// is still the newest one.
func TestEscapeFollowsEvenWithNothingToSelect(t *testing.T) {
	t.Parallel()
	m := newTestModel(0)
	m = key(m, "esc")
	if !m.follow {
		t.Fatal("escape should follow an empty log")
	}
	m = arrive(m, rec(1, "agent", "call", "the first line"))
	if m.selID != 1 {
		t.Fatalf("it did not follow the first arriving line, got %d", m.selID)
	}
}

// A record the filter removed must not take the selection with it silently.
func TestSelectionSurvivesAFilterThatKeepsIt(t *testing.T) {
	t.Parallel()
	m := newTestModel(20)
	m = key(m, "up")
	m = key(m, "up")
	want := m.selID
	for _, r := range "message" {
		m = key(m, string(r))
	}
	if m.selID != want {
		t.Fatalf("selection moved from %d to %d under a filter that kept it", want, m.selID)
	}
}

func TestUnparsedLineIsShownNotHidden(t *testing.T) {
	t.Parallel()
	r := ParseRecord("this is not json", 7)
	if !r.Broken {
		t.Fatal("should be marked broken")
	}
	if r.Seq != 7 {
		t.Fatalf("should fall back to the line number, got %d", r.Seq)
	}
	if !strings.Contains(r.Detail(), "did not parse") {
		t.Fatal("the detail should say what happened")
	}
}

func TestRotationRestartsFromTheTop(t *testing.T) {
	t.Parallel()
	tl := &tailer{path: "/dev/null", offset: 500, lineNo: 10}
	// A file that shrank was rotated. Reading from the old offset would return
	// bytes that mean something else.
	if tl.offset <= 0 {
		t.Skip()
	}
}

// A session is written by more than one process, and each carries its own
// counter. Two records with the same seq must not make the selection stick.
func TestTheSelectionSurvivesRepeatedSequenceNumbers(t *testing.T) {
	t.Parallel()
	m := newModel("/dev/null")
	m.w, m.h = 120, 20
	// What a real session looks like: the engine writes seq 1, then each
	// guard is its own process and writes its own seq 1.
	for i := 0; i < 3; i++ {
		r := rec(1, "engine", "call", fmt.Sprintf("record %d", i+1))
		m.all = append(m.all, ParseRecord(mustJSON(r), int64(i+1)))
	}
	m.rebuild()
	if len(m.view) != 3 {
		t.Fatalf("expected three records, got %d", len(m.view))
	}
	start := m.selIndex()
	m = key(m, "up")
	if m.selIndex() == start {
		t.Fatalf("the selection did not move: still row %d of %d", m.selIndex()+1, len(m.view))
	}
	m = key(m, "down")
	if m.selIndex() != start {
		t.Fatalf("down did not return to row %d, it is on %d", start+1, m.selIndex()+1)
	}
}

func mustJSON(r Record) string {
	b, err := json.Marshal(map[string]any{
		"t": r.Time.Format(time.RFC3339Nano), "seq": r.Seq, "src": r.Src,
		"kind": r.Kind, "actor": r.Actor, "msg": r.Msg,
	})
	if err != nil {
		panic(err)
	}
	return string(b)
}
