// The failure verb raises a node's lines and writes its row, writes a node
// and refuses one with no remedy, and counts the failures the log holds.
// [[spec/design_output/failures#an-agent-raises-by-verb]]
package main

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

var failureNow = time.Date(2026, 10, 6, 12, 0, 0, 0, time.UTC)

const heldFailure = "---\nkind: [[failure]]\nlevel: warn\nremedies:\n  - Pull again.\n---\n\n# When\n\nA hand pulls while a leaf stands in it.\n"

// A root holding the files named under it, and the failure verb over it at the case's now. [[spec/design_output/failures#an-agent-raises-by-verb]]
func failureOver(t *testing.T, files map[string]string) (string, twin) {
	t.Helper()
	root := t.TempDir()
	for at, text := range files {
		path := filepath.Join(root, filepath.FromSlash(at))
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return root, failureVerb(func() (failureDoors, error) { return failureDoors{root: root, now: func() time.Time { return failureNow }}, nil })
}

func TestFailureRaisePrintsTheNodesLinesAndWritesItsRow(t *testing.T) {
	t.Parallel()
	root, verb := failureOver(t, map[string]string{"spec/failures/leaf-held.md": heldFailure})
	var out, errs bytes.Buffer
	if code := verb([]string{"failure", "raise", "leaf-held", "a leaf stands in your hand"}, false, &out, &errs); code != 0 {
		t.Fatalf("raise answers %d: %s", code, errs.String())
	}
	if want := "a leaf stands in your hand\nfailure leaf-held at warn\nremedy: Pull again.\n"; out.String() != want {
		t.Errorf("raise prints %q, want %q", out.String(), want)
	}
	want := `{"at":"2026-10-06T12:00:00.000Z","level":"warn","kind":"failure","said":"a leaf stands in your hand","failure":"leaf-held"}` + "\n"
	if got, _ := readIn(root, sessionLog); got != want {
		t.Errorf("raise writes %q, want %q", got, want)
	}
}

func TestFailureNewWritesTheNode(t *testing.T) {
	t.Parallel()
	root, verb := failureOver(t, map[string]string{})
	var out, errs bytes.Buffer
	argv := []string{"failure", "new", "leaf-held", "--level=warn", "--remedy=Pull again.", "--when=A hand pulls while a leaf stands in it."}
	if code := verb(argv, false, &out, &errs); code != 0 {
		t.Fatalf("new answers %d: %s", code, errs.String())
	}
	if got, _ := readIn(root, "spec/failures/leaf-held.md"); got != heldFailure {
		t.Errorf("new writes %q, want %q", got, heldFailure)
	}
}

func TestFailureNewRefusesANodeWithNoRemedy(t *testing.T) {
	t.Parallel()
	root, verb := failureOver(t, map[string]string{})
	var out, errs bytes.Buffer
	if code := verb([]string{"failure", "new", "bare", "--level=error", "--when=It fails."}, false, &out, &errs); code != exitUsage {
		t.Errorf("new answers %d, want %d", code, exitUsage)
	}
	if !strings.Contains(errs.String(), "bare names no remedy") {
		t.Errorf("new says %q, and names no missing remedy", errs.String())
	}
	if _, err := os.Stat(filepath.Join(root, "spec", "failures", "bare.md")); err == nil {
		t.Error("new writes a node with no remedy")
	}
}

func TestFailureCountAnswersEachIdWithItsCount(t *testing.T) {
	t.Parallel()
	row := func(kind, id string) string {
		return `{"at":"2026-10-06T11:00:00.000Z","level":"error","kind":"` + kind + `","said":"x","failure":"` + id + `"}` + "\n"
	}
	log := row("failure", "b") + row("failure", "a") + row("write", "a") + row("failure", "a") + row("failure", "c")
	_, verb := failureOver(t, map[string]string{sessionLog: log})
	var out, errs bytes.Buffer
	if code := verb([]string{"failure", "count"}, false, &out, &errs); code != 0 {
		t.Fatalf("count answers %d: %s", code, errs.String())
	}
	if want := "2 a\n1 b\n1 c\n"; out.String() != want {
		t.Errorf("count prints %q, want %q", out.String(), want)
	}
}
