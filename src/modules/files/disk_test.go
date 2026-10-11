// A write names the revision it read, and the disk refuses it where the
// file moves since.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package files

import (
	"io/fs"
	"os"
	"testing"

	"quackitect/src/q"
)

func TestAStaleWriteIsRefused(t *testing.T) {
	disk := NewFakeDisk()
	if err := disk.Write("a.md", "one"); err != nil {
		t.Fatal(err)
	}
	accept := Accept(disk)
	stale := q.Request{Module: DiskModule, Verb: "write", Args: Write{Path: "a.md", Text: "two", Read: ContentOf("zero").Hash}}
	if _, err := accept(stale); err == nil {
		t.Fatal("a write naming a stale revision lands")
	}
	if text, _, _ := disk.Read("a.md"); text != "one" {
		t.Fatalf("a.md reads %q after a refused write", text)
	}
	current := q.Request{Module: DiskModule, Verb: "write", Args: Write{Path: "a.md", Text: "two", Read: ContentOf("one").Hash}}
	if _, err := accept(current); err != nil {
		t.Fatalf("a write naming the current revision answers %v", err)
	}
}

// A missing root ends the walk, and a nested folder missing at its own read leaves the walk on its siblings. [[spec/tickets/disk-list-skips-gone-folders]]
func TestAGoneNestedFolderLeavesTheWalkGoing(t *testing.T) {
	if got := gone("root", "root"); got != fs.SkipAll {
		t.Errorf("a missing root answers %v, and wants SkipAll", got)
	}
	if got := gone("root", "root/a"); got != nil {
		t.Errorf("a missing nested folder answers %v, and wants the walk to go on", got)
	}
}

// A folder whose files are gone removes whole, so a worktree opens on its path again, and a folder holding a file stands. [[spec/tickets/review-clears-stale-worktree]]
func TestRemovingAFolderOfEmptyFoldersRemovesIt(t *testing.T) {
	root := t.TempDir() // level0: FixtureOutsideHome - the case writes into a real folder of its own
	disk := NewDisk(root)
	for _, one := range []string{"gone/a/deep/x.md", "kept/a/x.md"} {
		if err := disk.Write(one, "x"); err != nil {
			t.Fatal(err)
		}
	}
	_ = disk.Remove("gone/a/deep/x.md")
	if err := disk.Remove("gone"); err != nil {
		t.Fatalf("removing a folder of empty folders answers %v", err)
	} else if _, err := os.Stat(root + "/gone"); !os.IsNotExist(err) {
		t.Fatalf("the folder stands after its remove: %v", err)
	}
	if disk.Remove("kept") == nil {
		t.Fatal("removing a folder holding a file answers no error")
	} else if _, ok, _ := disk.Read("kept/a/x.md"); !ok {
		t.Fatal("the file under the folder is gone after the refused remove")
	}
}
