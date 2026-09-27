// A dump lands where no projection reads it back.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package main

import (
	"path"
	"strings"
	"testing"
)

func TestADumpIsReadByNothing(t *testing.T) {
	at := dumpPath("tickets/")
	if !strings.HasPrefix(at, ".se/dump/") {
		t.Fatalf("the dump of tickets/ lands at %q", at)
	}
	for _, one := range projections() {
		if matched, _ := path.Match(one.glob, at); matched {
			t.Fatalf("the projection over %s reads the dump back", one.glob)
		}
	}
}
