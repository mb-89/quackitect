// The log view in shadow: what the compare names, what a shadow row is, and
// what the mode allows.
// [[spec/design_output/model#the-log-is-a-view]]

package log

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/tui/frame"
)

// A source answering the rows a case hands it. [[spec/design_output/model#the-log-is-a-view]]
type fakeSource struct {
	rows []Row
	err  error
}

func (f fakeSource) Read(string) (json.RawMessage, error) {
	if f.err != nil {
		return nil, f.err
	}
	return json.Marshal(f.rows)
}

var stamp = time.Date(2026, 9, 29, 12, 0, 0, 0, time.UTC)

func shadowOf(mode string, rows []Row) *Shadow {
	return &Shadow{From: fakeSource{rows: rows}, Mode: func() string { return mode }, Now: func() time.Time { return stamp }}
}

func recordsOf(lines ...string) []Record {
	out := make([]Record, 0, len(lines))
	for _, line := range lines {
		out = append(out, ParseRecord(line))
	}
	return out
}

const (
	lineA = `{"at":"2026-09-29T10:00:00.000Z","level":"info","kind":"prompt","said":"hello"}`
	lineB = `{"at":"2026-09-29T10:00:01.000Z","level":"error","kind":"tool","said":"broke"}`
)

var rowA = Row{At: "2026-09-29T10:00:00.000Z", Level: "info", Kind: "prompt", Said: "hello"}
var rowB = Row{At: "2026-09-29T10:00:01.000Z", Level: "error", Kind: "tool", Said: "broke"}

// [[spec/design_output/model#the-log-is-a-view]]
func TestTheShadowNamesEachRowTheTailAndTheIndexReadApart(t *testing.T) {
	t.Parallel()
	differs := rowB
	differs.Said = "broke elsewhere"
	apart := Apart(recordsOf(lineA, lineB), []Row{rowA, differs})
	if len(apart) != 1 || apart[0].Old != rowB || apart[0].New != differs {
		t.Fatalf("the compare names %+v, and wants the second row alone", apart)
	}
	if same := Apart(recordsOf(lineA, lineB), []Row{rowA, rowB}); len(same) != 0 {
		t.Fatalf("rows read alike name %+v", same)
	}
}

// A tail one side holds alone is the log growing between the two reads. [[spec/design_output/model#the-log-is-a-view]]
func TestAGrowingTailIsNoMismatch(t *testing.T) {
	t.Parallel()
	if apart := Apart(recordsOf(lineA), []Row{rowA, rowB}); len(apart) != 0 {
		t.Fatalf("the index holds a row the tail lacks, and the compare names %+v", apart)
	}
	if apart := Apart(recordsOf(lineA, lineB), []Row{rowA}); len(apart) != 0 {
		t.Fatalf("the tail holds a row the index lacks, and the compare names %+v", apart)
	}
}

// No shadow row breeds another. [[spec/design_output/model#the-log-is-a-view]]
func TestAShadowRowNeverCountsInTheCompare(t *testing.T) {
	t.Parallel()
	said := `{"at":"2026-09-29T10:00:02.000Z","level":"info","kind":"shadow","said":"window in shadow"}`
	if apart := Apart(recordsOf(lineA, saidShadow(said)), []Row{rowA}); len(apart) != 0 {
		t.Fatalf("a shadow row counts in the compare: %+v", apart)
	}
}

func saidShadow(line string) string { return line }

// A broken line stands as a row at error on both paths. [[spec/design_output/model#the-log-is-a-view]]
func TestABrokenLineReadsAlikeOnBothPaths(t *testing.T) {
	t.Parallel()
	broken := Row{Level: "error", Kind: "unparsed", Said: "not json", Broken: true}
	if apart := Apart(recordsOf("not json"), []Row{broken}); len(apart) != 0 {
		t.Fatalf("a broken line names %+v", apart)
	}
}

// [[spec/design_output/model#the-log-is-a-view]]
func TestTheLogTabWritesAShadowRowOnAMismatchInShadow(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "session.jsonl")
	if err := os.WriteFile(path, []byte(lineA+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	differs := rowA
	differs.Said = "hello elsewhere"
	if err := shadowOf("shadow", []Row{differs}).Check(path, recordsOf(lineA)); err != nil {
		t.Fatal(err)
	}
	body, _ := os.ReadFile(path)
	lines := strings.Split(strings.TrimSpace(string(body)), "\n")
	if len(lines) != 2 {
		t.Fatalf("the log holds %d lines, and wants the row and one shadow row", len(lines))
	}
	row := ParseRecord(lines[1])
	if row.Kind != "shadow" || row.Extra["slice"] != "window" || !strings.Contains(row.Said, "hello elsewhere") {
		t.Fatalf("the shadow row reads %+v", row)
	}
}

// [[spec/design_output/model#the-log-is-a-view]]
func TestTheLogTabWritesNoRowUnderOld(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "session.jsonl")
	if err := os.WriteFile(path, []byte(lineA+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	differs := rowA
	differs.Said = "hello elsewhere"
	if err := shadowOf("old", []Row{differs}).Check(path, recordsOf(lineA)); err != nil {
		t.Fatal(err)
	}
	if body, _ := os.ReadFile(path); strings.Count(string(body), "\n") != 1 {
		t.Fatalf("the log grew under old: %s", body)
	}
}

// A source that fails answers its reason, and writes no row. [[spec/design_output/model#the-log-is-a-view]]
func TestASourceThatFailsAnswersItsReason(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "session.jsonl")
	if err := os.WriteFile(path, []byte(lineA+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	gone := errors.New("the index stands down")
	sh := &Shadow{From: fakeSource{err: gone}, Mode: func() string { return "shadow" }, Now: func() time.Time { return stamp }}
	if err := sh.Check(path, recordsOf(lineA)); !errors.Is(err, gone) {
		t.Fatalf("the check answers %v, and wants the source's reason", err)
	}
}

// The log's source and the frame's are one type, so the window hands one catalog to every shadow. [[spec/tickets/the-work-view-gains-actions]]
func TestTheLogSourceIsTheFrameSource(t *testing.T) {
	t.Parallel()
	var shared frame.Source = fakeSource{}
	var mine Source = shared
	if mine == nil {
		t.Fatal("the log source drops the frame's")
	}
}

// A pair told once stands once in the log, however many times the compare runs. [[spec/design_output/model#the-log-is-a-view]]
func TestAPairToldOnceStandsOnceInTheLog(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "session.jsonl")
	if err := os.WriteFile(path, []byte(lineA+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	differs := rowA
	differs.Said = "hello elsewhere"
	sh := shadowOf("shadow", []Row{differs})
	for range 3 {
		if err := sh.Check(path, recordsOf(lineA)); err != nil {
			t.Fatal(err)
		}
	}
	body, _ := os.ReadFile(path)
	if lines := strings.Count(string(body), "\n"); lines != 2 {
		t.Fatalf("the log holds %d lines after three compares, and wants 2", lines)
	}
}

// The row a mismatch writes wakes no compare of its own. [[spec/design_output/model#the-log-is-a-view]]
func TestTheTabRunsNoCompareForShadowRowsAlone(t *testing.T) {
	t.Parallel()
	tab := New(filepath.Join(t.TempDir(), "session.jsonl"), time.UTC)
	tab.Shadow = shadowOf("shadow", nil)
	if tab.check(recordsOf(`{"kind":"shadow","said":"a mismatch"}`)) != nil {
		t.Fatal("a shadow row alone starts a compare")
	}
	if tab.check(recordsOf(lineA)) == nil {
		t.Fatal("a counted row starts no compare")
	}
}
