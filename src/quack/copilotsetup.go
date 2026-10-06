// The Copilot registrations level zero writes, and the setup writing them
// where a box runs Copilot, a file a person owns standing untouched.
// [[spec/design_output/copilot#setup-and-discovery]]
package main

import (
	"encoding/json"
	"errors"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"time"
)

// The mark a registration carries, the entry its hooks run, their bound, the span a list ask takes, and the file marking a cloud box. [[spec/design_output/copilot#setup-and-discovery]]
const (
	copilotOwner       = "quackitect-level0"
	copilotRunner      = "node src/scripts/copilot.js"
	copilotHookSeconds = "60"
	copilotListWait    = 5 * time.Second
	copilotCloudMark   = runFolder + "/copilot-cloud"
)

// One file the setup writes, and the text it holds. [[spec/design_output/copilot#setup-and-discovery]]
type copilotFile struct {
	name, content string
}

var copilotOnList = regexp.MustCompile(`(?i)github\.copilot`)

// The files the setup writes, in the order it writes them. [[spec/design_output/copilot#setup-and-discovery]]
func copilotRegistrations() []copilotFile {
	hooks := orderedFrom()
	for _, one := range [][2]string{
		{"sessionStart", "SessionStart"},
		{"preToolUse", "PreToolUse"},
		{"postToolUse", "PostToolUse"},
		{"agentStop", "Stop"},
	} {
		hooks.set(one[0], []any{orderedFrom(
			"type", "command",
			"command", copilotRunner+" hook "+one[1],
			"timeout", json.Number(copilotHookSeconds),
			"timeoutSec", json.Number(copilotHookSeconds),
		)})
	}
	registration := orderedFrom("version", json.Number("1"), "$owner", copilotOwner, "hooks", hooks)
	return []copilotFile{
		{".github/hooks/level0.json", orderedText(registration) + "\n"},
		{".github/workflows/copilot-setup-steps.yml", strings.Join([]string{
			"# " + copilotOwner,
			"name: Copilot setup",
			"on: workflow_dispatch",
			"jobs:",
			"  copilot-setup-steps:",
			"    runs-on: ubuntu-latest",
			"    permissions:",
			"      contents: read",
			"    steps:",
			"      - uses: actions/checkout@v4",
			"      - uses: actions/setup-node@v4",
			"        with:",
			`          node-version: "22"`,
			"      - name: Install level zero",
			"        run: sh src/scripts/install.sh",
			"      - name: Prepare cloud hooks",
			"        run: " + copilotRunner + " setup cloud",
			"",
		}, "\n")},
	}
}

// Whether this box runs Copilot's cloud agent: the mark a cloud setup leaves, or the two variables the agent sets. [[spec/design_output/copilot#setup-and-discovery]]
func copilotCloud(d boxDoors) bool {
	return stands(filepath.Join(d.root, filepath.FromSlash(copilotCloudMark))) ||
		(d.env("GITHUB_COPILOT_GIT_TOKEN") != "" && d.env("COPILOT_AGENT_PROMPT") != "")
}

// Whether this box runs Copilot: the cloud, the editor's terminal, a registration standing, or an editor listing the extension. [[spec/design_output/copilot#setup-and-discovery]]
func copilotDetected(d boxDoors) bool {
	if copilotCloud(d) || d.env("TERM_PROGRAM") == "vscode" ||
		stands(filepath.Join(d.root, ".github", "hooks", "level0.json")) {
		return true
	}
	for _, editor := range []string{"code", "code-insiders"} {
		argv := []string{editor, "--list-extensions"}
		if d.windows() {
			argv = append([]string{"cmd", "/c"}, argv...)
		}
		if ran := d.run(argv, runOpts{cwd: d.root, timeout: copilotListWait}); copilotOnList.MatchString(ran.stdout) {
			return true
		}
	}
	return false
}

// The modes a made folder and a written registration take. [[spec/design_output/copilot#setup-and-discovery]]
const (
	copilotFolderMode = 0o755
	copilotFileMode   = 0o644
)

// Writes the registrations a target asks, auto where Copilot runs here, and answers the files it writes. A file lacking the mark refuses the whole write. [[spec/design_output/copilot#setup-and-discovery]]
func copilotSetup(d boxDoors, target string) ([]string, error) {
	if !slices.Contains([]string{"auto", "vscode", "cloud"}, target) {
		return nil, errors.New("Use setup auto, vscode, or cloud.")
	}
	if target == "auto" && !copilotDetected(d) {
		return nil, nil
	}
	var pending []copilotFile
	for _, one := range copilotRegistrations() {
		if body, err := d.disk.read(filepath.Join(d.root, filepath.FromSlash(one.name))); err == nil {
			previous := string(body)
			if previous == one.content {
				continue
			}
			if !strings.Contains(previous, copilotOwner) {
				return nil, errors.New("Keep " + one.name + ": it belongs to you. Merge the generated registration manually.")
			}
		}
		pending = append(pending, one)
	}
	var written []string
	for _, one := range pending {
		at := filepath.Join(d.root, filepath.FromSlash(one.name))
		if err := d.disk.makeAll(filepath.Dir(at), copilotFolderMode); err != nil {
			return written, err
		}
		if err := d.disk.write(at, []byte(one.content), copilotFileMode); err != nil {
			return written, err
		}
		written = append(written, one.name)
	}
	if target == "cloud" {
		at := filepath.Join(d.root, filepath.FromSlash(copilotCloudMark))
		if err := d.disk.makeAll(filepath.Dir(at), copilotFolderMode); err != nil {
			return written, err
		}
		if err := d.disk.write(at, []byte("cloud\n"), copilotFileMode); err != nil {
			return written, err
		}
	}
	return written, nil
}
