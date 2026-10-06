// The doors the box verbs reach: the tree's root, the environment, the process
// runner, a GET, the clock and the caller's streams. A test hands fakes, and
// the registered twin hands the real ones. [[spec/tickets/box-verbs-port-to-go]]
package main

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"

	"quackitect/src/index"
)

// How one outside run goes: its folder, the variables past the box's own, what it reads, its bound, and whether it writes to the caller's streams. [[spec/tickets/box-verbs-port-to-go]]
type runOpts struct {
	cwd     string
	env     map[string]string
	stdin   string
	timeout time.Duration
	inherit bool
}

// What one outside run answers. missing holds where the program stands nowhere. [[spec/tickets/box-verbs-port-to-go]]
type ranResult struct {
	code           int
	stdout, stderr string
	missing        bool
	fault          string
}

// The doors a box verb reaches. [[spec/tickets/box-verbs-port-to-go]]
type boxDoors struct {
	root      string
	env       func(key string) string
	goos      string
	pid       int
	run       func(argv []string, o runOpts) ranResult
	get       func(url string, wait time.Duration) (string, error)
	now       func() time.Time
	disk      diskDoors
	out, errs io.Writer
}

// A box verb over its doors and the words past the verb. [[spec/tickets/box-verbs-port-to-go]]
type boxVerb func(d boxDoors, argv []string) int

// The box verbs by their words, which the no-node case runs over fakes. [[spec/tickets/box-verbs-no-node-test]]
var boxAnswers = map[string]boxVerb{}

// Registers a box verb, its twin running over the real doors. [[spec/tickets/box-verbs-port-to-go]]
func registerBox(words string, verb boxVerb) {
	boxAnswers[words] = verb
	register(words, func(argv []string, _ bool, out, errs io.Writer) int {
		return verb(realBoxDoors(out, errs), argv[1:])
	})
}

// The doors over the box itself, the root off the index's own search. [[spec/tickets/box-verbs-port-to-go]]
func realBoxDoors(out, errs io.Writer) boxDoors {
	root, err := index.Root()
	if err != nil {
		root = "."
	}
	return boxDoors{
		root: root,
		env:  os.Getenv,
		goos: runtime.GOOS,
		pid:  os.Getpid(),
		run:  realRun(out, errs),
		get:  realGet,
		now:  time.Now,
		disk: realDisk(),
		out:  out,
		errs: errs,
	}
}

// The box doors a verb reaches outside a test, its runs writing to no stream. [[spec/tickets/quack-reaches-the-box-through-doors]]
func quietBox() boxDoors { return realBoxDoors(io.Discard, io.Discard) }

// The line a failed start says: a runtime missing from the PATH names itself, since the install brings none. [[spec/tickets/bare-desk-names-missing-node]]
func startFault(runtime string, err error) string {
	if errors.Is(err, exec.ErrNotFound) {
		return fmt.Sprintf("No %s stands on the PATH. Install %s, and run this again.", runtime, runtime)
	}
	return err.Error()
}

// Whether the box runs Windows. [[spec/tickets/box-verbs-port-to-go]]
func (d boxDoors) windows() bool { return d.goos == "windows" }

func realRun(out, errs io.Writer) func(argv []string, o runOpts) ranResult {
	return func(argv []string, o runOpts) ranResult {
		ctx := context.Background()
		if o.timeout > 0 {
			var cancel context.CancelFunc
			ctx, cancel = context.WithTimeout(ctx, o.timeout)
			defer cancel()
		}
		child := exec.CommandContext(ctx, argv[0], argv[1:]...)
		child.Dir = o.cwd
		if len(o.env) > 0 {
			child.Env = os.Environ()
			for key, value := range o.env {
				child.Env = append(child.Env, key+"="+value)
			}
		}
		if o.stdin != "" {
			child.Stdin = strings.NewReader(o.stdin)
		}
		var said, fell bytes.Buffer
		child.Stdout, child.Stderr = &said, &fell
		if o.inherit {
			child.Stdout, child.Stderr = out, errs
		}
		err := child.Run()
		ran := ranResult{stdout: said.String(), stderr: fell.String()}
		var exit *exec.ExitError
		switch {
		case err == nil:
		case errors.As(err, &exit):
			ran.code = exit.ExitCode()
		case errors.Is(err, exec.ErrNotFound), errors.Is(err, fs.ErrNotExist):
			ran.code, ran.missing, ran.fault = exitFailed, true, err.Error()
		default:
			ran.code, ran.fault = exitFailed, err.Error()
		}
		return ran
	}
}

func realGet(url string, wait time.Duration) (string, error) {
	asked := http.Client{Timeout: wait}
	said, err := asked.Get(url)
	if err != nil {
		return "", err
	}
	defer said.Body.Close()
	body, err := io.ReadAll(said.Body)
	return string(body), err
}
