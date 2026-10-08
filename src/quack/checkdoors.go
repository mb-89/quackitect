// The real doors the check and the test verb run on: a process under the
// root, a verb through quack's own road, the health call, the config, git,
// the session log and the red list off the tickets.
// [[spec/design_output/work#the-battery-answers-first]]
package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"slices"
	"strings"

	"quackitect/src/index"
	"quackitect/src/modules/tickets"
)

// The survey of the tools this box holds, which toolsFile in src/quack/survey.go names, and the folder of tickets the red list reads. [[spec/design_output/tools#where-a-caller-looks]] [[spec/design_output/pull#the-gate]]
const (
	surveyFile    = runtimeDir + "/tools.json"
	publicTickets = "spec/tickets"
	goFormatter   = "gofmt"
)

// The tree a verb road names: the folder over src/scripts in quack verb <scripts>, else the root the index reads. A review runs the check in a worktree under the method root's variable, and the road names the worktree. [[spec/tickets/check-reads-the-road-root]]
func roadRoot(args []string, fallback func() (string, error)) string {
	if len(args) > verbArgs && args[1] == "verb" {
		return filepath.Dir(filepath.Dir(filepath.Clean(args[2])))
	}
	if root, err := fallback(); err == nil {
		return root
	}
	return "."
}

// The doors over the real box, under the root the verb road names. [[spec/design_output/work#the-battery-answers-first]]
func checkDoorsOf(out, errs io.Writer) checkDoors {
	root := roadRoot(os.Args, index.Root)
	self, _ := selfPath()
	scripts := filepath.Join(root, "src", "scripts")
	survey := surveyAt(root)
	d := checkDoors{root: root, self: self, now: wall.Now, platform: runtime.GOOS, red: redHere(root), log: appendsRow(realDisk(), root, wall.Now), out: out, errs: errs, disk: realDisk()}
	d.browser, _ = browserFrom(d.disk, os.Getenv, runtime.GOOS == "darwin")
	d.run = runsUnder(root, survey, out, errs)
	d.verb = verbOver(d.run, []string{self, "verb", scripts}, []string{lintEnv + "=" + d.at(lintFile)}, errs)
	d.get = func(where string) ([]byte, error) {
		answer, err := (&http.Client{Timeout: healthWait}).Get(where)
		if err != nil {
			return nil, err
		}
		defer answer.Body.Close()
		return io.ReadAll(answer.Body)
	}
	d.config = func(key string) float64 {
		rows, err := configAt(root)
		var said float64
		if err == nil {
			_ = json.Unmarshal(rows[key].Value, &said)
		}
		return said
	}
	d.indexUp = func() bool { return indexStands(d.text(indexFile)) }
	d.git = func(args ...string) string {
		said, _ := exec.Command("git", append([]string{"-C", root}, args...)...).Output()
		return strings.TrimSpace(string(said))
	}
	return d
}

// A process under the root. A quiet run keeps both streams, and a loud one prints them and keeps the standard output too, so a red Go run names its cases. [[spec/tickets/ci-reds-name-their-cases]]
func runsUnder(root string, survey map[string]string, out, errs io.Writer) func(argv, env []string, quiet bool) (int, string, error) {
	return func(argv, env []string, quiet bool) (int, string, error) {
		child := exec.Command(toolOf(survey, argv[0]), argv[1:]...)
		child.Dir, child.Env = root, append(os.Environ(), env...)
		var said bytes.Buffer
		child.Stdout, child.Stderr = io.MultiWriter(out, &said), errs
		if quiet {
			child.Stdout, child.Stderr = &said, &said
		}
		err := child.Run()
		var exited *exec.ExitError
		if errors.As(err, &exited) {
			return exited.ExitCode(), said.String(), nil
		}
		return 0, said.String(), err
	}
}

// The tools the survey names, each by its path. [[spec/design_output/tools#where-a-caller-looks]]
func surveyAt(root string) map[string]string {
	var said map[string]struct {
		Path string `json:"path"`
	}
	body, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(surveyFile)))
	_ = json.Unmarshal(body, &said)
	out := map[string]string{}
	for name, one := range said {
		out[name] = one.Path
	}
	return out
}

// The program a name runs: the survey's path where it stands, the formatter beside the surveyed Go, or the name off the PATH. [[spec/design_output/tools#where-a-caller-looks]]
func toolOf(survey map[string]string, name string) string {
	stands := func(path string) bool { _, err := os.Stat(path); return path != "" && err == nil }
	if stands(survey[name]) {
		return survey[name]
	}
	if name == goFormatter && survey["go"] != "" {
		beside := filepath.Join(filepath.Dir(survey["go"]), goFormatter+filepath.Ext(survey["go"]))
		if stands(beside) {
			return beside
		}
	}
	return name
}

// Whether the index's standing file names a process alive, so a door stands over the root. [[spec/tickets/the-check-runs-beside]]
func indexStands(text string) bool {
	var said struct {
		Pid int `json:"pid"`
	}
	return json.Unmarshal([]byte(text), &said) == nil && said.Pid > 0 && alive(said.Pid)
}

// The tests the open tickets list as red, off the tracked tickets alone. [[spec/design_output/pull#the-gate]]
func redHere(root string) []string {
	listed, _ := os.ReadDir(filepath.Join(root, publicTickets))
	out := []string{}
	for _, one := range listed {
		if one.IsDir() || !strings.HasSuffix(one.Name(), ".md") {
			continue
		}
		if text, err := os.ReadFile(filepath.Join(root, publicTickets, one.Name())); err == nil {
			out = append(out, tickets.RedList(string(text))...)
		}
	}
	slices.Sort(out)
	return slices.Compact(out)
}
