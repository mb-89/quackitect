package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A CHECK THAT CANNOT READ WHAT IT GUARDS SAYS SO.
//
// Both linters returned nothing when the declaration was missing or would not
// parse, so se lint answered clean precisely when the file it guards was
// broken. That is the moment it was most worth hearing from.
//
// The rule is in doc/guidance/behaviour.md and in all three projections: a
// check that finds nothing to check refuses.
func TestALinterThatCannotReadTheDeclarationRefuses(t *testing.T) {
	for _, how := range []struct {
		name  string
		write func(path string)
	}{
		{"missing", func(path string) { os.Remove(path) }},
		{"unparseable", func(path string) {
			os.WriteFile(path, []byte("{ this is not json }"), 0o644)
		}},
	} {
		t.Run(how.name, func(t *testing.T) {
			r := guidanceTree(t)
			how.write(filepath.Join(r.Method, "util", "parameters.json"))

			for what, found := range map[string][]Finding3{
				"LintLimits": LintLimits(r),
				"LintIcons":  LintIcons(r),
			} {
				if len(found) == 0 {
					t.Errorf("%s answered clean with a %s declaration", what, how.name)
					continue
				}
				if !strings.Contains(found[0].Says, "cannot be read") {
					t.Errorf("%s does not say it could not read it: %q", what, found[0].Says)
				}
			}
		})
	}
}

// And with a declaration it can read, it says nothing about reading it.
func TestALinterThatCanReadSaysNothingAboutIt(t *testing.T) {
	r := guidanceTree(t)
	for what, found := range map[string][]Finding3{
		"LintLimits": LintLimits(r),
		"LintIcons":  LintIcons(r),
	} {
		for _, f := range found {
			if strings.Contains(f.Says, "cannot be read") {
				t.Errorf("%s says it cannot read a file that is there: %q", what, f.Says)
			}
		}
	}
}
