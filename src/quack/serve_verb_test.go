// The serve verb in Go, over a fake process: a fresh start, a door already
// answering, and an index that falls, each with the line and the exit code
// the JavaScript answers.
// [[spec/design_output/level0#a-desk-serve-returns]]
package main

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
	env   map[string]string
	self  string
}

func serveBoxAt(t *testing.T) *serveBox {
	t.Helper()
	return &serveBox{root: filepath.ToSlash(t.TempDir()), door: serveDoorText}
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
			env:  func(name string) string { return box.env[name] },
			self: box.self,
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

// A box no cloud variable marks runs nothing under the bridge flag and prints nothing, because a person starts the index there. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func TestServeBridgeOffTheCloudRunsNothing(t *testing.T) {
	t.Parallel()
	box := serveBoxAt(t)
	box.self = "/method/.se/.runtime/bin/se-index"
	if code, out, _ := box.runs(t, serveBridge); code != 0 || out != "" || len(box.ran) != 0 {
		t.Fatalf("code %d, out %q, ran %v", code, out, box.ran)
	}
}

// Either cloud variable starts the binary running the verb standing in the work root, and one info row names the port. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func TestServeBridgeOnTheCloudStandsTheIndexAndSaysOneRow(t *testing.T) {
	t.Parallel()
	for _, name := range serveCloudVars {
		box := serveBoxAt(t)
		box.env = map[string]string{name: "1"}
		box.self = "/method/.se/.runtime/bin/se-index"
		code, out, _ := box.runs(t, serveBridge)
		want := `{"level":"info","said":"no index answered, so the bridgehead starts one","event":"session.start","detail":"The index starts at port 7001, because no door stood."}` + "\n"
		if code != 0 || out != want {
			t.Fatalf("%s: code %d, out %q", name, code, out)
		}
		ran := [][]string{{box.self, "standing"}}
		if !slices.EqualFunc(box.ran, ran, slices.Equal[[]string]) || box.cwds[0] != box.root {
			t.Errorf("%s: ran %v in %v", name, box.ran, box.cwds)
		}
	}
}

// An index failing its standing reads as one warn row naming what it said, and the verb exits 1. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func TestServeBridgeWhoseIndexFallsWarns(t *testing.T) {
	t.Parallel()
	box := serveBoxAt(t)
	box.env = map[string]string{"CLAUDE_CODE_REMOTE": "true"}
	box.code, box.said = 1, "the index door does not answer\n"
	code, out, _ := box.runs(t, serveBridge)
	want := `{"level":"warn","said":"the index fails its standing, so no door stands","event":"session.start","detail":"The index falls: the index door does not answer"}` + "\n"
	if code != 1 || out != want {
		t.Fatalf("code %d, out %q", code, out)
	}
	if box.ran[0][0] != box.root+"/.se/.runtime/bin/se-index" {
		t.Errorf("a verb naming no binary of its own runs the root's, and ran %v", box.ran)
	}
}

// The registered verb answers the serve words. [[spec/tickets/quack-registers-each-verb]]
func TestServeRegisters(t *testing.T) {
	t.Parallel()
	if registry["serve"] == nil {
		t.Error("no serve verb stands in the registry")
	}
}
