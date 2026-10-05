// The vehicle's disk door over a temporary folder: the real door writes and
// copies, and its dry twin reads the same disk and writes nothing.
// [[spec/design_output/doors#one-door-per-outside-thing]]
package vehicle

import (
	"path/filepath"
	"testing"
)

// The real door reads back what it writes, and copies the files a filter keeps. [[spec/design_output/doors#one-door-per-outside-thing]]
func TestTheDiskDoorWritesReadsAndCopies(t *testing.T) {
	disk, at := OS(), t.TempDir()
	from := filepath.Join(at, "from")
	if err := disk.MakeDir(filepath.Join(from, "kept")); err != nil {
		t.Fatal(err)
	}
	for _, one := range []string{"kept/a.txt", "left.txt"} {
		if err := disk.Write(filepath.Join(from, filepath.FromSlash(one)), one); err != nil {
			t.Fatal(err)
		}
	}
	if said, err := disk.Read(filepath.Join(from, "kept", "a.txt")); err != nil || said != "kept/a.txt" {
		t.Fatalf("the door reads %q, %v", said, err)
	}
	to := filepath.Join(at, "to")
	if err := disk.MakeDir(to); err != nil {
		t.Fatal(err)
	}
	count, err := disk.CopyFolder(from, to, func(rel string) bool { return rel != "left.txt" })
	if err != nil || count != 1 || !disk.Exists(filepath.Join(to, "kept", "a.txt")) || disk.Exists(filepath.Join(to, "left.txt")) {
		t.Fatalf("the copy answers %d, %v", count, err)
	}
}

// The dry twin reads through the disk and writes nothing. [[spec/tickets/runme-hands-verbs-to-quack]]
func TestTheDryDoorWritesNothing(t *testing.T) {
	at := t.TempDir()
	was := filepath.Join(at, "was.txt")
	if err := OS().Write(was, "was"); err != nil {
		t.Fatal(err)
	}
	dry := Dry(OS())
	if said, err := dry.Read(was); err != nil || said != "was" {
		t.Fatalf("the dry door reads %q, %v", said, err)
	}
	now := filepath.Join(at, "now", "now.txt")
	if err := dry.MakeDir(filepath.Dir(now)); err != nil {
		t.Fatal(err)
	}
	if err := dry.Write(now, "now"); err != nil {
		t.Fatal(err)
	}
	if err := dry.Remove(was); err != nil {
		t.Fatal(err)
	}
	if OS().Exists(filepath.Dir(now)) || !OS().Exists(was) {
		t.Fatal("the dry door wrote to the disk")
	}
}
