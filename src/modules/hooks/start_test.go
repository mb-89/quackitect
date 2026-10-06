// The start road over its inputs alone: the folder, the plugin, the box and the mode.
// [[spec/tickets/the-coordinator-runs-under-level0]]
package hooks

import (
	"strings"
	"testing"
)

func TestStartRefusesADeskSessionWritingWithNoPlugin(t *testing.T) {
	t.Parallel()
	const root = "/home/one/tree"
	cases := []struct {
		name    string
		plugin  bool
		cloud   bool
		mode    string
		refuses bool
	}{
		{"a desk session in default mode with no plugin", false, false, "default", true},
		{"a desk session in plan mode with no plugin", false, false, "plan", false},
		{"a desk session where the plugin stands", true, false, "default", false},
		{"a cloud box with no plugin", false, true, "default", false},
		{"a desk session naming no mode with no plugin", false, false, "", true},
	}
	for _, one := range cases {
		got := StartRefusal(root, one.plugin, one.cloud, one.mode)
		if !one.refuses {
			if got != "" {
				t.Errorf("%s: refuses with %q, want a pass", one.name, got)
			}
			continue
		}
		if !strings.Contains(got, root) || !strings.Contains(got, "./RUNME.sh") {
			t.Errorf("%s: answers %q, want a refusal naming %s and ./RUNME.sh", one.name, got, root)
		}
	}
}
