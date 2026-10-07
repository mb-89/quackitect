// The check hands node the browser the box holds, so the drawing's page test
// reads one path and Go owns the order that finds it.
// [[spec/tickets/scripts-folder-leaves]] [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
package main

import (
	"slices"
	"strings"
	"testing"
)

func TestTheTestRunHandsNodeTheBrowserTheBoxHolds(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		name, browser, want string
	}{
		{"a browser the box holds rides every run", "/b/chrome", "PLAYWRIGHT_CHROMIUM=/b/chrome"},
		{"no browser names no variable", "", ""},
	} {
		fake := &checkFake{}
		doors := fake.doors()
		doors.root = t.TempDir()
		doors.browser = one.browser
		testsRun(doors, true)
		if len(fake.envs) != len(testParts) {
			t.Fatalf("%s: the run started %v", one.name, fake.runs)
		}
		for _, env := range fake.envs {
			named := slices.ContainsFunc(env, func(v string) bool { return strings.HasPrefix(v, "PLAYWRIGHT_CHROMIUM=") })
			if (one.want == "" && named) || (one.want != "" && !slices.Contains(env, one.want)) {
				t.Errorf("%s: node runs under %v, and wants %q", one.name, env, one.want)
			}
		}
	}
}
