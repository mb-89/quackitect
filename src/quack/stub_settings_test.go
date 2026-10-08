// The stub enables the plugin through the vehicle verb, so it runs no Node,
// and the JavaScript library the shim read leaves with its test.
// [[spec/tickets/stub-settings-shim-runs-in-go]]
package main

import (
	"io/fs"
	// level0: OutsideInDoors - the case reads the tree's own stub settings, as a build check reads source
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestTheStubRunsNoNodeAndTheVehicleLibraryStandsNowhere(t *testing.T) {
	t.Parallel()
	root := filepath.Join("..", "..")
	for _, gone := range []string{".claude/skills/level0/lib/vehicle.js", "test/level0/vehicle.test.js"} {
		found, err := filepath.Glob(filepath.Join(root, filepath.FromSlash(gone)))
		if err != nil {
			t.Fatal(err)
		}
		if len(found) > 0 {
			t.Errorf("%s stands, where the Go verb owns the settings shim", gone)
		}
	}
	stub := filepath.Join(root, "src", "stub")
	err := filepath.WalkDir(stub, func(path string, entry fs.DirEntry, err error) error {
		if err != nil || entry.IsDir() {
			return err
		}
		text, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		if strings.Contains(string(text), "node -e") {
			named, err := filepath.Rel(root, path)
			if err != nil {
				return err
			}
			t.Errorf("%s runs node -e, where the stub calls vehicle enable", filepath.ToSlash(named))
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}
