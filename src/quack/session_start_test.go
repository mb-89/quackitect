// The session start, which install.sh carries as its boot word, so no start
// road runs node over a script of src/scripts. The boot runs the real
// install.sh in a temporary tree, with every want skipped.
// [[spec/tickets/session-start-leaves-node]]
package main

import (
	"context"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
	"time"
)

// Every want install.sh names, so a boot in a test tree fetches and builds nothing. [[spec/tickets/session-start-leaves-node]]
const bootSkipAll = "vale biome vale-ls go go-modules index se-front git-hooks"

// The hook line that runs the boot word of install.sh under the project folder. [[spec/tickets/session-start-leaves-node]]
var bootHookLine = regexp.MustCompile(`^sh "?\S*src/scripts/install\.sh"? boot$`)

// The SessionStart hooks .claude/settings.json carries, each a command and a timeout in seconds. [[spec/tickets/session-start-leaves-node]]
func bootHooks(t *testing.T) []struct {
	Command string  `json:"command"`
	Timeout float64 `json:"timeout"`
} {
	t.Helper()
	body, err := os.ReadFile(filepath.Join(treeRoot, ".claude", "settings.json"))
	if err != nil {
		t.Fatal(err)
	}
	var said struct {
		Hooks struct {
			SessionStart []struct {
				Hooks []struct {
					Command string  `json:"command"`
					Timeout float64 `json:"timeout"`
				} `json:"hooks"`
			} `json:"SessionStart"`
		} `json:"hooks"`
	}
	if err := json.Unmarshal(body, &said); err != nil {
		t.Fatal(err)
	}
	var all []struct {
		Command string  `json:"command"`
		Timeout float64 `json:"timeout"`
	}
	for _, one := range said.Hooks.SessionStart {
		all = append(all, one.Hooks...)
	}
	return all
}

// A fake index: the start verb writes down its input, prints start-says and exits on start-code, and any other call writes down the skip list it meets. [[spec/tickets/the-coordinator-runs-under-level0]]
const bootIndex = `#!/bin/sh
here=$(dirname "$0")
case "$*" in *" start")
  cat > "$here/start-seen"
  [ -f "$here/start-says" ] && cat "$here/start-says"
  exit "$(cat "$here/start-code" 2>/dev/null || echo 0)";;
esac
printf '%s' "${SE_INSTALL_SKIP:-}" > "$here/skip-seen"
`

// A temporary tree holding a copy of install.sh and a fake index that writes down the skip list it meets. [[spec/tickets/session-start-leaves-node]]
func bootTree(t *testing.T) string {
	t.Helper()
	tree := filepath.Join(shortDir(t), "tree")
	body, err := os.ReadFile(filepath.Join(treeRoot, "src", "scripts", "install.sh"))
	if err != nil {
		t.Fatal(err)
	}
	bootWrite(t, filepath.Join(tree, "src", "scripts", "install.sh"), string(body), 0o755)
	bootWrite(t, filepath.Join(tree, ".se", ".runtime", "bin", "se-index"), bootIndex, 0o755)
	return tree
}

// Writes a file and its folders, and stops the test where it fails. [[spec/tickets/session-start-leaves-node]]
func bootWrite(t *testing.T, path, text string, mode os.FileMode) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(text), mode); err != nil {
		t.Fatal(err)
	}
}

// Runs sh install.sh boot in the tree under the env named and no other, and answers its exit code and output. [[spec/tickets/session-start-leaves-node]]
func bootRun(t *testing.T, tree string, env map[string]string) (int, string) {
	t.Helper()
	return bootRunOn(t, tree, env, "")
}

// Runs the boot word as bootRun does, with the hook input on its stdin. [[spec/tickets/the-coordinator-runs-under-level0]]
func bootRunOn(t *testing.T, tree string, env map[string]string, input string) (int, string) {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	run := exec.CommandContext(ctx, "sh", filepath.Join(tree, "src", "scripts", "install.sh"), "boot")
	run.Dir = tree
	run.Stdin = strings.NewReader(input)
	home := filepath.Join(filepath.Dir(tree), "home")
	_ = os.MkdirAll(home, 0o755)
	run.Env = []string{"PATH=" + os.Getenv("PATH"), "HOME=" + home}
	for key, value := range env {
		run.Env = append(run.Env, key+"="+value)
	}
	said, err := run.CombinedOutput()
	if ctx.Err() != nil {
		t.Fatalf("sh install.sh boot outlasts its span: %s", said)
	}
	if exit, ok := err.(*exec.ExitError); ok {
		return exit.ExitCode(), string(said)
	}
	if err != nil {
		t.Fatal(err)
	}
	return 0, string(said)
}

