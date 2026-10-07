// quack reads the guidance files off the tree, each keyed by its path under
// the root.
// [[spec/tickets/the-guidance-topic-lands]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"testing"

	"quackitect/src/modules/guidance"
)

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
