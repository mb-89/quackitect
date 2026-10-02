// The door's calls answer a method nobody registers with its name.
// [[spec/design_output/index#the-door-owns-the-database]]
package index

import (
	"strings"
	"testing"
)

func TestAnUnknownMethodAnswersItsName(t *testing.T) {
	_, err := (&door{}).answers(call{Method: "nothing-here"})
	if err == nil || !strings.Contains(err.Error(), "nothing-here") {
		t.Fatalf("an unknown method answers %v, and names no nothing-here", err)
	}
}
