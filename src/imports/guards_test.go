// The guards' compare against a baseline, and the blackbox guard among them.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports_test

import (
	"slices"
	"testing"

	"quackitect/src/imports"
)

func TestACompareNamesNewOffendersAndStaleLines(t *testing.T) {
	t.Parallel()
	said := imports.Compare([]string{"b", "a"}, []string{"c", "b"})
	if !slices.Equal(said.New, []string{"c"}) || !slices.Equal(said.Stale, []string{"a"}) {
		t.Fatalf("the compare answers new %v and stale %v, not [c] and [a]", said.New, said.Stale)
	}
}

func TestACompareKeysOnTheTextBeforeATab(t *testing.T) {
	t.Parallel()
	said := imports.Compare([]string{"go a"}, []string{"go a\t3 test lines", "go b\t4 test lines"})
	if !slices.Equal(said.New, []string{"go b\t4 test lines"}) || len(said.Stale) != 0 {
		t.Fatalf("the compare answers new %q and stale %q", said.New, said.Stale)
	}
}

func TestTheGuardsListEveryGuardTheModelNames(t *testing.T) {
	t.Parallel()
	names := []string{}
	for _, one := range imports.Guards {
		names = append(names, one.Name)
	}
	if want := []string{"blackbox", "fixture", "ratio", "script"}; !slices.Equal(names, want) {
		t.Fatalf("the guards read %v, not %v", names, want)
	}
}

func TestTheBlackboxGuardNamesTrackedInPackageTests(t *testing.T) {
	t.Parallel()
	texts := map[string]string{"x/x_test.go": "package x\n", "y/y_test.go": "package y_test\n", "x/x.go": "package x\n"}
	read := func(path string) string { return texts[path] }
	for _, one := range imports.Guards {
		if one.Name != "blackbox" {
			continue
		}
		if said := one.Names([]string{"x/x.go", "x/x_test.go", "y/y_test.go"}, read); !slices.Equal(said, []string{"x/x_test.go"}) {
			t.Fatalf("the blackbox guard names %v over the tracked files", said)
		}
		if one.PackageOf == nil || one.PackageOf("x/y/y_test.go") != "x/y" {
			t.Fatal("the blackbox guard counts an offender by no folder")
		}
		if imports.BaselineOf(one.Name) != "src/imports/baseline/blackbox.txt" {
			t.Fatalf("the blackbox baseline stands at %q", imports.BaselineOf(one.Name))
		}
		return
	}
	t.Fatal("no guard named blackbox stands")
}
