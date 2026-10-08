// The note reader, the schema checks and the mint live in Go alone, so no
// schema library of the plugin, nor the front door, nor a test reading either
// stands in the tree.
// [[spec/tickets/schema-libs-leave]]
package main

import (
	// level0: OutsideInDoors - the case reads the tree's own plugin folder, as a build check reads source
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"testing"
)

// [[spec/tickets/schema-libs-leave]]
var schemaLibs = []string{
	".claude/skills/level0/lib/schema*.js", ".claude/skills/level0/lib/ticket.js", ".claude/skills/level0/lib/todo.js",
	".claude/skills/level0/lib/slug.js", ".claude/skills/level0/lib/paths.js", ".claude/skills/level0/lib/vocabulary.js",
	".claude/skills/level0/lib/snippets.js", ".claude/skills/level0/lib/helpers.js", ".claude/skills/level0/lib/refuse.js",
	"src/doors/front.js", "src/doors/fake/front.js",
	"test/contract/front.test.js", "test/contract/ticket.test.js", "test/contract/schema-bless.test.js",
	"test/contract/handover-words.test.js", "test/contract/retro-route.test.js", "test/contract/vocabulary.test.js",
	"test/contract/tree-of.js", "test/level0/todo.test.js", "test/level0/paths.test.js",
	"test/level0/writes-here.test.js", "test/level0/front-writer.test.js",
}

// [[spec/tickets/schema-libs-leave]]
var leavingImport = regexp.MustCompile(`["'][^"']*/(lib/(schema[a-z-]*|ticket|todo|slug|paths|vocabulary|snippets|helpers|refuse)|doors/front|doors/fake/front|tree-of)\.js["']`)

// Every file to search for an import of a leaving one: the tests, the extension, the scripts, the stub and the hooks. [[spec/tickets/schema-libs-leave]]
var schemaReaders = []string{
	"test/*.js", "test/*/*.js", "test/*/*/*.js",
	"src/extension/*.js", "src/extension/*/*.js", "src/extension/*/*/*.js",
	"src/scripts/*.js", "src/stub/RUNME.sh", "src/stub/.claude/skills/level0/hooks/*.js", ".claude/skills/level0/hooks/*.js",
}

// [[spec/tickets/schema-libs-leave]]
func TestTheSchemaLibrariesStandNowhere(t *testing.T) {
	t.Parallel()
	if left := globbedIn(t, schemaLibs...); len(left) > 0 {
		t.Fatalf("the tree holds\n%s\nand wants none of them, since Go owns the note reader, the schema checks and the mint", strings.Join(left, "\n"))
	}
}

// [[spec/tickets/schema-libs-leave]]
func TestNoTestImportsALeavingSchemaFile(t *testing.T) {
	t.Parallel()
	leaving := globbedIn(t, schemaLibs...)
	found := []string{}
	for _, one := range globbedIn(t, schemaReaders...) {
		if slices.Contains(leaving, one) || strings.Contains(one, "node_modules/") {
			continue
		}
		body, err := os.ReadFile(filepath.Join(treeRoot, filepath.FromSlash(one)))
		if err != nil {
			t.Fatal(err)
		}
		for _, said := range leavingImport.FindAllString(string(body), -1) {
			found = append(found, one+" reads "+said)
		}
	}
	if len(found) > 0 {
		t.Fatalf("%s\nand wants no test, extension file, script, stub or hook reading a leaving file", strings.Join(found, "\n"))
	}
}
