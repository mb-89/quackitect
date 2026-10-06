// The door the lsp IO module's tools run through: a binary on the box, the
// tool survey, and the code ceilings off the config layers.
// [[spec/tickets/lsp-module-draws-the-tools]]
package lsp

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"quackitect/src/config"
)

// The longest a tool runs before the module gives up on it. [[spec/design_output/lsp#the-server-runs-the-tools]]
const toolWait = 3 * time.Minute

// The tools the box names in its survey, else the runtime binary folder, each read again before a whole run. [[spec/design_output/lsp#the-server-runs-the-tools]]
func ToolsAt(root string, rules Check) *Tools {
	runs, halt := runsUntilHalt()
	one := &Tools{Root: root, Run: runs, Halt: halt, Again: reads, Check: rules}
	reads(one)
	return one
}

// A runner whose runs the halt ends, so a stopped index leaves no tool running past it. [[spec/tickets/the-index-stops-its-tools]]
func runsUntilHalt() (Runner, func()) {
	life, halt := context.WithCancel(context.Background())
	return func(dir, input, name string, argv ...string) (string, error) {
		return runsIn(life, dir, input, name, argv...)
	}, halt
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

// One run of a binary in the folder, its input on standard in, and its output back, up to the wait. [[spec/design_output/lsp#the-server-runs-the-tools]]
func runsIn(life context.Context, dir, input, name string, argv ...string) (string, error) {
	ctx, cancel := context.WithTimeout(life, toolWait)
	defer cancel()
	one := exec.CommandContext(ctx, name, argv...)
	one.Dir = dir
	if input != "" {
		one.Stdin = strings.NewReader(input)
	}
	var out, errs bytes.Buffer
	one.Stdout, one.Stderr = &out, &errs
	err := one.Run()
	if err != nil && out.Len() == 0 {
		return "", fmt.Errorf("%v: %s", err, strings.TrimSpace(errs.String()))
	}
	return out.String(), nil
}

func standsAt(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}
