// The door the lsp IO module's tools run through: a binary on the box, the
// tool survey, and the code ceilings off the config layers.
// [[spec/tickets/lsp-module-draws-the-tools]]
package lsp

import (
	"encoding/json"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"quackitect/src/config"
	"quackitect/src/proc"
)

// The longest a tool runs before the module gives up on it. [[spec/design_output/lsp#the-server-runs-the-tools]]
const toolWait = 3 * time.Minute

// The tools the box names in its survey, else the runtime binary folder, each read again before a whole run. [[spec/design_output/lsp#the-server-runs-the-tools]]
func ToolsAt(root string, rules Check) *Tools {
	runs, halt := proc.Halting()
	one := &Tools{Root: root, Run: runs, Halt: halt, Again: reads, Check: rules}
	reads(one)
	return one
}

// [[spec/design_output/lsp#the-server-runs-the-tools]]
func reads(one *Tools) {
	known := toolsIn(filepath.Join(one.Root, filepath.FromSlash(one.Check.Survey)))
	bin := filepath.Join(one.Root, filepath.FromSlash(one.Check.Bin))
	one.Biome = toolAt(bin, known, "biome")
	one.Function = config.Count(one.Root, "code.functionLines")
	one.File = config.Count(one.Root, "code.fileLines")
}

// Each tool's path the survey names. [[spec/design_output/tools#what-the-survey-writes]]
func toolsIn(survey string) map[string]string {
	out := map[string]string{}
	body, err := os.ReadFile(survey)
	if err != nil {
		return out
	}
	var said map[string]struct {
		Path string `json:"path"`
	}
	if json.Unmarshal(body, &said) != nil {
		return out
	}
	for name, one := range said {
		out[name] = one.Path
	}
	return out
}

// The path the survey names where a file stands there, else the one in the runtime binary folder, else nothing. [[spec/design_output/lsp#the-server-runs-the-tools]]
func toolAt(bin string, known map[string]string, name string) string {
	if said := known[name]; said != "" && standsAt(said) {
		return said
	}
	guess := filepath.Join(bin, name)
	if runtime.GOOS == "windows" {
		guess += ".exe"
	}
	if standsAt(guess) {
		return guess
	}
	return ""
}

func standsAt(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}
