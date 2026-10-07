// quack serve: the index behind the bridgehead. It runs the index standing,
// which starts its door where none answers, so the verb returns and the door
// stays.
// [[spec/design_output/level0#a-desk-serve-returns]]
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"slices"
	"strconv"
	"strings"

	"quackitect/src/index"
	"quackitect/src/modules/hooks"
	"quackitect/src/proc"
)

// The index binary under the root, as BIN in .claude/skills/level0/lib/index.js names it. [[spec/design_output/level0#a-desk-serve-returns]]
const serveIndexBin = ".se/.runtime/bin/se-index" // the runtime folder .claude/skills/level0/lib/folders.js owns

// What the serve verb reaches: the root, a run that answers the exit code and the error stream, the environment, the binary running the verb, and the index the standing runs, the root's own where none is named. [[spec/design_output/level0#a-desk-serve-returns]]
type serveDoors struct {
	root  string
	run   func(argv []string, cwd string) (int, string, error)
	disk  diskDoors
	env   func(string) string
	self  string
	index string
}

// The flag the bridgehead runs the verb under, and the variables that mark a cloud box, the pair the cloud guidance binds on. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
const serveBridge = "--bridge"

var serveCloudVars = []string{"CLAUDE_CODE_REMOTE", "SE_CLOUD"}

// The row the bridgehead hands the log: a level, the words, the event the road runs under, and what the index said. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
type bridgeRow struct {
	Level  string `json:"level"`
	Said   string `json:"said"`
	Event  string `json:"event"`
	Detail string `json:"detail"`
}

func init() { register("serve", serveVerb(serveReal)) }

// The serve verb over its doors: one line on the output, and 1 where the index falls. Dry runs no index, and reads the door as it stands. [[spec/design_output/level0#a-desk-serve-returns]]
func serveVerb(doors func() serveDoors) twin {
	return func(argv []string, dry bool, out, _ io.Writer) int {
		d := doors()
		if dry {
			d.run = func([]string, string) (int, string, error) { return 0, "", nil }
		}
		if slices.Contains(argv, serveBridge) {
			return serveBridges(d, out)
		}
		code, said := serveDetachedStart(d)
		fmt.Fprintln(out, said)
		return code
	}
}

// The start road the bridgehead runs where no door answers: nothing off a cloud box, because a person starts the index there, and else the binary running this verb stands in the work root, and one row says how it went. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func serveBridges(d serveDoors, out io.Writer) int {
	if !serveOnCloud(d.env) {
		return 0
	}
	if d.self != "" {
		d.index = d.self
	}
	code, said := serveDetachedStart(d)
	row := bridgeRow{Level: "info", Said: "no index answered, so the bridgehead starts one", Event: "session.start", Detail: said}
	if code != 0 {
		row.Level, row.Said = "warn", "the index fails its standing, so no door stands"
	}
	text, err := json.Marshal(row)
	if err != nil {
		return exitFailed
	}
	fmt.Fprintln(out, string(text))
	return code
}

// Whether a cloud variable stands, so nobody is there to press the sidebar button. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func serveOnCloud(env func(string) string) bool {
	if env == nil {
		return false
	}
	for _, name := range serveCloudVars {
		if env(name) != "" {
			return true
		}
	}
	return false
}

// The index answers its standing by starting its door where none answers, so one run starts it and probes it. [[spec/design_output/level0#a-desk-serve-returns]]
func serveDetachedStart(d serveDoors) (int, string) {
	was := serveDoorOf(d.disk, d.root)
	bin := d.index
	if bin == "" {
		bin = d.root + "/" + serveIndexBin
	}
	code, stderr, err := d.run([]string{bin, "standing"}, d.root)
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
	door := serveDoorOf(d.disk, d.root)
	port := servePortOf(door)
	if was != "" && was == door {
		return 0, fmt.Sprintf("The index answers at port %s.", port)
	}
	return 0, fmt.Sprintf("The index starts at port %s, because no door stood.", port)
}

// What the hooks door's standing file says, or nothing where none stands. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func serveDoorOf(disk diskDoors, root string) string {
	return disk.text(filepath.Join(root, filepath.FromSlash(hooks.StandingFile)))
}

// The port the door names, as Number(JSON.parse(door).port) || 0 prints it. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func servePortOf(door string) string {
	var said struct {
		Port any `json:"port"`
	}
	if json.Unmarshal([]byte(door), &said) != nil {
		return "0"
	}
	var number float64
	switch port := said.Port.(type) {
	case float64:
		number = port
	case bool:
		if port {
			number = 1
		}
	case string:
		if parsed, err := strconv.ParseFloat(strings.TrimSpace(port), numberBits); err == nil {
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
	box := quietBox()
	self, err := selfPath()
	if err != nil {
		self = ""
	}
	return serveDoors{root: filepath.ToSlash(root), run: serveRuns, disk: box.disk, env: box.env, self: self}
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
