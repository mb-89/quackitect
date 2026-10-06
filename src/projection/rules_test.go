// The table rule keys each run of words its layer names once, so its cost
// grows with the words a file holds, and Vale's cap on a script holds on a
// loaded box.
// [[spec/tickets/the-parts-start-at-once]]
package projection

import (
	"strings"
	"testing"
)

func TestRestatedTableKeysEachRun(t *testing.T) {
	t.Parallel()
	layer := newObject()
	layer.Set("table", 4.0)
	said := restatedTable(layer)
	for _, want := range []string{"runs(wordsOf(one), 4)", "runs(wordsOf(row.said), 4)", "if shared[key] {"} {
		if !strings.Contains(said, want) {
			t.Errorf("the rule lacks %q:\n%s", want, said)
		}
	}
	if strings.Contains(said, "for j := 0") {
		t.Errorf("the rule still searches every pair of words:\n%s", said)
	}
}
