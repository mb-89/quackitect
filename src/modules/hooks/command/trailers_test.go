// The closing trailer paragraph a message carries, read once for both the
// voice and the model door. [[spec/tickets/model-trailer-refuses-in-place]]
package command

import (
	"reflect"
	"testing"
)

// TrailersOf reads the closing paragraph where every line is a trailer, and none elsewhere. [[spec/tickets/model-trailer-refuses-in-place]]
func TestTrailersOfReadsTheClosingParagraphOfTrailers(t *testing.T) {
	for said, want := range map[string][]string{
		"the change\n\nA-B: one\n  Claude-Session: x\n": {"A-B: one", "Claude-Session: x"},
		"the change\n\nthe body":                        nil,
		"Fixes: one line alone":                         nil,
	} {
		if got := TrailersOf(said); !reflect.DeepEqual(got, want) {
			t.Errorf("TrailersOf(%q) reads %q, want %q", said, got, want)
		}
	}
}
