// The retro's JS number reader, case by case: a hex text, a one-letter text
// and an empty one, each read as JS Number reads it.
// [[spec/tickets/js-number-reads-one-letter]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"math"
	"testing"
)

// A one-letter text reads as NaN, as JS reads it, and a hex text and an empty one keep their numbers. [[spec/tickets/js-number-reads-one-letter]]
func TestRetroJSToNumberReadsALetterAsNaN(t *testing.T) {
	t.Parallel()
	for _, letter := range []string{"x", "a", "N"} {
		if got := retroJSToNumber(letter); !math.IsNaN(got) {
			t.Errorf("%q reads as %v, and wants NaN", letter, got)
		}
	}
	for text, want := range map[string]float64{"0x10": 16, "": 0, "7": 7} {
		if got := retroJSToNumber(text); got != want {
			t.Errorf("%q reads as %v, and wants %v", text, got, want)
		}
	}
}