// The skip list the fake index met, and whether the install reached it at all. [[spec/tickets/session-start-leaves-node]]
func bootSaw(tree string) (string, bool) {
	body, err := os.ReadFile(filepath.Join(tree, ".se", ".runtime", "bin", "skip-seen"))
	return string(body), err == nil
}

// Stops the test where install.sh runs the install off a cloud box, since then it reads no boot word and a run on a cloud box proves nothing. [[spec/tickets/session-start-leaves-node]]
func bootWordKnown(t *testing.T) {
	t.Helper()
	tree := bootTree(t)
	code, said := bootRun(t, tree, map[string]string{"SE_INSTALL_SKIP": bootSkipAll})
	if _, ran := bootSaw(tree); ran || code != 0 {
		t.Fatalf("install.sh reads no boot word: off a cloud box it answers %d and runs the install: %s", code, said)
	}
}

func TestNoTrackedFileNamesTheNodeBoot(t *testing.T) {
	t.Parallel()
	named := strings.Join([]string{"src", "scripts", "boot"}, "/")
	listed, err := exec.Command("git", "-C", treeRoot, "ls-files", named+".js").Output()
	if err != nil {
		t.Fatal(err)
	}
	if strings.TrimSpace(string(listed)) != "" {
		t.Errorf("git tracks %s", strings.TrimSpace(string(listed)))
	}
	found, _ := exec.Command("git", "-C", treeRoot, "grep", "-n", "-F", named, "--", ".claude", "src").Output()
	if strings.TrimSpace(string(found)) != "" {
		t.Errorf("tracked lines under .claude and src name %s:\n%s", named, found)
	}
}

func TestTheSessionStartHookRunsTheInstallBootWord(t *testing.T) {
	t.Parallel()
	var commands []string
	for _, one := range bootHooks(t) {
		commands = append(commands, one.Command)
		if bootHookLine.MatchString(one.Command) {
			return
		}
	}
	t.Errorf("no SessionStart hook runs sh over install.sh with the boot word, and these stand: %q", commands)
}

func TestTheBootHookWaitsOutTheStartSpan(t *testing.T) {
	t.Parallel()
	starting := int(startSpan.Milliseconds())
	var spans []int
	for _, one := range bootHooks(t) {
		if bootHookLine.MatchString(one.Command) {
			spans = append(spans, int(one.Timeout*1000))
		}
	}
	if len(spans) == 0 {
		t.Fatal("no SessionStart hook runs the boot word, so none waits out the start span")
	}
	for _, span := range spans {
		if span < starting {
			t.Errorf("the boot hook waits %d ms, and the start road allows %d", span, starting)
		}
	}
}

func TestTheBootRunsNoInstallWhereTheManifestStands(t *testing.T) {
	t.Parallel()
	tree := bootTree(t)
	bootWrite(t, filepath.Join(tree, ".claude", "skills", "level0", ".claude-plugin", "plugin.json"), "{}", 0o644)
	code, said := bootRun(t, tree, map[string]string{"CLAUDE_CODE_REMOTE": "true", "SE_INSTALL_SKIP": bootSkipAll})
	if _, ran := bootSaw(tree); ran || code != 0 {
		t.Errorf("on a cloud box the manifest stands on, the boot answers %d and runs the install %v: %s", code, ran, said)
	}
}

func TestTheBootRunsNoInstallOffACloudBox(t *testing.T) {
	t.Parallel()
	tree := bootTree(t)
	code, said := bootRun(t, tree, map[string]string{"SE_INSTALL_SKIP": bootSkipAll})
	if _, ran := bootSaw(tree); ran || code != 0 {
		t.Errorf("off a cloud box, the boot answers %d and runs the install %v: %s", code, ran, said)
	}
}

// [[spec/tickets/the-coordinator-runs-under-level0]]
func TestTheBootHandsADesksHookInputToTheStartVerbAndPrintsItsStop(t *testing.T) {
	t.Parallel()
	const input, stop = `{"permission_mode":"default"}`, `{"continue":false,"stopReason":"open it in the repo folder"}` + "\n"
	tree := bootTree(t)
	bin := filepath.Join(tree, ".se", ".runtime", "bin")
	bootWrite(t, filepath.Join(bin, "start-says"), stop, 0o644)
	code, said := bootRunOn(t, tree, nil, input)
	seen, _ := os.ReadFile(filepath.Join(bin, "start-seen"))
	if code != 0 || said != stop || string(seen) != input {
		t.Errorf("at a desk, the boot answers %d and prints %q, and the start verb meets %q; wants 0, %q and %q", code, said, seen, stop, input)
	}
}

