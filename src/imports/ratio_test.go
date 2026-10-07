// The ratio guard over planted trees.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports_test

import (
	"slices"
	"testing"

	"quackitect/src/imports"
)

func ratioOver(texts map[string]string) []string {
	var tracked []string
	for path := range texts {
		tracked = append(tracked, path)
	}
	slices.Sort(tracked)
	return imports.RatioOffenders(tracked, func(path string) string { return texts[path] })
}

func TestAModulePastOneToOneIsNamedWithBothCounts(t *testing.T) {
	t.Parallel()
	said := ratioOver(map[string]string{
		"a/a.go":      "package a\n\nfunc A() {}\n",
		"a/a_test.go": "package a_test\n\nfunc one() {}\nfunc two() {}\n",
		"b/b.go":      "package b\nfunc B() {}\nfunc C() {}\n",
		"b/b_test.go": "package b_test\n",
	})
	if want := []string{"go a\t3 test lines, 2 code lines"}; !slices.Equal(said, want) {
		t.Fatalf("the guard names %q, not %q", said, want)
	}
}

func TestABlankLineCountsNowhere(t *testing.T) {
	t.Parallel()
	said := ratioOver(map[string]string{
		"c/c.go":      "package c\n",
		"c/c_test.go": "package c_test\n\n\n   \n",
	})
	if len(said) != 0 {
		t.Fatalf("one test line against one code line answers %q", said)
	}
}

func TestAJavaScriptTestBelongsToTheFolderItImports(t *testing.T) {
	t.Parallel()
	said := ratioOver(map[string]string{
		"src/doors/git.js":          "export const git = {};\nexport const two = 2;\n",
		"test/contract/git.test.js": "import test from \"node:test\";\nimport { git } from \"../../src/doors/git.js\";\ntest(\"one\", () => git);\n",
		"test/level0/x.test.js":     "import test from \"node:test\";\n",
	})
	want := []string{"js src/doors\t3 test lines, 2 code lines", "js test/level0\t1 test lines, 0 code lines"}
	if !slices.Equal(said, want) {
		t.Fatalf("the guard names %q, not %q", said, want)
	}
}
