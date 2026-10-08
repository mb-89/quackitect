// The fixture home of the pull cases: the method roots on this box a case
// hands the hand to read its identity off.
// [[spec/guidance/code/testing]]
package pull // level0: InPackageTest - the case files beside it stand in the package and share its helpers

import (
	"os" // level0: OutsideInDoors - the home seeds a method root of its own on disk, as the hand reads it
	"path/filepath"
	"testing"
)

// A method root on this box holding the identity. [[spec/tickets/pull-scripts-leave]]
func methodHolding(t *testing.T, id string) string {
	t.Helper()
	root := t.TempDir()
	at := filepath.Join(root, filepath.FromSlash(identity))
	must(t, os.MkdirAll(filepath.Dir(at), 0o755))
	must(t, os.WriteFile(at, []byte(`{"id":"`+id+`"}`), 0o644))
	return root
}

// A method root on this box holding nothing. [[spec/tickets/pull-scripts-leave]]
func bareMethod(t *testing.T) string {
	t.Helper()
	return t.TempDir()
}
