// Each git hook runs se-index.exe where it stands alone, as RUNME.sh does.
// [[spec/tickets/hook-finds-the-exe-binary]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	// level0: OutsideInDoors - the case stands a hook beside a binary in a temp root, the hook's door test
	"os"
	// level0: OutsideInDoors - the case runs the real hook script, the hook's door test
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestGitHooksTakeTheExeWhereItStandsAlone(t *testing.T) {
	t.Parallel()
	for _, name := range []string{"pre-commit", "pre-push"} {
		tree := t.TempDir() // level0: FixtureOutsideHome - each hook stands beside its own stub binary in a root of the case's own
		text, err := os.ReadFile(filepath.Join(treeRoot, ".githooks", name))
		if err != nil {
			t.Fatal(err)
		}
		hook := filepath.Join(tree, ".githooks", name)
		stub := filepath.Join(tree, ".se", ".runtime", "bin", "se-index.exe")
		for path, body := range map[string]string{hook: string(text), stub: "#!/bin/sh\necho exe \"$@\"\n"} {
			if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(path, []byte(body), 0o755); err != nil {
				t.Fatal(err)
			}
		}
		said, err := exec.Command("sh", hook).CombinedOutput() // level0: FixtureOutsideHome - the case runs the real hook script, as git runs it
		line := strings.TrimSpace(string(said))
		if err != nil || !strings.HasPrefix(line, "exe verb ") || !strings.HasSuffix(line, "/src/scripts hook "+name) {
			t.Fatalf(".githooks/%s answers %q, %v, and wants se-index.exe run with hook %s", name, said, err, name)
		}
	}
}
