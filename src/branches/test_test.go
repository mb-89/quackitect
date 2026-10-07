// The test verb: the package a changed Go test names.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"slices"
	"testing"
)

// A changed Go test names its package folder, and a named folder names itself. [[spec/tickets/go-code-shares-one-module]]
func TestAChangedGoTestNamesItsPackage(t *testing.T) {
	t.Parallel()
	got := goPackagesOf([]string{"src/a/b_test.go", "src/c/", "src/d.go", "test/e_test.go"})
	if !slices.Equal(got, []string{"src/a", "src/c"}) {
		t.Fatalf("the packages read %v", got)
	}
}
