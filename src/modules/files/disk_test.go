// A write names the revision it read, and the disk refuses it where the
// file moves since.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package files

import (
	"io/fs"
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
