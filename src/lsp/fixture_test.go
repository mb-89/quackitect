package main

import (
	"os"
	"path/filepath"
	"testing"
)

// a tree written to a temp folder, so every check runs over something a test
// owns whole.
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
	tree := treeAt(root)
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
