// The stub enables the plugin through the vehicle verb, so it runs no Node,
// and the JavaScript library the shim read leaves with its test.
// [[spec/tickets/stub-settings-shim-runs-in-go]]
package main

import (
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
	shim, err := os.ReadFile(filepath.Join(root, "src", "stub", "RUNME.sh"))
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(shim), "node -e") {
		t.Error("src/stub/RUNME.sh runs node -e, where the stub calls vehicle enable")
	}
}
