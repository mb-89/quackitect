// The unreached scan the accept reads: a group adding a package nothing
// imports stands with something to fix, and the review names each file.
// [[spec/tickets/accept-runs-the-orphan-scan]]
package branches

import (
	"strings"
	"testing"
)

// A tree whose work/g adds a package nothing imports, with its external test, a package a new main imports, and that main. [[spec/tickets/accept-runs-the-orphan-scan]]
func unreachedTree(t *testing.T) *tree {
	t.Helper()
	one := newTree(t, map[string]string{"go.mod": "module unreachedscan\n\ngo 1.24\n"})
	one.branch("g", map[string]string{
		ticketAt("g"):           groupNote,
		"src/lone/lone.go":      "package lone\n\n// Lone answers nothing.\nfunc Lone() {}\n",
		"src/lone/lone_test.go": "package lone_test\n\nimport (\n\t\"testing\"\n\n\t\"unreachedscan/src/lone\"\n)\n\nfunc TestLone(t *testing.T) { lone.Lone() }\n",
		"src/used/used.go":      "package used\n\n// Used answers nothing.\nfunc Used() {}\n",
		"src/cmd/main.go":       "package main\n\nimport \"unreachedscan/src/used\"\n\nfunc main() { used.Used() }\n",
	})
	return one
}

// The accept's review names every file of a package nothing past its folder imports, counts it a fix, and leaves the reached ones out. [[spec/tickets/accept-runs-the-orphan-scan]]
func TestTheReviewNamesAPackageNothingImports(t *testing.T) {
	t.Parallel()
	one := unreachedTree(t)
	if code := one.branchSays("review", "g"); code != codeOK {
		t.Fatalf("the review answers %d: %s", code, one.errs.String())
	}
	said := one.out.String()
	holds(t, said, "unreached  src/lone/lone.go\n           src/lone/lone_test.go")
	for _, reached := range []string{"src/used/used.go", "src/cmd/main.go"} {
		if strings.Contains(said, reached) {
			t.Fatalf("the review names %s, which a main reaches:\n%s", reached, said)
		}
	}
}
