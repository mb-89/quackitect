// The command line over the writer: an op reads stdin, a path list rewrites
// in place, and a note with no front comes back as it stands.
// [[spec/tickets/go-writes-the-frontmatter]]
package main

import (
	"bytes"
	"strings"
	"testing"
)

type memory map[string]string

func (one memory) read(path string) ([]byte, error) { return []byte(one[path]), nil }
func (one memory) write(path string, said []byte) error {
	one[path] = string(said)
	return nil
}

func ran(argv []string, stdin string, paths memory) (int, string, string) {
	var out, errs bytes.Buffer
	code := run(argv, strings.NewReader(stdin), &out, &errs, paths)
	return code, out.String(), errs.String()
}

func TestAnOpReadsStdinAndAnswersTheNoteWritten(t *testing.T) {
	code, out, _ := ran([]string{"set", "state", "closed"}, "---\nstate: open\n---\nbody\n", nil)
	if code != 0 || out != "---\nstate: closed\n---\nbody\n" {
		t.Fatalf("set answers %d and %q", code, out)
	}
	code, out, _ = ran([]string{"entry", `{"step":"a","hand":"b"}`}, "---\nstate: open\n---\n", nil)
	if code != 0 || out != "---\nstate: open\nrecord:\n  - step: a\n    hand: b\n---\n" {
		t.Fatalf("entry answers %d and %q", code, out)
	}
}

func TestANoteWithNoFrontComesBackAsItStands(t *testing.T) {
	code, out, _ := ran([]string{"drop", "state"}, "just a body\n", nil)
	if code != 0 || out != "just a body\n" {
		t.Fatalf("drop over no front answers %d and %q", code, out)
	}
}

func TestMintReadsItsJson(t *testing.T) {
	code, out, _ := ran([]string{"mint", `{"kind":"[[ticket]]"}`}, "", nil)
	if code != 0 || out != "---\nkind: [[ticket]]\n---\n" {
		t.Fatalf("mint answers %d and %q", code, out)
	}
	if code, _, errs := ran([]string{"mint", `[1]`}, "", nil); code != failed || errs == "" {
		t.Fatalf("mint over no object answers %d and %q", code, errs)
	}
}

func TestNormaliseOverPathsRewritesEachInPlace(t *testing.T) {
	paths := memory{"a.md": "---\nstate: 'open'\n---\nbody\n", "b.md": "no front\n"}
	if code, _, _ := ran([]string{"normalise", "a.md", "b.md"}, "", paths); code != 0 {
		t.Fatalf("normalise answers %d", code)
	}
	if paths["a.md"] != "---\nstate: open\n---\nbody\n" || paths["b.md"] != "no front\n" {
		t.Fatalf("normalise leaves %#v", paths)
	}
}

func TestAnOpNobodyNamedAnswersTheUsage(t *testing.T) {
	if code, _, errs := ran([]string{"set", "state"}, "", nil); code != misuse || !strings.Contains(errs, "usage") {
		t.Fatalf("a short set answers %d and %q", code, errs)
	}
}
