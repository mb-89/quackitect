// The retro's gap counts: a verb no example shows, and a test beside a verb an
// example shows, each named on a planted tree.
// [[spec/guidance/retro/audit]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"strings"
	"testing"

	"quackitect/src/modules/check"
)

// A tree registering foo and bar, an example showing foo alone, and a test beside each verb file: bar stands unshown, and TestFooLands beside a shown verb. [[spec/guidance/retro/audit]]
func TestRetroGapsNamesEachUnshownVerbAndEachTestBesideAShownOne(t *testing.T) {
	t.Parallel()
	texts := check.Texts{
		"src/quack/foo.go":             "package main\n\nfunc init() { register(\"foo\", nil) }\n",
		"src/quack/foo_test.go":        "package main\n\nfunc TestFooLands(t *testing.T) {}\n",
		"src/quack/bar.go":             "package main\n\nfunc init() { register(\"bar\", nil) }\n",
		"src/quack/bar_test.go":        "package main\n\nfunc TestBarLands(t *testing.T) {}\n",
		"spec/examples/110_foo/foo.md": "---\nkind: [[example]]\ntitle: A foo lands\nkeywords: [\"foo\"]\ninterface: [\"foo\"]\n---\n\nA hand runs foo.\n\n```sh\n./RUNME.sh foo\n# expect: exit 0\n```\n",
	}
	code, out, _ := retroMintHeard(retroGapsVerb(func() *check.Tree { return check.TreeOver("", texts) }), "retro", "gaps")
	for _, part := range []string{"1 feature(s) stand with no example", "./RUNME.sh bar  src/quack/bar.go:3", "1 test(s) stand beside a verb an example shows", "src/quack/foo_test.go TestFooLands"} {
		if code != 0 || !strings.Contains(out, part) || strings.Contains(out, "./RUNME.sh foo ") || strings.Contains(out, "TestBarLands") {
			t.Fatalf("retro gaps answers %d and says no %q, or names foo or TestBarLands:\n%s", code, part, out)
		}
	}
}
