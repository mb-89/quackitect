// The notice form every informational line naming a place prints in.
// [[spec/tickets/check-lines-read-as-notices]]
package check_test

import (
	"testing"

	"quackitect/src/modules/check"
)

// GitHub keeps ten error annotations a step, so a notice spends none, and a refusal's line still reads as one. [[spec/tickets/check-lines-read-as-notices]]
func TestANoticeReadsAsNoErrorToSetupGosMatcher(t *testing.T) {
	if line := check.NoticeLine("src/quack/push.go", 17, 1, "ExampleCovers: ./RUNME.sh push stands in no example's interface."); check.ErrorMatcher.MatchString(line) {
		t.Errorf("setup-go's matcher reads the notice %q as an error", line)
	}
	if line := "src/quack/push.go:17:1: FileCeiling: the file holds too many lines"; !check.ErrorMatcher.MatchString(line) {
		t.Errorf("setup-go's matcher passes over the refusal %q, and the pattern drifts from setup-go's", line)
	}
}
