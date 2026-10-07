// The serve verb in Go, over a fake process: a fresh start, a door already
// answering, and an index that falls, each with the line and the exit code
// the JavaScript answers.
// [[spec/design_output/level0#a-desk-serve-returns]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"errors"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

const serveDoorText = `{"port":7001,"token":"t"}`

// What a fake box records: every run and its folder. [[spec/design_output/level0#a-desk-serve-returns]]
type serveBox struct {
	root  string
	ran   [][]string
	cwds  []string
	code  int
	said  string
	fault error
	door  string
}

func serveBoxAt(t *testing.T) *serveBox {
	t.Helper()
	return &serveBox{root: filepath.ToSlash(t.TempDir()), door: serveDoorText} // level0: FixtureOutsideHome - each case stands its own door file under a root of its own
}

func (box *serveBox) hooks() string {
	return filepath.Join(box.root, ".se", ".runtime", "hooks.json")
}

// Writes the hooks door's standing file, as the index does once its door listens. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func (box *serveBox) stands(t *testing.T, text string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(box.hooks()), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(box.hooks(), []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}

func (box *serveBox) runs(t *testing.T, argv ...string) (int, string, string) {
	t.Helper()
	doors := func() serveDoors {
		return serveDoors{
			root: box.root,
			run: func(argv []string, cwd string) (int, string, error) {
				box.ran = append(box.ran, argv)
				box.cwds = append(box.cwds, cwd)
				if box.fault != nil {
					return 0, "", box.fault
				}
				if box.code == 0 {
					box.stands(t, box.door)
				}
				return box.code, box.said, nil
			},
		}
	}
	var out, errs strings.Builder
	code := serveVerb(doors)(append([]string{"serve"}, argv...), false, &out, &errs)
	return code, out.String(), errs.String()
}

// [[spec/design_output/level0#a-desk-serve-returns]]
func TestServeStartsTheIndexWhereNoDoorStands(t *testing.T) {
	t.Parallel()
	box := serveBoxAt(t)
	code, out, _ := box.runs(t)
	if code != 0 || out != "The index starts at port 7001, because no door stood.\n" {
		t.Fatalf("code %d, out %q", code, out)
	}
	want := [][]string{{box.root + "/.se/.runtime/bin/se-index", "standing"}}
	if !slices.EqualFunc(box.ran, want, slices.Equal[[]string]) || box.cwds[0] != box.root {
		t.Errorf("ran %v in %v", box.ran, box.cwds)
	}
}

// [[spec/design_output/level0#a-desk-serve-returns]]
func TestServeOverAStandingDoorSaysItAnswers(t *testing.T) {
	t.Parallel()
	box := serveBoxAt(t)
	box.stands(t, serveDoorText)
	if code, out, _ := box.runs(t); code != 0 || out != "The index answers at port 7001.\n" {
		t.Fatalf("code %d, out %q", code, out)
	}
}

// A door the start rewrites stands fresh, so the verb names the start. [[spec/design_output/level0#a-desk-serve-returns]]
func TestServeOverAMovedDoorSaysItStarts(t *testing.T) {
	t.Parallel()
	box := serveBoxAt(t)
	box.stands(t, `{"port":7000,"token":"old"}`)
	if code, out, _ := box.runs(t); code != 0 || out != "The index starts at port 7001, because no door stood.\n" {
		t.Fatalf("code %d, out %q", code, out)
	}
}

// A door naming no number reads as port 0, as Number answers NaN and the JavaScript falls back. [[spec/design_output/level0#a-desk-serve-returns]]
func TestServeReadsAPortOfNoNumberAsZero(t *testing.T) {
	t.Parallel()
	for door, want := range map[string]string{
		`{"token":"t"}`:     "0",
		`not json`:          "0",
		`{"port":"7002"}`:   "7002",
		`{"port":"x"}`:      "0",
		`{"port":7001.5}`:   "7001.5",
		`{"port":null}`:     "0",
		`{"port":" 7003 "}`: "7003",
	} {
		box := serveBoxAt(t)
		box.door = door
		if _, out, _ := box.runs(t); out != "The index starts at port "+want+", because no door stood.\n" {
			t.Errorf("%s answers %q", door, out)
		}
	}
}

// [[spec/design_output/level0#a-desk-serve-returns]]
func TestServeWhoseIndexFallsNamesWhatItSaid(t *testing.T) {
	t.Parallel()
	box := serveBoxAt(t)
	box.code, box.said = 1, "the index door does not answer\n"
	if code, out, _ := box.runs(t); code != 1 || out != "The index falls: the index door does not answer\n" {
		t.Fatalf("code %d, out %q", code, out)
	}
	box = serveBoxAt(t)
	box.code, box.said = 1, "no door"
	if code, out, _ := box.runs(t); code != 1 || out != "The index falls: no door\n" {
		t.Fatalf("code %d, out %q", code, out)
	}
}

// [[spec/design_output/level0#a-desk-serve-returns]]
func TestServeWhoseIndexFallsSilentNamesItsExit(t *testing.T) {
	t.Parallel()
	box := serveBoxAt(t)
	box.code = 3
	if code, out, _ := box.runs(t); code != 1 || out != "The index falls: it exits 3\n" {
		t.Fatalf("code %d, out %q", code, out)
	}
}

// The JavaScript throws where no index runs, and node exits 1; the Go names the fault. [[spec/design_output/level0#a-desk-serve-returns]]
func TestServeWithNoIndexFalls(t *testing.T) {
	t.Parallel()
	box := serveBoxAt(t)
	box.fault = errors.New("no such file")
	if code, out, _ := box.runs(t); code != 1 || out != "The index falls: no such file\n" {
		t.Fatalf("code %d, out %q", code, out)
	}
}

// [[spec/design_output/level0#a-desk-serve-returns]]
func TestServeTakesNoDebuggerAndRunsTheIndexStandingAlone(t *testing.T) {
	t.Parallel()
	box := serveBoxAt(t)
	if code, _, _ := box.runs(t, "--inspect"); code != 0 {
		t.Fatalf("code %d", code)
	}
	want := [][]string{{box.root + "/.se/.runtime/bin/se-index", "standing"}}
	if !slices.EqualFunc(box.ran, want, slices.Equal[[]string]) {
		t.Errorf("ran %v", box.ran)
	}
}
