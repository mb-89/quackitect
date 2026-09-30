// The door the lsp IO module's tools run through: a binary on the box, the
// tool survey, and the code ceilings off the config layers.
// [[spec/tickets/lsp-module-draws-the-tools]]
package lsp

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"quackitect/src/config"
	"quackitect/src/modules/check"
)

// The longest a tool runs before the module gives up on it, and the Vale config the assembly writes where the root holds none. [[spec/design_output/lsp#the-server-runs-the-tools]]
const (
	toolWait  = 3 * time.Minute
	valeBuilt = ".se/vale/.vale.ini"
	tenseAt   = "src/engine/tense.js"
)

// The tools the box names in its survey, else the runtime binary folder, each read again before a whole run. [[spec/design_output/lsp#the-server-runs-the-tools]]
func ToolsAt(root string) *Tools {
	one := &Tools{Root: root, Run: runsIn, Again: reads}
	reads(one)
	return one
}

// [[spec/design_output/lsp#the-server-runs-the-tools]]
func reads(one *Tools) {
	known := toolsIn(one.Root)
	one.Vale = toolAt(one.Root, known, "vale")
	one.Biome = toolAt(one.Root, known, "biome")
	one.Node = toolAt(one.Root, known, "node")
	if one.Node == "" {
		one.Node = "node"
	}
	one.Config = check.ValeIni
	if !standsAt(filepath.Join(one.Root, check.ValeIni)) && standsAt(filepath.Join(one.Root, filepath.FromSlash(valeBuilt))) {
		one.Config = valeBuilt
	}
	one.Tense = ""
	if module := filepath.Join(one.Root, filepath.FromSlash(tenseAt)); standsAt(module) {
		at := filepath.ToSlash(module)
		if !strings.HasPrefix(at, "/") {
			at = "/" + at
		}
		one.Tense = "file://" + (&url.URL{Path: at}).EscapedPath()
	}
	one.Function = config.Count(one.Root, "code.functionLines")
	one.File = config.Count(one.Root, "code.fileLines")
}

// Each tool's path the survey names. [[spec/design_output/tools#what-the-survey-writes]]
func toolsIn(root string) map[string]string {
	out := map[string]string{}
	body, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(check.ToolsAt)))
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
func toolAt(root string, known map[string]string, name string) string {
	if said := known[name]; said != "" && standsAt(said) {
		return said
	}
	guess := filepath.Join(root, filepath.FromSlash(check.Bin), name)
	if runtime.GOOS == "windows" {
		guess += ".exe"
	}
	if standsAt(guess) {
		return guess
	}
	return ""
}

// One run of a binary in the folder, its input on standard in, and its output back, up to the wait. [[spec/design_output/lsp#the-server-runs-the-tools]]
func runsIn(dir, input, name string, argv ...string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), toolWait)
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
