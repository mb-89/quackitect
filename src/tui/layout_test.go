// The packages the window holds, and the order their imports run in. Each
// case reads the folders as they stand, and the chapter is the one list.
// [[spec/design_output/tui#the-packages-the-window-holds]]

package main

import (
	goparser "go/parser"
	gotoken "go/token"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const module = "quackitect/tui"

// What each package imports of this module, as the chapter's table says. [[spec/design_output/tui#the-packages-the-window-holds]]
var layout = map[string][]string{
	"draw":  {},
	"tree":  {"draw"},
	"frame": {"draw", "tree"},
	"log":   {"frame", "draw"},
	"work":  {"frame", "tree", "draw"},
	".":     {"frame", "log", "work", "draw"},
}

func importsOf(t *testing.T, folder string) map[string]bool {
	t.Helper()
	found := map[string]bool{}
	names, err := filepath.Glob(filepath.Join(folder, "*.go"))
	if err != nil || len(names) == 0 {
		t.Fatalf("%s holds no Go file, and each package holds one at least", folder)
	}
	for _, name := range names {
		file, err := goparser.ParseFile(gotoken.NewFileSet(), name, nil, goparser.ImportsOnly)
		if err != nil {
			t.Fatal(err)
		}
		for _, one := range file.Imports {
			path := strings.Trim(one.Path.Value, `"`)
			if strings.HasPrefix(path, module+"/") {
				found[strings.TrimPrefix(path, module+"/")] = true
			}
		}
	}
	return found
}

// Each tab stands under a folder of its own, and every import in the chapter's table runs down. [[spec/design_output/tui#the-packages-the-window-holds]]
func TestEachPackageImportsWhatTheChapterSaysAndNoMore(t *testing.T) {
	t.Parallel()
	for folder, allowed := range layout {
		found := importsOf(t, folder)
		for one := range found {
			ok := false
			for _, said := range allowed {
				ok = ok || said == one
			}
			if !ok {
				t.Fatalf("%s imports %s, which the chapter's row leaves out", folder, one)
			}
		}
	}
}

// The root holds the window's own files, and a tab's files stand under its folder. [[spec/design_output/tui#the-packages-the-window-holds]]
func TestTheRootHoldsTheWindowAlone(t *testing.T) {
	t.Parallel()
	names, _ := filepath.Glob("*.go")
	for _, name := range names {
		for _, part := range []string{"work", "record", "tail", "tree", "colour", "filter"} {
			if strings.HasPrefix(name, part) {
				t.Fatalf("%s stands at the root, and its package holds it", name)
			}
		}
	}
	for _, folder := range []string{"draw", "tree", "frame", "log", "work"} {
		if said, err := os.Stat(folder); err != nil || !said.IsDir() {
			t.Fatalf("%s stands nowhere, and the chapter names it", folder)
		}
	}
}
