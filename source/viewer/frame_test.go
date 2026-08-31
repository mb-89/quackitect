package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A record on disk, because the frame reads a file rather than a model. That
// is the point of it: it is what a person would see if they opened the window
// on that file.
func writeLog(t *testing.T, lines ...string) string {
	t.Helper()
	dir := t.TempDir()
	path := filepath.Join(dir, "session.jsonl")
	if err := os.WriteFile(path, []byte(strings.Join(lines, "\n")+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	return path
}

func line(kind, msg string) string {
	return `{"t":"2026-08-31T10:00:00Z","seq":1,"session":"s","src":"agent","kind":"` +
		kind + `","actor":"main","msg":"` + msg + `","ok":true}`
}

// THE FRAME IS THE WINDOW. A reader with no terminal has to see the same
// columns, the same order and the same status line, or there are two answers
// to how the record looks.
func TestFrameDrawsTheWindow(t *testing.T) {
	path := writeLog(t, line("call", "the first"), line("refusal", "the second"))
	out, err := Frame(path, 100, 12, "")
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"time", "kind", "actor", "the first", "the second", "filter", "2 of 2"} {
		if !strings.Contains(out, want) {
			t.Fatalf("the frame does not show %q:\n%s", want, out)
		}
	}
}

// The filter is the same language the window takes, and it narrows the frame
// the same way.
func TestFrameTakesAFilter(t *testing.T) {
	path := writeLog(t, line("call", "the first"), line("refusal", "the second"))
	out, err := Frame(path, 100, 12, "kind:refusal")
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(out, "the first") {
		t.Fatalf("the filter let a call through:\n%s", out)
	}
	if !strings.Contains(out, "the second") {
		t.Fatalf("the filter kept nothing:\n%s", out)
	}
}

// A filter that will not compile is said, and nothing is drawn. A frame that
// silently showed everything would be read as everything matching.
func TestFrameSaysWhatIsWrongWithAFilter(t *testing.T) {
	path := writeLog(t, line("call", "the first"))
	if _, err := Frame(path, 100, 12, "kind:("); err == nil {
		t.Fatal("a filter that cannot compile was accepted")
	}
}

// A file that is not there yet is not an error. The window says so on a
// screen, and the frame says so here.
func TestFrameOnAFileThatIsNotThere(t *testing.T) {
	out, err := Frame(filepath.Join(t.TempDir(), "nothing.jsonl"), 100, 12, "")
	if err != nil {
		t.Fatalf("a missing file was an error: %v", err)
	}
	if !strings.Contains(out, "nothing.jsonl") {
		t.Fatalf("the frame does not name the file it is waiting for:\n%s", out)
	}
}

// A screen is padded to its height. A pipe is not, and the padding would read
// as the record having ended long before it did.
func TestFrameDoesNotEndInBlankLines(t *testing.T) {
	path := writeLog(t, line("call", "the only one"))
	out, err := Frame(path, 100, 40, "")
	if err != nil {
		t.Fatal(err)
	}
	if strings.HasSuffix(out, "\n") || strings.HasSuffix(out, " ") {
		t.Fatalf("the frame ends in blank space:\n%q", out[max(0, len(out)-60):])
	}
}

func TestParseSize(t *testing.T) {
	for _, c := range []struct {
		in   string
		w, h int
		bad  bool
	}{
		{in: "120x40", w: 120, h: 40},
		{in: " 80 X 25 ", w: 80, h: 25},
		{in: "120", bad: true},
		{in: "10x40", bad: true},
		{in: "120x2", bad: true},
		{in: "wide x tall", bad: true},
	} {
		w, h, err := ParseSize(c.in)
		if c.bad {
			if err == nil {
				t.Fatalf("%q was accepted as %dx%d", c.in, w, h)
			}
			continue
		}
		if err != nil || w != c.w || h != c.h {
			t.Fatalf("%q read as %dx%d, %v", c.in, w, h, err)
		}
	}
}
