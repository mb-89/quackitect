// One suite of cases holds the fake disk to the disk on this box.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package pull

import (
	"strings"
	"testing"

	"quackitect/src/modules/files"
)

func diskSuite(t *testing.T, disk Disk) {
	t.Run("a write reads back, and its folder stands", func(t *testing.T) {
		if err := disk.Write("spec/tickets/one.md", "held\n"); err != nil {
			t.Fatal(err)
		}
		if said, ok := disk.Read("spec/tickets/one.md"); !ok || said != "held\n" {
			t.Fatalf("the read answers %q, %v", said, ok)
		}
		if !disk.Exists("spec/tickets") || !disk.Exists("spec/tickets/one.md") {
			t.Fatal("the folder or the file stands nowhere")
		}
	})
	t.Run("a folder lists its own files sorted, and no file under a folder of its own", func(t *testing.T) {
		for _, path := range []string{"spec/tickets/b.md", "spec/tickets/a.md", "spec/tickets/deep/c.md"} {
			if err := disk.Write(path, "x"); err != nil {
				t.Fatal(err)
			}
		}
		if got := strings.Join(disk.Files("spec/tickets"), " "); got != "a.md b.md one.md" {
			t.Fatalf("the folder lists %q", got)
		}
	})
	t.Run("a removed file reads as nothing, and a second removal stands clean", func(t *testing.T) {
		if err := disk.Write("spec/gone-soon.md", "x"); err != nil {
			t.Fatal(err)
		}
		if err := disk.Remove("spec/gone-soon.md"); err != nil || disk.Exists("spec/gone-soon.md") {
			t.Fatalf("the removal answers %v", err)
		}
		if err := disk.Remove("spec/gone-soon.md"); err != nil {
			t.Fatalf("a second removal answers %v", err)
		}
	})
	t.Run("a path nothing holds reads as nothing", func(t *testing.T) {
		if _, ok := disk.Read("spec/gone.md"); ok || disk.Exists("spec/gone.md") || len(disk.Files("spec/gone")) != 0 {
			t.Fatal("a path nothing holds answers something")
		}
	})
}

func TestDiskContract(t *testing.T) {
	t.Parallel()
	t.Run("the fake", func(t *testing.T) { diskSuite(t, FakeDisk{}) })
	t.Run("the disk on this box", func(t *testing.T) { diskSuite(t, OSDisk{Root: t.TempDir()}) })
	t.Run("a work tree over the fake disk", func(t *testing.T) { diskSuite(t, TreeDisk{Tree: files.NewFakeDisk()}) })
}
