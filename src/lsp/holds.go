// The paths a tree holds, where its disk names no tracked list: a walk over the
// folder a case writes. The binary's tree takes git's list off the index.
// [[spec/design_output/tree#the-tree-handed-in]]
package main

import (
	"io/fs"
	"path/filepath"
	"sort"
)

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
