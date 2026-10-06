// The check refuses a function body that stands in another package, renamed
// or not, and passes a short body and a test file.
// [[spec/tickets/shared-helpers-stand-once]]
package check

import (
	"strings"
	"testing"
)

// The rule the check draws on a body standing in another package. [[spec/tickets/shared-helpers-stand-once]]
const copyRule = "HelperStandsOnce"

// A body long enough to share, under the names the case hands it. [[spec/tickets/shared-helpers-stand-once]]
func counting(pkg, name, items, word string) string {
	return strings.NewReplacer("PKG", pkg, "NAME", name, "ITEMS", items, "WORD", word).Replace(`package PKG

func NAME(ITEMS []string, WORD string) int {
	count := 0
	seen := map[string]bool{}
	for _, item := range ITEMS {
		if seen[item] {
			continue
		}
		seen[item] = true
		if item == WORD {
			count++
		}
	}
	return count
}
`)
}

// The same body in a second package draws the rule on the later path. [[spec/tickets/shared-helpers-stand-once]]
func TestTheCheckRefusesABodyStandingInAnotherPackage(t *testing.T) {
	files := map[string]string{"src/a/a.go": counting("a", "tally", "items", "word"), "src/b/b.go": counting("b", "tally", "items", "word")}
	if found := sweepOver(t, files, nil); !holdsRule(found, copyRule, "src/b/b.go") {
		t.Fatalf("the sweep answers %+v, and wants %s on src/b/b.go", found, copyRule)
	}
}

// A copy whose function, parameters and locals carry other names still reads as the same body. [[spec/tickets/shared-helpers-stand-once]]
func TestABodyRenamedOnlyStillReadsAsACopy(t *testing.T) {
	files := map[string]string{"src/a/a.go": counting("a", "tally", "items", "word"), "src/b/b.go": counting("b", "countOf", "rows", "wanted")}
	if found := sweepOver(t, files, nil); !holdsRule(found, copyRule, "src/b/b.go") {
		t.Fatalf("the sweep answers %+v, and wants %s on src/b/b.go", found, copyRule)
	}
}

// A one-line body, and a copy in a test file, draw nothing. [[spec/tickets/shared-helpers-stand-once]]
func TestAShortBodyAndATestFilePass(t *testing.T) {
	short := "package PKG\n\nfunc name(said string) string {\n\treturn said\n}\n"
	files := map[string]string{
		"src/a/a.go":      strings.ReplaceAll(short, "PKG", "a"),
		"src/b/b.go":      strings.ReplaceAll(short, "PKG", "b"),
		"src/c/c.go":      counting("c", "tally", "items", "word"),
		"src/d/d_test.go": counting("d", "tally", "items", "word"),
	}
	for _, one := range sweepOver(t, files, nil) {
		if one.Rule == copyRule {
			t.Fatalf("the sweep answers %+v on a short body or a test file", one)
		}
	}
}

// Two types' methods sharing a body answer for their own receivers, and draw nothing. [[spec/tickets/shared-helpers-stand-once]]
func TestMethodsSharingABodyPass(t *testing.T) {
	method := func(pkg string) string {
		return strings.Replace(counting(pkg, "tally", "items", "word"), "func tally(", "func (one box) tally(", 1) + "\ntype box struct{}\n"
	}
	for _, one := range sweepOver(t, map[string]string{"src/a/a.go": method("a"), "src/b/b.go": method("b")}, nil) {
		if one.Rule == copyRule {
			t.Fatalf("the sweep answers %+v on two types' methods", one)
		}
	}
}
