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
	for name, one := range map[string]Disk{"fake": NewFakeDisk(), "real": NewDisk(t.TempDir())} {
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

func TestDiskKeepsItsContract(t *testing.T) {
	t.Run("fake", func(t *testing.T) { diskSuite(t, func(*testing.T) Disk { return NewFakeDisk() }) })
	t.Run("real", func(t *testing.T) { diskSuite(t, func(t *testing.T) Disk { return NewDisk(t.TempDir()) }) })
}
