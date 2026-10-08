// The marks a merge leaves, as the edit door reads them.
// [[spec/tickets/edit-door-rules-port]]
package check

import (
	"reflect"
	"testing"
)

// [[spec/tickets/edit-door-rules-port]]
func TestMarkerLinesNameEachMarkOfAMerge(t *testing.T) {
	for _, one := range []struct {
		text string
		want []int
	}{
		{"A title\n=======\n<<<<<<< ours\none\n=======\ntwo\n>>>>>>> theirs\n", []int{3, 5, 7}},
		{"A heading\n=======\n\n>>>>>>> origin/main\n", []int{}},
	} {
		if got := MarkerLines(one.text); !reflect.DeepEqual(got, one.want) {
			t.Errorf("the marks over %q read at %v, and want %v", one.text, got, one.want)
		}
	}
}
