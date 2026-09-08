package main

import (
	"strings"
	"testing"
)

// A FILE THE HARNESS LOADS IS REFUSED WHEN IT BEGINS WITH A BYTE ORDER MARK.
//
// MEASURED 2026-09-08. A plugin written with Windows PowerShell 5.1's
// Set-Content -Encoding utf8 carried EF BB BF. plugin.json and SKILL.md still
// parsed, so the command appeared in autocomplete. The hooks module never
// loaded: no tool was registered, no line was written, and nothing anywhere
// named a fault. It reads exactly like a feature that is not present.
//
// THE PLANTED MARK IS THE WHOLE TEST. The defect produces no error on any path,
// so the only instrument for it is a check that reads the bytes, and the only
// way to know the check reads them is to plant one.
func TestAHarnessFileCarryingAMarkIsRefused(t *testing.T) {
	t.Parallel()
	f := aTree(t)
	f.write(".claude/settings.json", `{"hooks":{}}`)
	f.write(".claude/plugins/quack/SKILL.md", "# a skill\n")
	f.write(".github/copilot-instructions.md", "# the rules\n")

	if found := LintNoMark(f.Roots); len(found) > 0 {
		t.Fatalf("a tree with no mark answered %d finding(s): %v", len(found), found)
	}

	f.write(".claude/plugins/quack/hooks.mjs", "\ufeffexport function register() {}\n")

	found := LintNoMark(f.Roots)
	if len(found) != 1 {
		t.Fatalf("one planted mark answered %d finding(s): %v", len(found), found)
	}
	if want := ".claude/plugins/quack/hooks.mjs"; found[0].ID != want {
		t.Fatalf("the finding names %q and the mark is on %q", found[0].ID, want)
	}
	// THE REFUSAL IS A MENU AND NOT A DIAGNOSIS. The mark is the default of the
	// shell a fresh Windows box has, so a reader told only that one is there
	// goes and writes the next one the same way.
	for _, want := range []string{"Set-Content", "Out-File", "WriteAllText"} {
		if !strings.Contains(found[0].Says, want) {
			t.Fatalf("the finding does not name %s: %s", want, found[0].Says)
		}
	}
}

// THE FOLDERS ARE WALKED WHOLE, AND THE DECLARED TARGETS ARE READ BESIDE THEM.
//
// .mcp.json sits at the root with no folder above it saying what reads it, so a
// check over the harness folders alone passes the file that carries the tool
// lane. spec/config/projections.json is where this tree says that file is
// loaded, and it is the one place that knows.
func TestTheDeclaredTargetsAreReadForAMark(t *testing.T) {
	t.Parallel()
	f := aTree(t)
	f.writeMethod("spec/config/projections.json", `{
  "projections": [
    {"name": "claude tool lane", "target": ".mcp.json",
     "sources": ["src/cage/mcp.json"], "wrap": "none"}
  ]
}`)
	f.write(".mcp.json", "\ufeff{\"mcpServers\":{}}\n")

	found := LintNoMark(f.Roots)
	if len(found) != 1 {
		t.Fatalf("a mark on a declared target answered %d finding(s): %v", len(found), found)
	}
	if found[0].ID != ".mcp.json" {
		t.Fatalf("the finding names %q and the mark is on .mcp.json", found[0].ID)
	}
}

// THE LINT VERB READS THIS CORPUS, so the battery decides it.
//
// A check the verb does not call is a function with a test and no standing, and
// the token asks for a mark planted under .claude to redden a battery run.
func TestTheLintReadsTheHarnessFiles(t *testing.T) {
	t.Parallel()
	for _, one := range theLints {
		if one.Name == "harness files" {
			return
		}
	}
	t.Fatal("se lint does not read the harness files, so nothing standing reads them")
}
