// Every guard stands in the guidance an agent reads before it writes code or
// a test, and in the checklist every retro audits.
// [[spec/tickets/code-and-test-rules-stand-in-guidance]]
package imports_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/imports"
)

func treeText(t *testing.T, paths ...string) string {
	t.Helper()
	var out strings.Builder
	for _, one := range paths {
		read, err := os.ReadFile(filepath.Join("..", "..", one))
		if err != nil {
			t.Fatal(err)
		}
		out.Write(read)
	}
	return out.String()
}

func TestEveryGuardStandsInTheCodeGuidance(t *testing.T) {
	t.Parallel()
	guidance := treeText(t, "spec/guidance/code/code.md", "spec/guidance/code/testing.md")
	for _, one := range imports.Guards {
		if !strings.Contains(guidance, "`"+one.Name+"` guard") {
			t.Errorf("the code guidance names no `%s` guard", one.Name)
		}
	}
}

func TestEveryGuardStandsInTheAudit(t *testing.T) {
	t.Parallel()
	retro := treeText(t, "spec/processes/retro.yaml")
	at := strings.Index(retro, "- name: audit\n")
	if at < 0 {
		t.Fatal("the retro process holds no audit step")
	}
	audit := retro[at:]
	if end := strings.Index(audit, "evidence:"); end > 0 {
		audit = audit[:end]
	}
	for _, link := range []string{"[[spec/guidance/retro/audit]]", "[[spec/guidance/code/code]]", "[[spec/guidance/code/testing]]"} {
		if !strings.Contains(audit, link) {
			t.Errorf("the audit checklist links no %s", link)
		}
	}
	if !strings.Contains(treeText(t, "spec/guidance/retro/audit.md"), "./RUNME.sh guards") {
		t.Error("the audit guidance names no guards verb")
	}
}
