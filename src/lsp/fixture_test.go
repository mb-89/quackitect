package main

import (
	"io/fs"
	"os"
	"path/filepath"
	"testing"
)

// The folder a case writes, read straight off the disk. It stands in the cases alone, so the binary reads the tree off the index and nowhere else. [[spec/design_output/lsp#the-server-reads-the-index]]
type realDisk struct{}

func (realDisk) ReadFile(path string) ([]byte, error)       { return os.ReadFile(path) }
func (realDisk) Stat(path string) (fs.FileInfo, error)      { return os.Stat(path) }
func (realDisk) ReadDir(path string) ([]fs.DirEntry, error) { return os.ReadDir(path) }
func (realDisk) WalkDir(root string, fn fs.WalkDirFunc) error {
	return filepath.WalkDir(root, fn)
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func fixture(t *testing.T, files map[string]string) *Tree {
	t.Helper()
	root := t.TempDir()
	for name, text := range files {
		at := filepath.Join(root, filepath.FromSlash(name))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	tree := treeOver(root, realDisk{})
	tree.Words = 5
	return tree
}

func rules(found []Finding) []string {
	out := []string{}
	for _, one := range found {
		out = append(out, one.Rule)
	}
	return out
}

func names(found []Finding, rule string) int {
	count := 0
	for _, one := range found {
		if one.Rule == rule {
			count++
		}
	}
	return count
}

func onlyOne(t *testing.T, found []Finding, rule string) Finding {
	t.Helper()
	if names(found, rule) != 1 {
		t.Fatalf("wanted one %s, and this answers %v", rule, rules(found))
	}
	for _, one := range found {
		if one.Rule == rule {
			return one
		}
	}
	return Finding{}
}
