// The paths a tree holds: git's list where a repository stands, and a walk over
// the disk where none does.
// [[spec/design_output/tree#the-tree-handed-in]]
package main

import (
	"quackitect/yaml"

	"io/fs"
	"path/filepath"
	"sort"
	"strings"
)

// [[spec/design_output/tree#the-tree-handed-in]]
func gitHolds(root string) []string {
	read, err := gitFiles(root)
	if err != nil {
		return nil
	}
	out := []string{}
	for _, line := range yaml.SplitLines(string(read)) {
		path := strings.TrimSpace(line)
		if path != "" && !isDraft(path) {
			out = append(out, path)
		}
	}
	return out
}

// [[spec/design_output/tree#the-tree-handed-in]]
func diskHolds(disk Disk, root string) []string {
	out := []string{}
	disk.WalkDir(root, func(where string, entry fs.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		name := entry.Name()
		if entry.IsDir() {
			if where != root && (name == ".git" || name == ".se" || name == "node_modules") {
				return filepath.SkipDir
			}
			return nil
		}
		said, err := filepath.Rel(root, where)
		if err != nil || isDraft(said) {
			return nil
		}
		out = append(out, slashed(said))
		return nil
	})
	sort.Strings(out)
	return out
}
