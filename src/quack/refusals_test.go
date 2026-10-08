// The pull, the take and the mint raise every refusal through the failure
// door, so no refusal text stands written past it in their files.
// [[spec/design_output/failures#the-refusals-move-onto-nodes]]
package main // level0: InPackageTest - no external test imports a main package, and the case reaches treeRoot

import (
	"bytes"
	"errors"
	"io"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"

	"quackitect/src/failure"
	"quackitect/src/modules/clock"
)

func TestMovedRefusalsPassTheFailureDoor(t *testing.T) {
	t.Parallel()
	files := map[string]string{}
	for place := range failure.Moved {
		for _, path := range goFilesAt(t, filepath.Join(treeRoot, filepath.FromSlash(place))) {
			text, err := realDisk().read(path)
			if err != nil {
				t.Fatal(err)
			}
			rel, err := filepath.Rel(treeRoot, path)
			if err != nil {
				t.Fatal(err)
			}
			files[filepath.ToSlash(rel)] = string(text)
		}
	}
	for _, fault := range failure.DoorFaults(failure.Moved, files) {
		t.Error(fault)
	}
}

// Every Go file a place names, the file itself or each one in its folder, its cases left out. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
func goFilesAt(t *testing.T, at string) []string {
	t.Helper()
	info, err := realDisk().stat(at)
	if err != nil {
		t.Fatal(err)
	}
	if !info.IsDir() {
		return []string{at}
	}
	names, err := filepath.Glob(filepath.Join(at, "*.go"))
	if err != nil {
		t.Fatal(err)
	}
	out := []string{}
	for _, one := range names {
		if !strings.HasSuffix(one, "_test.go") {
			out = append(out, one)
		}
	}
	return out
}

var failureNow = time.Date(2026, 10, 6, 12, 0, 0, 0, time.UTC)

const (
	heldFailure   = "---\nkind: [[failure]]\nlevel: warn\nremedies:\n  - Pull again.\n---\n\n# When\n\nA hand pulls while a leaf stands in it.\n"
	failureSchema = "spec/schemas/failure.schema.yaml"
)

