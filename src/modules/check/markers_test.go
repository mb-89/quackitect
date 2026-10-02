// The marks a merge leaves, as the edit door reads them.
// [[spec/tickets/edit-door-rules-port]]
package check

import (
	"reflect"
	"testing"
)

// [[spec/tickets/edit-door-rules-port]]
func TestMarkerLinesNameEachMarkOfAMerge(t *testing.T) {
	text := "A title\n=======\n<<<<<<< ours\none\n=======\ntwo\n>>>>>>> theirs\n"
	if got := MarkerLines(text); !reflect.DeepEqual(got, []int{3, 5, 7}) {
		t.Errorf("the marks read at %v, and want 3, 5 and 7 past the underline", got)
	}
}
