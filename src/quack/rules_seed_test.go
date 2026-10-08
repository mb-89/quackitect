// Seeds into a test root every file the Go rules load off this tree, so a
// case runs the real rules over its own root.
// [[spec/tickets/go-rules-replace-vale]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"testing"

	"quackitect/src/rules"
)

// Copies each file rules.Load asks for off the tree into the root. [[spec/tickets/go-rules-replace-vale]]
func seedsRules(t *testing.T, root string) {
	t.Helper()
	texts := map[string]string{}
	if _, err := rules.Load(func(path string) string {
		text, _ := realDisk().read(filepath.Join("..", "..", filepath.FromSlash(path)))
		texts[path] = string(text)
		return string(text)
	}); err != nil {
		t.Fatal(err)
	}
	for path, text := range texts {
		seedsFile(t, root, path, text)
	}
}

// level0: FixtureOutsideHome - the case seeds the rules into a root of its own
func TestSeededRulesAnswerAsTheTreeDoes(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedsRules(t, root)
	set, err := rulesAt(root)
	if err != nil {
		t.Fatal(err)
	}
	found := set.Lint(".se/tickets/a-name.md", "# Ask\n\none; two\n")
	if len(found) == 0 || found[0].Check != "VoiceParagraph.Characters" {
		t.Errorf("the seeded rules answer %+v", found)
	}
}
