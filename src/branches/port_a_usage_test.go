// The rows the branch verb prints as its usage, as
// test/level0/work-usage.test.js reads them: one verb a row.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"slices"
	"strings"
	"testing"
)

// The first word of every usage row a bare branch call prints. [[spec/tickets/work-verbs-port-to-go]]
func paUsageVerbs(t *testing.T) []string {
	t.Helper()
	one := newTree(t, nil)
	if code := one.branchSays(); code != codeOK {
		t.Fatalf("a bare branch answers %d", code)
	}
	rows := strings.Split(strings.TrimSpace(one.out.String()), "\n")
	var out []string
	for _, row := range rows[1:] {
		if words := strings.Fields(row); len(words) > 0 {
			out = append(out, words[0])
		}
	}
	return out
}

// The usage names no answer verb, because the index answers the tab. [[spec/tickets/work-verbs-port-to-go]]
func TestPAUsageNamesNoAnswerVerb(t *testing.T) {
	if slices.Contains(paUsageVerbs(t), "answer") {
		t.Fatal("the usage names an answer verb")
	}
}

// The usage names the verbs a branch takes, one a row. [[spec/tickets/work-verbs-port-to-go]]
func TestPAUsageNamesTheVerbs(t *testing.T) {
	verbs := paUsageVerbs(t)
	for _, one := range []string{"open", "take", "sync", "done", "list", "merge", "close", "test"} {
		if !slices.Contains(verbs, one) {
			t.Fatalf("%s stands nowhere in the usage %q", one, verbs)
		}
	}
}
