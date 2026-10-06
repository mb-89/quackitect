// The failure verb raises a node's lines and writes its row, writes a node
// and refuses one off its shape, and counts the failures the log holds.
// [[spec/design_output/failures#an-agent-raises-by-verb]]
package main

import (
	"bytes"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"

	"quackitect/src/failure"
)

var failureNow = time.Date(2026, 10, 6, 12, 0, 0, 0, time.UTC)

const (
	heldFailure   = "---\nkind: [[failure]]\nlevel: warn\nremedies:\n  - Pull again.\n---\n\n# When\n\nA hand pulls while a leaf stands in it.\n"
	failureSchema = "spec/schemas/failure.schema.yaml"
)

// A root holding the failure schema and the files named under it, and the failure verb over it at the case's now. [[spec/design_output/failures#an-agent-raises-by-verb]]
func failureOver(t *testing.T, files map[string]string) (string, twin) {
	t.Helper()
	schema, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(failureSchema)))
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	seeded := map[string]string{failureSchema: string(schema)}
	for at, text := range files {
		seeded[at] = text
	}
	for at, text := range seeded {
		path := filepath.Join(root, filepath.FromSlash(at))
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return root, failureVerb(func() (failureDoors, error) {
		return failureDoors{root: root, now: func() time.Time { return failureNow }}, nil
	})
}

