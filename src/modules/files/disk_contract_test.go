//go:build contract

// The contract of disk: one suite of cases, run against FakeDisk and the real
// disk in a folder of the test's own.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package files

import "testing"

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

func TestDiskKeepsItsContract(t *testing.T) {
	t.Run("fake", func(t *testing.T) { diskSuite(t, func(*testing.T) Disk { return NewFakeDisk() }) })
	t.Run("real", func(t *testing.T) { diskSuite(t, func(t *testing.T) Disk { return NewDisk(t.TempDir()) }) })
}
