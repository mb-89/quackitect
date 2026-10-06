// The script guard over planted trees.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports_test

import (
	"slices"
	"testing"

	"quackitect/src/imports"
)

func scriptsOver(texts map[string]string) []string {
	var tracked []string
	for path := range texts {
		tracked = append(tracked, path)
	}
	slices.Sort(tracked)
	return imports.HandScripts(tracked, func(path string) string { return texts[path] })
}

func TestATrackedScriptOutsideTheEngineIsNamed(t *testing.T) {
	t.Parallel()
	said := scriptsOver(map[string]string{
		"prototype/a.py": "print(1)\n",
		"tools/run":      "#!/bin/sh\necho one\n",
		"docs/a.md":      "# a\n",
	})
	if want := []string{"prototype/a.py", "tools/run"}; !slices.Equal(said, want) {
		t.Fatalf("the guard names %q, not %q", said, want)
	}
}

func TestTheEngineAndAMarkedScriptAreSpared(t *testing.T) {
	t.Parallel()
	said := scriptsOver(map[string]string{
		"RUNME.sh":               "#!/bin/sh\n",
		"src/scripts/install.sh": "#!/bin/sh\n",
		".claude/skills/x/y.py":  "print(1)\n",
		"tools/keep.sh":          "#!/bin/sh\n# level0: HandScript - the runner calls it by path\n",
		"tools/plain.sh":         "#!/bin/sh\n",
	})
	if want := []string{"tools/plain.sh"}; !slices.Equal(said, want) {
		t.Fatalf("beside the engine and a marked script the guard names %q", said)
	}
}
