// quack serve: the index behind the bridgehead. It runs the index standing,
// which starts its door where none answers, so the verb returns and the door
// stays. Ported from detachedStart in src/scripts/serve.js.
// [[spec/design_output/level0#a-desk-serve-returns]]
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"quackitect/src/index"
	"quackitect/src/modules/hooks"
	"quackitect/src/proc"
)

// The index binary under the root, as indexBinary in src/index/binary.go builds it. [[spec/design_output/level0#a-desk-serve-returns]]
const serveIndexBin = ".se/.runtime/bin/se-index" // the runtime folder src/modules/check/folders.go owns

// What the serve verb reaches: the root, and a run that answers the exit code and the error stream. [[spec/design_output/level0#a-desk-serve-returns]]
type serveDoors struct {
	root string
	run  func(argv []string, cwd string) (int, string, error)
}

func init() { register("serve", serveVerb(serveReal)) }

// The serve verb over its doors: one line on the output, and 1 where the index falls. Dry runs no index, and reads the door as it stands. [[spec/design_output/level0#a-desk-serve-returns]]
func serveVerb(doors func() serveDoors) twin {
	return func(_ []string, dry bool, out, _ io.Writer) int {
		d := doors()
		if dry {
			d.run = func([]string, string) (int, string, error) { return 0, "", nil }
		}
		code, said := serveDetachedStart(d)
		fmt.Fprintln(out, said)
		return code
	}
}

// The index answers its standing by starting its door where none answers, so one run starts it and probes it. [[spec/design_output/level0#a-desk-serve-returns]]
func serveDetachedStart(d serveDoors) (int, string) {
	was := serveDoorOf(d.root)
	code, stderr, err := d.run([]string{d.root + "/" + serveIndexBin, "standing"}, d.root)
	if err != nil {
		return 1, "The index falls: " + err.Error()
	}
	if code != 0 {
		why := strings.TrimSpace(stderr)
		if why == "" {
			why = fmt.Sprintf("it exits %d", code)
		}
		return 1, "The index falls: " + why
	}
	door := serveDoorOf(d.root)
	port := servePortOf(door)
	if was != "" && was == door {
		return 0, fmt.Sprintf("The index answers at port %s.", port)
	}
	return 0, fmt.Sprintf("The index starts at port %s, because no door stood.", port)
}

// What the hooks door's standing file says, or nothing where none stands. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func serveDoorOf(root string) string {
	body, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(hooks.StandingFile)))
	if err != nil {
		return ""
	}
	return string(body)
}

// The port the door names, as Number(JSON.parse(door).port) || 0 prints it. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func servePortOf(door string) string {
	var said struct {
		Port any `json:"port"`
	}
	if json.Unmarshal([]byte(door), &said) != nil {
		return "0"
	}
	number := 0.0
	switch port := said.Port.(type) {
	case float64:
		number = port
	case bool:
		if port {
			number = 1
		}
	case string:
		if parsed, err := strconv.ParseFloat(strings.TrimSpace(port), 64); err == nil {
			number = parsed
		}
	}
	if number != number {
		return "0"
	}
	return tuiJSNumber(number)
}

// The real doors: the tree's root, and a run that captures the error stream. [[spec/design_output/level0#a-desk-serve-returns]]
func serveReal() serveDoors {
	root, err := index.Root()
	if err != nil {
		root = "."
	}
	return serveDoors{root: filepath.ToSlash(root), run: serveRuns}
}

// Runs a program in a folder over the real process door. [[spec/design_output/level0#a-desk-serve-returns]]
func serveRuns(argv []string, cwd string) (int, string, error) {
	return serveRunsOver(proc.Real)(argv, cwd)
}

// Runs a program in a folder through the process door, its output read by nothing, and answers its exit code and what it wrote to its error stream. A signal's end reads as 1, as the JavaScript door answers it. [[spec/tickets/quack-spawns-all-take-the-runner]]
func serveRunsOver(run proc.Runner) func(argv []string, cwd string) (int, string, error) {
	return func(argv []string, cwd string) (int, string, error) {
		var stderr strings.Builder
		said := run(proc.Command{Argv: argv, Dir: cwd, Streams: &proc.Streams{Err: &stderr}})
		switch said.Code {
		case proc.Signalled:
			return 1, stderr.String(), nil
		case proc.NotStarted:
			return 0, stderr.String(), errors.New(said.Err)
		}
		return said.Code, stderr.String(), nil
	}
}
