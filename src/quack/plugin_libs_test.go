// The plugin library holds the lint group's Vale library alone, so every
// rule with logic runs in Go and changes in one language.
// [[spec/tickets/plugin-libs-leave]]
package main

import (
	"path/filepath"
	"strings"
	"testing"
)

func TestThePluginLibrariesHoldTheValeLibraryAlone(t *testing.T) {
	t.Parallel()
	found, err := filepath.Glob(filepath.Join(treeRoot, ".claude", "skills", "level0", "lib", "*.js"))
	if err != nil {
		t.Fatal(err)
	}
	left := []string{}
	for _, one := range found {
		if filepath.Base(one) != "vale.js" {
			rel, _ := filepath.Rel(treeRoot, one)
			left = append(left, filepath.ToSlash(rel))
		}
	}
	if len(left) > 0 {
		t.Fatalf("the plugin library holds\n%s\nand wants vale.js alone, since each rule with logic runs in Go", strings.Join(left, "\n"))
	}
}
