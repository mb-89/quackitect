// The retro's gap counts: a verb no example shows, and a test beside a verb an
// example shows, each named on a planted tree.
// [[spec/guidance/retro/audit]]
package main

import (
	"strings"
	"testing"

	"quackitect/src/modules/check"
)

// A tree registering foo and bar, an example showing foo alone, and a test beside each verb file. [[spec/guidance/retro/audit]]
func retroGapsTree() func() *check.Tree {
	texts := check.Texts{
		"src/quack/foo.go":             "package main\n\nfunc init() { register(\"foo\", nil) }\n",
		"src/quack/foo_test.go":        "package main\n\nfunc TestFooLands(t *testing.T) {}\n",
		"src/quack/bar.go":             "package main\n\nfunc init() { register(\"bar\", nil) }\n",
		"src/quack/bar_test.go":        "package main\n\nfunc TestBarLands(t *testing.T) {}\n",
		"spec/examples/110_foo/foo.md": "---\nkind: [[example]]\ntitle: A foo lands\nkeywords: [\"foo\"]\ninterface: [\"foo\"]\n---\n\nA hand runs foo.\n\n```sh\n./RUNME.sh foo\n# expect: exit 0\n```\n",
	}
	return func() *check.Tree { return check.TreeOver("", texts) }
}

func TestRetroGapsNamesEachVerbNoExampleShows(t *testing.T) {
	t.Parallel()
	code, out, _ := retroMintHeard(retroGapsVerb(retroGapsTree()), "retro", "gaps")
	if code != 0 || !strings.Contains(out, "1 feature(s) stand with no example") || !strings.Contains(out, "./RUNME.sh bar  src/quack/bar.go:3") || strings.Contains(out, "./RUNME.sh foo ") {
		t.Fatalf("retro gaps answers %d and says:\n%s", code, out)
	}
}

func TestRetroGapsNamesEachTestBesideAShownVerb(t *testing.T) {
	t.Parallel()
	code, out, _ := retroMintHeard(retroGapsVerb(retroGapsTree()), "retro", "gaps")
	if code != 0 || !strings.Contains(out, "1 test(s) stand beside a verb an example shows") || !strings.Contains(out, "src/quack/foo_test.go TestFooLands") || strings.Contains(out, "TestBarLands") {
		t.Fatalf("retro gaps answers %d and says:\n%s", code, out)
	}
}
