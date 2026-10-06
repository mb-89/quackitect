// The spawns the landing and ticket verbs reach past git: the verb road, claude
// on the PATH, and the branch take, each waiting on the process door's
// follow-up. [[spec/tickets/quack-spawns-meet-fake-process]]
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"quackitect/src/modules/check"
	"quackitect/src/pull"
)

// A verb through the road this binary answers, its two streams as one text. [[spec/tickets/landing-verbs-port-to-go]]
func roadVerb(root string) func(words ...string) (int, string) {
	return func(words ...string) (int, string) {
		self, err := os.Executable()
		if err != nil {
			return exitFailed, err.Error()
		}
		run := exec.Command(self, append([]string{"verb", filepath.Join(root, "src", "scripts")}, words...)...)
		run.Dir = root
		said, err := run.CombinedOutput()
		if err != nil {
			var exited *exec.ExitError
			if errors.As(err, &exited) {
				return exited.ExitCode(), strings.TrimSpace(string(said))
			}
			return exitFailed, strings.TrimSpace(string(said) + "\n" + err.Error())
		}
		return 0, strings.TrimSpace(string(said))
	}
}

// The claude the survey names where it stands, else the one on the PATH, else nothing. [[spec/design_output/tools#where-a-caller-looks]]
func claudeAt(root string) string {
	var survey map[string]struct {
		Path string `json:"path"`
	}
	if text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(check.ToolsAt))); err == nil && json.Unmarshal(text, &survey) == nil {
		if said := survey["claude"].Path; said != "" && standsUnder("", said) {
			return said
		}
	}
	found, _ := exec.LookPath("claude")
	return found
}

// The branch take a cloud box runs on trunk, through the verb road, so the branch verbs answer it wherever they stand, and the index it serves. [[spec/design_output/pull#the-engine-takes-the-branch]]
func takesBranch(scripts, group string, it *pull.It) int {
	self, err := os.Executable()
	if err != nil {
		fmt.Fprintln(it.Err, err)
		return exitFailed
	}
	args := []string{"verb", scripts, "branch", "take"}
	if group != "" {
		args = append(args, group)
	}
	run := exec.Command(self, args...)
	run.Dir, run.Stdout, run.Stderr = it.Root, it.Out, it.Err
	code := 0
	if err := run.Run(); err != nil {
		code = exitFailed
		if exit, ok := err.(*exec.ExitError); ok {
			code = exit.ExitCode()
		}
	}
	if code != 0 || !it.Cloud {
		return code
	}
	fmt.Fprintln(it.Out, servesHere(it.Root))
	return code
}
