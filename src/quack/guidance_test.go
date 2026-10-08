// quack reads the guidance files off the tree, each keyed by its path under
// the root.
// [[spec/tickets/the-guidance-topic-lands]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"quackitect/src/modules/guidance"
	"quackitect/src/q"
)

// The gate of the standard route reads the design review note, and no other review note. [[spec/tickets/one-review-a-ticket]]
func TestTheStandardGateReadsTheDesignReviewNoteAlone(t *testing.T) {
	t.Parallel()
	rows, err := guidanceRows(realDisk(), treeRoot, map[string]string{})
	if err != nil {
		t.Fatal(err)
	}
	gate := rows["standard:gate"]
	if !slices.Contains(gate, "spec/guidance/review/design") || slices.Contains(gate, "spec/guidance/review/reviewing") {
		t.Fatalf("the standard gate reads %v, and wants the design review note and no other review note", gate)
	}
}

// Every note under a subfolder of spec/guidance reaches some leaf of some process. [[spec/design_input/level-two#guidance]]
func TestEveryGuidanceNoteUnderASubfolderReachesSomeLeaf(t *testing.T) {
	t.Parallel()
	files, err := guidanceFiles(realDisk(), treeRoot)
	if err != nil {
		t.Fatal(err)
	}
	reached := map[string]bool{}
	for _, reads := range guidance.Resolve(guidance.Layered(files, map[string]q.Content{})) {
		for _, one := range reads {
			reached[one.Note] = true
		}
	}
	unreached := []string{}
	for path := range files {
		under, ok := strings.CutPrefix(path, guidance.Guidance+"/")
		name := filepath.Base(under)
		if !ok || !strings.Contains(under, "/") || !strings.HasSuffix(name, ".md") || strings.HasPrefix(name, "_") {
			continue
		}
		if !reached[strings.TrimSuffix(path, ".md")] {
			unreached = append(unreached, path)
		}
	}
	slices.Sort(unreached)
	if len(unreached) > 0 {
		t.Fatalf("no leaf reaches %v, and every note under a subfolder wants some step to read it", unreached)
	}
}

func TestGuidanceFilesKeyEachFileByItsPathUnderTheRoot(t *testing.T) {
	t.Parallel()
	root, disk := "/tree", newFakeDisk()
	at := filepath.Join(root, filepath.FromSlash(guidance.Guidance), "code")
	if err := disk.makeAll(at, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := disk.write(filepath.Join(at, "code.md"), []byte("# Actionables\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	said, err := guidanceFiles(disk, root)
	if err != nil {
		t.Fatal(err)
	}
	want := guidance.Guidance + "/code/code.md"
	if len(said) != 1 || said[want].Text != "# Actionables\n" {
		t.Fatalf("the files read %v, and want %s alone, with a processes folder standing nowhere", said, want)
	}
}
