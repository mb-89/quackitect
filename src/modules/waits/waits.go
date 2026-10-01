// The waits module: the wait tool, which returns on the first signal it hears,
// a helper's report, an output's end, or a quiet set of files, and at its cap
// where none comes, off src/bridge/wait.js.
// [[spec/tickets/find-and-wait-in-go]]
package waits

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"quackitect/src/q"
)

// The module a wait action lists its request to, its verb, and the step it looks at its signals by. [[spec/design_output/level0#the-wait-returns-on-signals]]
const (
	Module   = "waits"
	waitVerb = "wait"
	step     = time.Second
	readOnly = "a wait reads the disk and the reports, and writes nothing"
)

// A wait: the helper whose report returns it, the output whose end returns it, and the files whose quiet returns it. [[spec/design_output/level0#the-wait-returns-on-signals]]
type Wait struct {
	Agent  string   `json:"agent,omitempty" doc:"the helper's agent id, whose report returns the wait"`
	Output string   `json:"output,omitempty" doc:"an output file, whose quiet or whose process's exit returns the wait"`
	Pid    *float64 `json:"pid,omitempty" doc:"the process writing the output, whose exit returns the wait"`
	Files  []string `json:"files,omitempty" doc:"files whose quiet, every one of them, returns the wait"`
}

// What the module reads: the tree, the clock and its pause, the cap and the quiet span, a helper's report, and a process's life. [[spec/tickets/find-and-wait-in-go]]
type Outside struct {
	Root     string
	Now      func() time.Time
	Pause    func(time.Duration)
	Most     time.Duration
	Quiet    time.Duration
	Reported func(agent string) bool
	Alive    func(pid int) bool
}

// [[spec/tickets/find-and-wait-in-go]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.ActionIn(c, Module+"/"+waitVerb, func(in Wait) []q.Request {
			return []q.Request{{Module: Module, Verb: waitVerb, Args: in, NoUndo: readOnly}}
		}, q.Doc("Waits on the first of three signals, and returns at its cap where none comes: a helper's report, an output's end, or a set of files standing quiet. Ask it in place of a loop of sleeps."), q.ToolName(waitVerb), q.IO()),
	)
}

// The IO side of the module: it answers each request a wait action lists. [[spec/tickets/find-and-wait-in-go]]
func Accept(from Outside) func(q.Request) (any, error) {
	return func(asked q.Request) (any, error) {
		in, ok := asked.Args.(Wait)
		if !ok {
			return nil, fmt.Errorf("%s.%s takes no %T", asked.Module, asked.Verb, asked.Args)
		}
		return from.waits(in), nil
	}
}

// A signal answers the line it returns the wait with, or nothing while it waits on. [[spec/design_output/level0#the-wait-returns-on-signals]]
type signal func(now time.Time) string

// The operation outlives its caller in the manager's book, so the wait counts its cap from its own start. [[spec/design_output/level0#the-wait-returns-on-signals]]
func (from Outside) waits(in Wait) string {
	signals := from.signalsOf(in)
	if len(signals) == 0 {
		return waitVerb + " takes an agent, an output or files to wait on."
	}
	start := from.Now()
	for {
		now := from.Now()
		for _, heard := range signals {
			if line := heard(now); line != "" {
				return line
			}
		}
		if now.Sub(start) >= from.Most {
			return fmt.Sprintf("The wait reaches its cap of %s, and no signal comes.", seconds(from.Most))
		}
		from.Pause(step)
	}
}

func (from Outside) signalsOf(in Wait) []signal {
	var out []signal
	if agent := strings.TrimSpace(in.Agent); agent != "" {
		out = append(out, from.reportOf(agent))
	}
	if output := strings.TrimSpace(in.Output); output != "" {
		out = append(out, from.outputOf(output, in.Pid))
	}
	var files []string
	for _, one := range in.Files {
		if one != "" {
			files = append(files, one)
		}
	}
	if len(files) > 0 {
		out = append(out, from.filesOf(files))
	}
	return out
}

func (from Outside) reportOf(agent string) signal {
	return func(time.Time) string {
		if from.Reported(agent) {
			return "The helper " + agent + " reports."
		}
		return ""
	}
}

func (from Outside) outputOf(path string, pid *float64) signal {
	still := from.quietOf([]string{path})
	return func(now time.Time) string {
		if pid != nil && !from.Alive(int(*pid)) {
			return "The output " + path + " ends, because its process exits."
		}
		if still(now) {
			return fmt.Sprintf("The output %s stands quiet for %s.", path, seconds(from.Quiet))
		}
		return ""
	}
}

func (from Outside) filesOf(paths []string) signal {
	still := from.quietOf(paths)
	return func(now time.Time) string {
		if still(now) {
			return fmt.Sprintf("The files %s stand quiet for %s.", strings.Join(paths, ", "), seconds(from.Quiet))
		}
		return ""
	}
}

// The paths stand quiet once their size and stamp hold for the span, counted from the last change seen. [[spec/design_output/level0#the-wait-returns-on-signals]]
func (from Outside) quietOf(paths []string) func(now time.Time) bool {
	seen, since := from.stateOf(paths), from.Now()
	return func(now time.Time) bool {
		if state := from.stateOf(paths); state != seen {
			seen, since = state, now
		}
		return now.Sub(since) >= from.Quiet
	}
}

func (from Outside) stateOf(paths []string) string {
	states := make([]string, 0, len(paths))
	for _, path := range paths {
		at := path
		if !filepath.IsAbs(at) {
			at = filepath.Join(from.Root, filepath.FromSlash(path))
		}
		info, err := os.Stat(at)
		if err != nil {
			states = append(states, "none")
			continue
		}
		states = append(states, fmt.Sprintf("%d:%d", info.Size(), info.ModTime().UnixNano()))
	}
	return strings.Join(states, "|")
}

func seconds(span time.Duration) string {
	return fmt.Sprintf("%gs", span.Seconds())
}
