// Places compare segment by segment as numbers, and a place reading as none
// stands past every number.
// [[spec/design_output/pull#the-queue-is-an-outline]]
package ticket

import "testing"

func TestPlacesCompareAsNumbers(t *testing.T) {
	before := [][2]string{{"-2", "1"}, {"1.2", "1.10"}, {"1", "1.1"}, {"3", "∞"}, {"0", "0.1"}}
	for _, pair := range before {
		if ComparePlaces(pair[0], pair[1]) >= 0 || ComparePlaces(pair[1], pair[0]) <= 0 {
			t.Errorf("%s stands before %s", pair[0], pair[1])
		}
	}
	if ComparePlaces("2.1", "2.1") != 0 || ComparePlaces("∞", "∞") != 0 {
		t.Errorf("a place compares even with itself")
	}
}
