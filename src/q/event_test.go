// The hand line the pull writes and the spawn answer reads.
// [[spec/tickets/hand-spawn-skips-session-tag]]
package q_test

import (
	"strings"
	"testing"

	"quackitect/src/q"
)

// The line ends on a word, so the pull joins the hand's name after a comma. [[spec/tickets/hand-spawn-skips-session-tag]]
func TestTheHandLineTakesANameAfterIt(t *testing.T) {
	t.Parallel()
	if strings.TrimRight(q.HandOfItsOwn, " ,.") != q.HandOfItsOwn || !strings.HasPrefix(q.HandOfItsOwn, "You are a hand") {
		t.Fatalf("the hand line reads %q", q.HandOfItsOwn)
	}
}
