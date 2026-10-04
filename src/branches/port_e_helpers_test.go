// The fixtures the port_e cases share: a marked group, a closed one, a tree
// ready to merge, a refusing origin, and the reads on origin a case asserts.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The group carrying the cloud marker. [[spec/tickets/work-verbs-port-to-go]]
var peMarked = withField(groupNote, cloudMark, "true")

// The marked group standing done. [[spec/tickets/work-verbs-port-to-go]]
var peMarkedDone = withField(peMarked, "state", closedState)

// The bare group standing done. [[spec/tickets/work-verbs-port-to-go]]
var peDone = withField(groupNote, "state", closedState)

// The cloud routine's branch the merge cases take in. [[spec/tickets/work-verbs-port-to-go]]
const peClaude = "claude/a-thing"

// A desk tree whose main carries the files and an empty install, the check green, and work/g pushed where branch files stand. [[spec/tickets/work-verbs-port-to-go]]
func peMergeTree(t *testing.T, trunkFiles, branchFiles map[string]string) *tree {
	t.Helper()
	if trunkFiles == nil {
		trunkFiles = map[string]string{}
	}
	if _, ok := trunkFiles["src/scripts/install.sh"]; !ok {
		trunkFiles["src/scripts/install.sh"] = ""
	}
	one := newTree(t, trunkFiles).desk()
	one.d.Runme = []string{"true"}
	if branchFiles != nil {
		one.branch("g", branchFiles)
	}
	return one
}

// Pushes a claude branch off main carrying the files, and comes back to main. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) peClaudeBranch(files map[string]string) {
	one.t.Helper()
	one.git("switch", "-q", "-c", peClaude, "main")
	one.land(peClaude+" lands", files)
	one.git("push", "-q", "origin", peClaude)
	one.git("switch", "-q", "main")
	one.git("branch", "-q", "-D", peClaude)
	one.git("fetch", "-q", "origin")
}

// Lands files on main and pushes them. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) peTrunkMoves(files map[string]string) {
	one.t.Helper()
	one.land("main moves", files)
	one.git("push", "-q", "origin", "main")
}

// Writes a pre-receive hook into origin, refusing a push where the shell case reads true. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) peOriginRefuses(test string) {
	one.t.Helper()
	script := "#!/bin/sh\nwhile read old new ref; do\n  if " + test + "; then echo refused >&2; exit 1; fi\ndone\nexit 0\n"
	at := filepath.Join(one.from, "hooks", "pre-receive")
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		one.t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(script), 0o755); err != nil {
		one.t.Fatal(err)
	}
}

// The tip origin holds for a branch, or nothing. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) peOriginTip(branch string) string {
	one.t.Helper()
	said := one.git("ls-remote", "origin", "refs/heads/"+branch)
	if said == "" {
		return ""
	}
	return strings.Fields(said)[0]
}

// A file as origin's branch carries it, read straight off the bare repository. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) peOriginFile(branch, rel string) string {
	one.t.Helper()
	said := one.d.run(one.from, nil, "", "git", "show", branch+":"+rel)
	return said.Out
}
