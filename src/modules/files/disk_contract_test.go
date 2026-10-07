//go:build contract

// The contract of disk: one suite of cases, run against FakeDisk and the real
// disk in a folder of the test's own.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package files

import (
	"reflect"
	"testing"
)

func diskSuite(t *testing.T, open func(t *testing.T) Disk) {
	t.Run("a write reads back", func(t *testing.T) {
		one := open(t)
		if err := one.Write("a/b.md", "said"); err != nil {
			t.Fatal(err)
		}
		if text, ok, err := one.Read("a/b.md"); err != nil || !ok || text != "said" {
			t.Fatalf("a/b.md reads %q, %v, %v", text, ok, err)
		}
	})
	t.Run("a removed file reads as absent", func(t *testing.T) {
		one := open(t)
		if err := one.Write("c.md", "x"); err != nil {
			t.Fatal(err)
		}
		if err := one.Remove("c.md"); err != nil {
			t.Fatal(err)
		}
		if _, ok, err := one.Read("c.md"); err != nil || ok {
			t.Fatalf("c.md reads %v, %v after the remove", ok, err)
		}
	})
}

func TestDiskListsEveryFileUnderAFolder(t *testing.T) {
	for name, one := range map[string]Disk{"fake": NewFakeDisk(), "real": NewDisk(t.TempDir())} { // level0: FixtureOutsideHome - the case writes into a real folder of its own
		for _, path := range []string{"e.md", "ab/d.md", "a/deep/c.md", "a/b.md"} {
			if err := one.Write(path, "x"); err != nil {
				t.Fatal(err)
			}
		}
		if said, err := one.List("a"); err != nil || !reflect.DeepEqual(said, []string{"a/b.md", "a/deep/c.md"}) {
			t.Errorf("the %s disk lists %v, %v under a", name, said, err)
		}
		if said, err := one.List(""); err != nil || !reflect.DeepEqual(said, []string{"a/b.md", "a/deep/c.md", "ab/d.md", "e.md"}) {
			t.Errorf("the %s disk lists %v, %v under its root", name, said, err)
		}
		if said, err := one.List("none"); err != nil || len(said) != 0 {
			t.Errorf("the %s disk lists %v, %v under a folder nothing holds", name, said, err)
		}
		if err := one.Remove("a/deep/c.md"); err != nil {
			t.Fatal(err)
		}
		if said, err := one.List("a"); err != nil || !reflect.DeepEqual(said, []string{"a/b.md"}) {
			t.Errorf("the %s disk lists %v, %v under a once a/deep/c.md is removed", name, said, err)
		}
	}
}

// A link reads what it names, file or folder, and its removal leaves that standing, as the review verb's worktree links. [[spec/tickets/branch-verbs-meet-fake-git]]
func TestDiskLinksAPathAndTheUnlinkLeavesItsTarget(t *testing.T) {
	for name, one := range map[string]Disk{"fake": NewFakeDisk(), "real": NewDisk(t.TempDir())} { // level0: FixtureOutsideHome - the case writes into a real folder of its own
		for path, text := range map[string]string{"lib/x.txt": "held", "a.md": "said"} {
			if err := one.Write(path, text); err != nil {
				t.Fatal(err)
			}
		}
		for path, to := range map[string]string{"lib": "work/deep/lib", "a.md": "work/a.md"} {
			if err := one.Link(path, to); err != nil {
				t.Errorf("the %s disk links %s at %s with %v", name, path, to, err)
			}
		}
		if text, ok, err := one.Read("work/deep/lib/x.txt"); err != nil || !ok || text != "held" {
			t.Errorf("the %s disk reads %q, %v, %v through the folder link", name, text, ok, err)
		}
		if err := one.Write("a.md", "next"); err != nil {
			t.Fatal(err)
		}
		if text, ok, err := one.Read("work/a.md"); err != nil || !ok || text != "next" {
			t.Errorf("the %s disk reads %q, %v, %v through the file link once its target moves", name, text, ok, err)
		}
		for _, to := range []string{"work/deep/lib", "work/a.md"} {
			if err := one.Remove(to); err != nil {
				t.Errorf("the %s disk removes the link %s with %v", name, to, err)
			}
		}
		if text, ok, err := one.Read("lib/x.txt"); err != nil || !ok || text != "held" {
			t.Errorf("the %s disk reads lib/x.txt as %q, %v, %v once its link leaves", name, text, ok, err)
		}
		if text, ok, err := one.Read("a.md"); err != nil || !ok || text != "next" {
			t.Errorf("the %s disk reads a.md as %q, %v, %v once its link leaves", name, text, ok, err)
		}
		if _, ok, err := one.Read("work/a.md"); err != nil || ok {
			t.Errorf("the %s disk reads the removed link work/a.md as %v, %v", name, ok, err)
		}
	}
}

// A write under a path a file holds, or onto a folder, refuses, and the file stands as it stood. [[spec/design_output/doors#a-fake-behaves]]
func TestDiskRefusesAWriteThroughAFileOrOntoAFolder(t *testing.T) {
	for name, one := range map[string]Disk{"fake": NewFakeDisk(), "real": NewDisk(t.TempDir())} { // level0: FixtureOutsideHome - the case writes into a real folder of its own
		for path, text := range map[string]string{"a": "file", "b/c.md": "c"} {
			if err := one.Write(path, text); err != nil {
				t.Fatal(err)
			}
		}
		if err := one.Write("a/deep/x.md", "x"); err == nil {
			t.Errorf("the %s disk writes under a file", name)
		}
		if err := one.Write("b", "over"); err == nil {
			t.Errorf("the %s disk writes a file onto a folder", name)
		}
		if text, ok, err := one.Read("a"); err != nil || !ok || text != "file" {
			t.Errorf("the %s disk reads a as %q, %v, %v", name, text, ok, err)
		}
	}
}

func TestDiskKeepsItsContract(t *testing.T) {
	t.Run("fake", func(t *testing.T) { diskSuite(t, func(*testing.T) Disk { return NewFakeDisk() }) })
	t.Run("real", func(t *testing.T) { diskSuite(t, func(t *testing.T) Disk { return NewDisk(t.TempDir()) }) })
}
