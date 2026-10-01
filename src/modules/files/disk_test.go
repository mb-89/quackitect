// A write names the revision it read, and the disk refuses it where the
// file moves since.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package files

import (
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
