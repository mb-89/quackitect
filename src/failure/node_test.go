// The node reader names each field whose shape a node misses, which the
// schema leaves unread.
// [[spec/tickets/failure-watch-shape]]
package failure

import (
	"reflect"
	"testing"
)

func TestNodeOfNamesEachMisshapenField(t *testing.T) {
	t.Parallel()
	cases := map[string]struct {
		front string
		want  []string
	}{
		"a whole node":          {"remedies:\n  - Run it.\nwatch:\n  event: tool\n  quiet: 30\n", []string{}},
		"a quiet span in words": {"remedies:\n  - Run it.\nwatch:\n  event: tool\n  quiet: thirty\n", []string{"n names a quiet span that reads as no count of minutes"}},
		"a remedy as a map":     {"remedies:\n  - run: it\n", []string{"n names a remedy that reads as no line of text", "n names no remedy"}},
		"a watch as a line":     {"remedies:\n  - Run it.\nwatch: tool\n", []string{"n names a watch that reads as no map"}},
		"a watch with no event": {"remedies:\n  - Run it.\nwatch:\n  match: x\n", []string{"n names a watch with no event"}},
		"a field a watch lacks": {"remedies:\n  - Run it.\nwatch:\n  event: tool\n  every: 5\n", []string{"n names a watch field every, and a watch takes event, match and quiet"}},
		"no remedy at all":      {"level: error\n", []string{"n names no remedy"}},
	}
	for name, one := range cases {
		_, got := NodeOf("n", "---\nkind: [[failure]]\nlevel: error\n"+one.front+"---\n\n# When\n\nIt fails.\n")
		if !reflect.DeepEqual(got, one.want) {
			t.Errorf("%s: NodeOf names %q, want %q", name, got, one.want)
		}
	}
}
