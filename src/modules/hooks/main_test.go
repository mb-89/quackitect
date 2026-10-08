// The fixture home of the hooks tests: the tree each case's door reads, built
// fresh for each case, which writes into its own root.
// [[spec/guidance/code/testing]]
package hooks // level0: InPackageTest - every case file of the package reads treeOf, and the doors it roots reach unexported fields

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// A tree holding the table's files, and the plan naming the case's todo where it names one. [[spec/tickets/cage-command-rules-port]]
func treeOf(t *testing.T, files map[string]string, todo string) string {
	t.Helper()
	root := t.TempDir()
	if todo != "" {
		plan, _ := json.Marshal(map[string]string{"working": todo})
		files = with(files, ".se/.runtime/plan.json", string(plan))
	}
	for path, text := range files {
		at := filepath.Join(root, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return root
}