func TestFailureRaisePrintsTheNodesLinesAndWritesItsRow(t *testing.T) {
	t.Parallel()
	root, verb := failureOver(t, map[string]string{"spec/failures/leaf-held.md": heldFailure})
	var out, errs bytes.Buffer
	if code := verb([]string{"failure", "raise", "leaf-held", "a leaf stands", "in your hand"}, false, &out, &errs); code != 0 {
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

func TestFailureRaiseOfAnUnregisteredIdLogsItAtErrorAndFails(t *testing.T) {
	t.Parallel()
	root, verb := failureOver(t, map[string]string{})
	var out, errs bytes.Buffer
	if code := verb([]string{"failure", "raise", "nobody", "it fails"}, false, &out, &errs); code != exitFailed {
		t.Errorf("raise answers %d, want %d", code, exitFailed)
	}
	if want := "it fails\nfailure nobody stands unregistered, so spec/failures names no remedy\n"; out.String() != want {
		t.Errorf("raise prints %q, want %q", out.String(), want)
	}
	want := `{"at":"2026-10-06T12:00:00.000Z","level":"error","kind":"failure","said":"it fails","failure":"nobody"}` + "\n"
	if got, _ := readIn(root, sessionLog); got != want {
		t.Errorf("raise writes %q, want %q", got, want)
	}
}

func TestFailureNewWritesTheNode(t *testing.T) {
	t.Parallel()
	root, verb := failureOver(t, map[string]string{})
	var out, errs bytes.Buffer
	argv := []string{"failure", "new", "leaf-held", "--level=warn", "--remedy=Pull again.", "--remedy=Run this: ./RUNME.sh branch release", "--when=A hand pulls while a leaf stands in it."}
	if code := verb(argv, false, &out, &errs); code != 0 {
		t.Fatalf("new answers %d: %s", code, errs.String())
	}
	text, _ := readIn(root, "spec/failures/leaf-held.md")
	node, faults := failure.NodeOf("leaf-held", text)
	want := failure.Node{ID: "leaf-held", Level: "warn", Remedies: []string{"Pull again.", "Run this: ./RUNME.sh branch release"}}
	if len(faults) > 0 || !reflect.DeepEqual(node, want) {
		t.Errorf("new writes %q, which reads %#v with %q, want %#v", text, node, faults, want)
	}
	if !strings.Contains(text, "# When\n\nA hand pulls while a leaf stands in it.") {
		t.Errorf("new writes %q with no When", text)
	}
}

func TestFailureNewStagesTheNodeItWrites(t *testing.T) {
	t.Parallel()
	root, _ := failureOver(t, map[string]string{})
	var staged []string
	verb := failureVerb(func() (failureDoors, error) {
		return failureDoors{root: root, now: func() time.Time { return failureNow }, stage: func(path string) bool {
			staged = append(staged, path)
			return true
		}}, nil
	})
	var out, errs bytes.Buffer
	if code := verb([]string{"failure", "new", "leaf-held", "--level=warn", "--remedy=Pull again.", "--when=A hand pulls while a leaf stands in it."}, false, &out, &errs); code != 0 {
		t.Fatalf("new answers %d: %s", code, errs.String())
	}
	if !reflect.DeepEqual(staged, []string{"spec/failures/leaf-held.md"}) {
		t.Fatalf("new stages %q", staged)
	}
}

func TestFailureNewRefusesANodeWithNoRemedy(t *testing.T) {
	t.Parallel()
	root, verb := failureOver(t, map[string]string{})
	var out, errs bytes.Buffer
	if code := verb([]string{"failure", "new", "bare", "--level=error", "--when=It fails."}, false, &out, &errs); code != exitUsage {
		t.Errorf("new answers %d, want %d", code, exitUsage)
	}
	if !strings.Contains(errs.String(), "remedies") && !strings.Contains(errs.String(), "bare names no remedy") {
		t.Errorf("new says %q, and names no missing remedy", errs.String())
	}
	if _, err := os.Stat(filepath.Join(root, "spec", "failures", "bare.md")); err == nil {
		t.Error("new writes a node with no remedy")
	}
}

func TestFailureNewRefusesEachShapeOffTheSchema(t *testing.T) {
	t.Parallel()
	cases := map[string]struct {
		argv []string
		says string
	}{
		"a level off the ladder": {[]string{"odd", "--level=loud", "--remedy=Run it.", "--when=It fails."}, "a level stands on the ladder"},
		"an id a node carries":   {[]string{"leaf-held", "--level=warn", "--remedy=Run it.", "--when=It fails."}, "stands already"},
		"an id with a slash":     {[]string{"../escape", "--level=warn", "--remedy=Run it.", "--when=It fails."}, "lowercase words joined by hyphens"},
		"no when":                {[]string{"quiet", "--level=warn", "--remedy=Run it."}, "names no --when"},
	}
	for name, one := range cases {
		root, verb := failureOver(t, map[string]string{"spec/failures/leaf-held.md": heldFailure})
		var out, errs bytes.Buffer
		if code := verb(append([]string{"failure", "new"}, one.argv...), false, &out, &errs); code != exitUsage {
			t.Errorf("%s: new answers %d, want %d", name, code, exitUsage)
		}
		if !strings.Contains(errs.String(), one.says) {
			t.Errorf("%s: new says %q, want it to name %q", name, errs.String(), one.says)
		}
		if held, _ := readIn(root, "spec/failures/leaf-held.md"); held != heldFailure {
			t.Errorf("%s: new writes over the standing node", name)
		}
		if _, err := os.Stat(filepath.Join(root, "spec", "escape.md")); err == nil {
			t.Errorf("%s: new writes outside spec/failures", name)
		}
	}
}

func TestFailureCountAnswersEachIdWithItsCount(t *testing.T) {
	t.Parallel()
	row := func(kind, id string) string {
		return `{"at":"2026-10-06T11:00:00.000Z","level":"error","kind":"` + kind + `","said":"x","failure":"` + id + `"}` + "\n"
	}
	bare := `{"at":"2026-10-06T11:00:00.000Z","level":"error","kind":"failure","said":"x"}` + "\n"
	log := row("failure", "b") + row("failure", "a") + row("write", "a") + bare + row("failure", "a") + row("failure", "c") + row("failure", "")
	_, verb := failureOver(t, map[string]string{sessionLog: log})
	var out, errs bytes.Buffer
	if code := verb([]string{"failure", "count"}, false, &out, &errs); code != 0 {
		t.Fatalf("count answers %d: %s", code, errs.String())
	}
	if want := "2 a\n1 b\n1 c\n"; out.String() != want {
		t.Errorf("count prints %q, want %q", out.String(), want)
	}
}
