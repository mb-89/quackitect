// The x-under glob holds a field to its chapters, whether the path reads from
// the tree root or whole, as the write door holds it.
// [[spec/design_output/examples#the-places]]
package check

import "testing"

func TestAnUnderGlobMatchesATailOfThePath(t *testing.T) {
	t.Parallel()
	glob := "spec/examples/9*_dev_*/**"
	for path, want := range map[string]bool{
		"spec/examples/910_dev_check/empty.md":           true,
		"/srv/tree/spec/examples/910_dev_check/empty.md": true,
		"spec/examples/110_check/runs.md":                false,
		"/srv/tree/spec/examples/110_check/runs.md":      false,
	} {
		if got := underGlob(glob, path); got != want {
			t.Fatalf("%s reads under the glob %v, and wants %v", path, got, want)
		}
	}
}
