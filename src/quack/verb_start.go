// The start verb: the SessionStart hook input on stdin, answered with a stop
// where a desk session writes and loads no level-zero plugin.
// [[spec/tickets/the-coordinator-runs-under-level0]]
package main

import (
	"encoding/json"
	"io"
	"path/filepath"

	"quackitect/src/modules/hooks"
)

// The manifest the plugin loads through, under the root. [[spec/design_output/level0#the-boot-hook]]
var startManifest = filepath.Join(".claude", "skills", "level0", ".claude-plugin", "plugin.json")

// What the start verb reaches: the root, the hook input, the environment and the disk. [[spec/design_output/doors#one-door-per-outside-thing]]
type startOutside struct {
	root   func() (string, error)
	input  io.Reader
	env    func(string) string
	exists func(path string) bool
}

// The answer a SessionStart hook prints to stop the session. [[spec/tickets/the-coordinator-runs-under-level0]]
type startStop struct {
	Continue   bool   `json:"continue"`
	StopReason string `json:"stopReason"`
}

func init() {
	register("start", func(argv []string, quiet bool, out, errs io.Writer) int {
		return startVerb(startOutsideOf(quietBox()))(argv, quiet, out, errs)
	})
}

// The start verb's outside, off the box: its root, its input, its environment and its disk. [[spec/tickets/quack-reaches-the-box-through-doors]]
func startOutsideOf(box boxDoors) startOutside {
	return startOutside{
		root:   func() (string, error) { return box.root, nil },
		input:  box.input,
		env:    box.env,
		exists: box.disk.stands,
	}
}

// [[spec/tickets/the-coordinator-runs-under-level0]]
func startVerb(outside startOutside) twin {
	return func(_ []string, _ bool, out, _ io.Writer) int {
		var heard struct {
			Mode string `json:"permission_mode"`
		}
		if said, err := io.ReadAll(outside.input); err == nil {
			_ = json.Unmarshal(said, &heard)
		}
		root, err := outside.root()
		if err != nil {
			root = "."
		}
		plugin := outside.exists(filepath.Join(root, startManifest)) && outside.env("CLAUDE_CODE_ENABLE_FUNCTION_HOOKS") != ""
		cloud := outside.env("CLAUDE_CODE_REMOTE") != "" || outside.env("SE_CLOUD") != ""
		reason := hooks.StartRefusal(root, plugin, cloud, heard.Mode)
		if reason == "" {
			return 0
		}
		text, _ := json.Marshal(startStop{Continue: false, StopReason: reason})
		_, _ = out.Write(append(text, '\n'))
		return 0
	}
}
