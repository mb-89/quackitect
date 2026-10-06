// The pull, the take and the mint raise every refusal through the failure
// door, so no refusal text stands written past it in their files.
// [[spec/design_output/failures#the-refusals-move-onto-nodes]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The refusal calls each moved place wrote before the move, spelled in halves so this file names none. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
var refusalsPast = map[string]string{
	"src/pull":               "Say(" + "Refused",
	"src/branches/take.go":   "d." + "warn(",
	"src/quack/verb_mint.go": "(errs, " + "why)",
}

func TestMovedRefusalsPassTheFailureDoor(t *testing.T) {
	t.Parallel()
	for place, form := range refusalsPast {
		for _, path := range goFilesAt(t, filepath.Join(treeRoot, filepath.FromSlash(place))) {
			text, err := os.ReadFile(path)
			if err != nil {
				t.Fatal(err)
			}
			if strings.Contains(string(text), form) {
				t.Errorf("%s writes a refusal past the failure door: %s", path, form)
			}
		}
	}
}

// Every Go file a place names, the file itself or each one in its folder, its cases left out. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
func goFilesAt(t *testing.T, at string) []string {
	t.Helper()
	info, err := os.Stat(at)
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
