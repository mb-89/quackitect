// The stamp verb over fake doors: go list names the files a build reads, and
// the stamp reads fresh until one of them moves.
// [[spec/tickets/scripts-folder-leaves]] [[spec/design_output/lsp#the-build-beside-the-index]]
package main

import (
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

// Fake doors whose go list names the module and the files the package reads, over a tree holding them. [[spec/tickets/scripts-folder-leaves]]
func stampBox(t *testing.T) (boxDoors, *fakeRunner) {
	t.Helper()
	d, runner, _, _ := fakeBoxDoors(t)
	seedTree(t, d.root, map[string]string{
		"go.mod":         "module quackitect\n\ngo 1.24\n",
		"go.sum":         "",
		"src/quack/m.go": "package main\n",
		"src/q/q.go":     "package q\n",
	})
	fake := runner.run
	d.run = func(argv []string, o runOpts) ranResult {
		if len(argv) > 2 && argv[0] == "go" && argv[1] == "list" {
			fake(argv, o)
			if argv[2] == "-m" {
				return ranResult{stdout: "quackitect\n"}
			}
			return ranResult{stdout: "quackitect/src/quack/m.go\nquackitect/src/q/q.go\n"}
		}
		return fake(argv, o)
	}
	return d, runner
}

func TestTheSourceStampReadsFreshAfterAWriteAndStaleOnceASourceMoves(t *testing.T) {
	t.Parallel()
	d, _ := stampBox(t)
	steps := []struct {
		name  string
		moves map[string]string
		argv  []string
		want  int
	}{
		{"no stamp reads stale", nil, []string{"fresh", "se-index"}, 1},
		{"the stamp lands", nil, []string{"write", "se-index"}, 0},
		{"the stamp reads fresh", nil, []string{"fresh", "se-index"}, 0},
		{"a move in an imported package reads stale", map[string]string{"src/q/q.go": "package q\n\nvar _ = 1\n"}, []string{"fresh", "se-index"}, 1},
		{"a second write lands", nil, []string{"write", "se-index"}, 0},
		{"a move in go.sum reads stale", map[string]string{"go.sum": "a v1 h1:x\n"}, []string{"fresh", "se-index"}, 1},
	}
	for _, one := range steps {
		seedTree(t, d.root, one.moves)
		if code := stampVerb(d, one.argv); code != one.want {
			t.Fatalf("%s: stamp %s answers %d, and wants %d", one.name, strings.Join(one.argv, " "), code, one.want)
		}
	}
}

func TestTheStampReadsTheFilesGoListsForTheBinaryNamed(t *testing.T) {
	t.Parallel()
	for _, one := range []struct{ binary, pkg string }{{"se-index", "./src/quack"}, {"se-front", "./src/front/cmd"}} {
		d, runner := stampBox(t)
		stampVerb(d, []string{"write", one.binary})
		at := slices.IndexFunc(runner.ran, func(argv []string) bool { return slices.Contains(argv, "-deps") })
		if at < 0 || runner.ran[at][len(runner.ran[at])-1] != one.pkg || runner.opts[at].cwd != d.root {
			t.Errorf("%s: the stamp ran %v, and wants go list -deps over %s under the root", one.binary, runner.ran, one.pkg)
		}
		if !stands(filepath.Join(d.root, ".se", ".runtime", "bin", "."+one.binary+"-source")) {
			t.Errorf("%s: no stamp stands beside the binary", one.binary)
		}
	}
}

func TestTheStampVerbRefusesAWordOrBinaryItKnowsNot(t *testing.T) {
	t.Parallel()
	for _, argv := range [][]string{nil, {"fresh"}, {"fresh", "se-nothing"}, {"keep", "se-index"}} {
		d, runner := stampBox(t)
		if code := stampVerb(d, argv); code != 2 || len(runner.ran) != 0 {
			t.Errorf("stamp %v answers %d after %v, and wants 2 with no run", argv, code, runner.ran)
		}
	}
}