// A root holding the failure schema and the files named under it, and the failure verb over it at the case's now. [[spec/design_output/failures#an-agent-raises-by-verb]]
func failureOver(t *testing.T, files map[string]string) (string, twin) {
	t.Helper()
	schema, err := realDisk().read(filepath.Join("..", "..", filepath.FromSlash(failureSchema)))
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir() // level0: FixtureOutsideHome - the verb writes, stages and logs nodes under a root of the case's own
	seeded := map[string]string{failureSchema: string(schema)}
	for at, text := range files {
		seeded[at] = text
	}
	for at, text := range seeded {
		path := filepath.Join(root, filepath.FromSlash(at))
		if err := realDisk().makeAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := realDisk().write(path, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return root, failureVerb(func() (failureDoors, error) {
		return failureDoors{root: root, now: func() time.Time { return failureNow }, disk: realDisk()}, nil
	})
}

// A raise prints the node's lines and writes its row, and a raise of an unregistered id logs it at error and fails. [[spec/design_output/failures#an-agent-raises-by-verb]]
func TestFailureRaisePrintsTheNodesLinesAndWritesItsRow(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		argv          []string
		code          int
		prints, level string
	}{
		{[]string{"leaf-held", "a leaf stands", "in your hand"}, 0, "a leaf stands in your hand\nfailure leaf-held at warn\nremedy: Pull again.\n", "warn"},
		{[]string{"nobody", "it fails"}, exitFailed, "it fails\nfailure nobody stands unregistered, so spec/failures names no remedy\n", "error"},
	} {
		root, verb := failureOver(t, map[string]string{"spec/failures/leaf-held.md": heldFailure})
		var out, errs bytes.Buffer
		if code := verb(append([]string{"failure", "raise"}, one.argv...), false, &out, &errs); code != one.code || out.String() != one.prints {
			t.Errorf("raise answers %d and prints %q, want %d and %q", code, out.String(), one.code, one.prints)
		}
		said := strings.Join(one.argv[1:], " ")
		want := `{"at":"2026-10-06T12:00:00.000Z","level":"` + one.level + `","kind":"failure","said":"` + said + `","failure":"` + one.argv[0] + `"}` + "\n"
		if got, _ := readIn(root, sessionLog); got != want {
			t.Errorf("raise writes %q, want %q", got, want)
		}
	}
}

// New writes the node in the shape the schema names, and stages the file it writes. [[spec/design_output/failures#an-agent-raises-by-verb]]
func TestFailureNewWritesTheNode(t *testing.T) {
	t.Parallel()
	root, _ := failureOver(t, map[string]string{})
	var staged []string
	verb := failureVerb(func() (failureDoors, error) {
		return failureDoors{root: root, now: func() time.Time { return failureNow }, disk: realDisk(), stage: func(path string) bool {
			staged = append(staged, path)
			return true
		}}, nil
	})
	var out, errs bytes.Buffer
	argv := []string{"failure", "new", "leaf-held", "--level=warn", "--remedy=Pull again.", "--remedy=Run this: ./RUNME.sh branch release", "--when=A hand pulls while a leaf stands in it."}
	if code := verb(argv, false, &out, &errs); code != 0 || !reflect.DeepEqual(staged, []string{"spec/failures/leaf-held.md"}) {
		t.Fatalf("new answers %d: %s, and stages %q", code, errs.String(), staged)
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
		"no remedy":              {[]string{"bare", "--level=error", "--when=It fails."}, "remed"},
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
		if realDisk().stands(filepath.Join(root, "spec", "escape.md")) || realDisk().stands(filepath.Join(root, "spec", "failures", "bare.md")) {
			t.Errorf("%s: new writes outside spec/failures, or a node with no remedy", name)
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

const watchedNode = `---
kind: [[failure]]
level: warn
remedies: ["Run the take again."]
watch:
  event: tool.call
  match: "branch take"
---

# When

A box takes a branch.
`

// A post a watch matches writes the fired failure's row, its id under the id field. [[spec/tickets/the-hooks-feed-the-sentinel]]
func TestSentinelOverWritesTheFiredRow(t *testing.T) {
	t.Parallel()
	rows := []map[string]any{}
	say := func(row map[string]any) error { rows = append(rows, row); return nil }
	dir := failure.FakeDir{failure.Folder + "/take-watched.md": watchedNode}
	hear := sentinelOver(dir, clock.NewFake(time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)), &failure.FakeRunner{}, say, io.Discard)
	hear(failure.Event{Kind: "tool.call", Text: `{"command":"./RUNME.sh branch take"}`})
	if len(rows) != 1 || rows[0][failure.IDField] != "take-watched" || rows[0]["at"] != "2026-01-02T03:04:05.000Z" {
		t.Fatalf("the sentinel writes %+v, and wants one row of take-watched stamped at the clock's time", rows)
	}
}

// A write the log refuses says the lost row's id and the fault, so a lost row shows. [[spec/tickets/sentinel-say-error-lands]]
func TestSentinelOverSaysALostRow(t *testing.T) {
	t.Parallel()
	say := func(map[string]any) error { return errors.New("the log stands read-only") }
	dir := failure.FakeDir{failure.Folder + "/take-watched.md": watchedNode}
	var errs bytes.Buffer
	hear := sentinelOver(dir, clock.NewFake(time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)), &failure.FakeRunner{}, say, &errs)
	hear(failure.Event{Kind: "tool.call", Text: `{"command":"./RUNME.sh branch take"}`})
	if said := errs.String(); !strings.Contains(said, "take-watched") || !strings.Contains(said, "the log stands read-only") {
		t.Fatalf("the sentinel says %q, and wants the lost row's id and the fault", said)
	}
}

// The sentinel the wiring hands the hooks door reads the tree's nodes and writes a fired row into the session log. [[spec/tickets/wiring-names-listens-hooks]]
// level0: FixtureOutsideHome - the sentinel reads its node and writes its session log under a root of the case's own
func TestSentinelHereWritesTheSessionLog(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	if err := realDisk().makeAll(filepath.Join(root, filepath.FromSlash(failure.Folder)), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := realDisk().write(filepath.Join(root, filepath.FromSlash(failure.Folder), "take-watched.md"), []byte(watchedNode), 0o644); err != nil {
		t.Fatal(err)
	}
	sentinelHere(root, io.Discard)(failure.Event{Kind: "tool.call", Text: `{"command":"./RUNME.sh branch take"}`})
	said, err := realDisk().read(filepath.Join(root, filepath.FromSlash(sessionLog)))
	if err != nil || !strings.Contains(string(said), `"take-watched"`) {
		t.Fatalf("the session log reads %q (%v), and wants the row of take-watched", said, err)
	}
}
