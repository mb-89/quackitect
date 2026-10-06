// The pull, the take and the mint raise every refusal through the failure
// door, so no refusal text stands written past it in their files.
// [[spec/design_output/failures#the-refusals-move-onto-nodes]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/failure"
)

func TestMovedRefusalsPassTheFailureDoor(t *testing.T) {
	t.Parallel()
	files := map[string]string{}
	for place := range failure.Moved {
		for _, path := range goFilesAt(t, filepath.Join(treeRoot, filepath.FromSlash(place))) {
			text, err := os.ReadFile(path)
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
