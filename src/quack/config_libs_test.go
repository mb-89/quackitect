// The config layers live in Go alone under src/q and src/modules/config, so no
// config library of the plugin stands, nor a test holding one.
// [[spec/tickets/config-libs-leave]]
package main

import (
	"strings"
	"testing"
)

// The libraries the done_when line names, and the tests reading nothing past them. [[spec/tickets/config-libs-leave]]
var configLibs = []string{
	".claude/skills/level0/lib/config.js", ".claude/skills/level0/lib/layer.js",
	"test/level0/config.test.js", "test/level0/layer.test.js",
}

func TestTheConfigLibrariesStandNowhere(t *testing.T) {
	t.Parallel()
	if left := globbedIn(t, configLibs...); len(left) > 0 {
		t.Fatalf("the tree holds\n%s\nand wants no config library, since src/modules/config answers every key alone", strings.Join(left, "\n"))
	}
}
