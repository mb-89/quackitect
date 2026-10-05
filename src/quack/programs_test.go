// The usage door answers help and an empty line with the usage, refuses a
// word Go registers nowhere, and help prints the usage off the one table.
// [[spec/tickets/program-of-drops-node]]
package main

import (
	"strings"
	"testing"

	verbsmodule "quackitect/src/modules/verbs"
)

func TestHelpAndNoWordAnswerTheUsageAndZero(t *testing.T) {
	for _, argv := range [][]string{{"help"}, {}, {"--quiet"}, {"--quiet", "help"}} {
		var out, errs strings.Builder
		if code := usageDoor(argv, &errs)(&out); code != 0 || out.String() != usageText() || errs.Len() != 0 {
			t.Fatalf("%v answers %d, %q, %q", argv, code, out.String(), errs.String())
		}
	}
}

func TestAWordNothingRegistersAnswersTheUsageAndRefuses(t *testing.T) {
	var out, errs strings.Builder
	code := usageDoor([]string{"--quiet", "unclaimed", "spec"}, &errs)(&out)
	if code != exitUsage || out.String() != usageText() || errs.String() != "se: there is no verb called unclaimed\n\n" {
		t.Fatalf("the door answers %d, %q, %q", code, out.String(), errs.String())
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
