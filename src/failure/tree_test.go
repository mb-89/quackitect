// The tree holds the registry: every node names a remedy, and every raised
// id stands as a node. src/quack/refusals_test.go holds the moved files.
// [[spec/design_output/failures#the-check-holds-the-registry]]
package failure // level0: InPackageTest - reaches treeRoot, the in-package root of the tree

import (
	"strings"
	"testing"
)

var scannedFolders = []string{"src", ".claude/skills/level0"}

func scanned(path string) bool {
	if strings.Contains(path, "/node_modules/") || strings.HasSuffix(path, "_test.go") || strings.HasSuffix(path, ".test.js") {
		return false
	}
	return strings.HasSuffix(path, ".go") || strings.HasSuffix(path, ".js")
}

func sources(t *testing.T) map[string]string {
	t.Helper()
	tree := Dir{Root: treeRoot}
	files := map[string]string{}
	for _, folder := range scannedFolders {
		for _, path := range tree.Walk(folder) {
			if !scanned(path) {
				continue
			}
			if text, ok := tree.Read(path); ok {
				files[path] = text
			}
		}
	}
	if len(files) == 0 {
		t.Fatalf("the walk under %v reads no source", scannedFolders)
	}
	return files
}

func TestEveryNodeNamesARemedy(t *testing.T) {
	t.Parallel()
	tree := Dir{Root: treeRoot}
	if len(tree.Walk(Folder)) == 0 {
		t.Fatalf("the walk under %s reads no node", Folder)
	}
	for _, fault := range NodeFaults(tree) {
		t.Error(fault)
	}
}

func TestEveryRaisedIdStandsAsANode(t *testing.T) {
	t.Parallel()
	for _, fault := range RaiseFaults(Load(Dir{Root: treeRoot}), sources(t)) {
		t.Error(fault)
	}
}
