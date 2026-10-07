// The lsp module spells its door file again, because a Go module imports no
// package of the rule owning the runtime names, so the name meets those names here.
// [[spec/tickets/the-lsp-server-leaves]]
package main

import (
	"path"
	"slices"
	"testing"

	"quackitect/src/modules/check"
	"quackitect/src/modules/lsp"
)

func TestTheLspDoorFileStandsAmongTheRuntimeNames(t *testing.T) {
	t.Parallel()
	if got, want := path.Dir(lsp.StandingFile), path.Dir(check.ToolsAt); got != want {
		t.Fatalf("%s stands under %s, and wants the runtime folder %s", lsp.StandingFile, got, want)
	}
	if name := path.Base(lsp.StandingFile); !slices.Contains(check.Moved, name) {
		t.Fatalf("check.Moved reads %q, and wants %s among the runtime names", check.Moved, name)
	}
}
