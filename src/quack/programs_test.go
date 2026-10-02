// A verb with no twin runs its program under the scripts folder, and help
// prints the usage off the one table.
// [[spec/tickets/cli-js-leaves]]
package main

import (
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	verbsmodule "quackitect/src/modules/verbs"
)

func TestAVerbWithNoTwinRunsItsProgram(t *testing.T) {
	scripts := filepath.Join("tree", "src", "scripts")
	got := programOf(scripts, []string{"lint", "spec"})
	want := []string{"node", filepath.Join(scripts, "verbs", "lint.js"), "spec"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("the program reads %v, and wants %v", got, want)
	}
}

func TestHelpPrintsTheUsageOffCommands(t *testing.T) {
	said := usageText()
	if len(verbsmodule.Commands) == 0 || !strings.HasPrefix(said, "Usage: ./RUNME.sh <verb>") {
		t.Fatalf("the usage reads %q", said)
	}
	for _, one := range verbsmodule.Commands {
		if !strings.Contains(said, one.Name) || !strings.Contains(said, one.Doc) {
			t.Fatalf("the usage names no %s with its doc", one.Name)
		}
	}
}