// [[spec/tickets/the-coordinator-runs-under-level0]]
func TestTheBootStartsADeskSessionWhereTheStartVerbFailsOrAnswersNothing(t *testing.T) {
	t.Parallel()
	for _, one := range []struct{ says, code string }{{"stop\n", "2"}, {"", "0"}} {
		tree := bootTree(t)
		bin := filepath.Join(tree, ".se", ".runtime", "bin")
		bootWrite(t, filepath.Join(bin, "start-says"), one.says, 0o644)
		bootWrite(t, filepath.Join(bin, "start-code"), one.code, 0o644)
		if code, said := bootRunOn(t, tree, nil, "{}"); code != 0 || said != "" {
			t.Errorf("at a desk, a start verb exiting %s on %q leaves the boot answering %d and printing %q; wants 0 and nothing", one.code, one.says, code, said)
		}
	}
}

func TestTheBootRunsTheInstallOnACloudBoxLackingTheManifest(t *testing.T) {
	t.Parallel()
	bootWordKnown(t)
	tree := bootTree(t)
	code, said := bootRun(t, tree, map[string]string{"CLAUDE_CODE_REMOTE": "true", "SE_INSTALL_SKIP": bootSkipAll})
	if _, ran := bootSaw(tree); !ran || code != 0 {
		t.Errorf("on a cloud box lacking the manifest, the boot answers %d and runs the install %v: %s", code, ran, said)
	}
}

func TestTheBootRunsTheInstallOnABoxSECloudMarks(t *testing.T) {
	t.Parallel()
	bootWordKnown(t)
	tree := bootTree(t)
	code, said := bootRun(t, tree, map[string]string{"SE_CLOUD": "1", "SE_INSTALL_SKIP": bootSkipAll})
	if _, ran := bootSaw(tree); !ran || code != 0 {
		t.Errorf("on a box SE_CLOUD marks, the boot answers %d and runs the install %v: %s", code, ran, said)
	}
}

func TestTheBootAnswersZeroWhereTheInstallFails(t *testing.T) {
	t.Parallel()
	tree := bootTree(t)
	// A file standing where the runtime folder goes fails the install before it fetches anything.
	if err := os.RemoveAll(filepath.Join(tree, ".se")); err != nil {
		t.Fatal(err)
	}
	bootWrite(t, filepath.Join(tree, ".se"), "no folder", 0o644)
	code, said := bootRun(t, tree, map[string]string{"CLAUDE_CODE_REMOTE": "true", "SE_INSTALL_SKIP": bootSkipAll})
	if code != 0 {
		t.Errorf("where the install fails, the boot answers %d: %s", code, said)
	}
}

func TestTheBootSkipsWhatTheColdProbeSkips(t *testing.T) {
	t.Parallel()
	tree := bootTree(t)
	code, said := bootRun(t, tree, map[string]string{"CLAUDE_CODE_REMOTE": "true", "SE_INSTALL_SKIP": bootSkipAll})
	seen, ran := bootSaw(tree)
	if !ran || code != 0 {
		t.Fatalf("on a cloud box lacking the manifest, the boot answers %d and runs the install %v: %s", code, ran, said)
	}
	words := " " + seen + " "
	for _, one := range strings.Fields(installSkip + " " + bootSkipAll) {
		if !strings.Contains(words, " "+one+" ") {
			t.Errorf("the install the boot runs skips %q, and lacks %s of %q", seen, one, installSkip+" "+bootSkipAll)
		}
	}
}

func TestTheBootReadsTheManifestTheBrandWrites(t *testing.T) {
	t.Parallel()
	tree := bootTree(t)
	wrote, err := stamps(tree, "tree")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(strings.Join(wrote, " "), pluginTarget) {
		t.Fatalf("the brand writes %q, and no %s", wrote, pluginTarget)
	}
	code, said := bootRun(t, tree, map[string]string{"CLAUDE_CODE_REMOTE": "true", "SE_INSTALL_SKIP": bootSkipAll})
	if _, ran := bootSaw(tree); ran || code != 0 {
		t.Errorf("where the brand wrote %s, the boot answers %d and runs the install %v: %s", pluginTarget, code, ran, said)
	}
}
