// The doors the box verbs reach: the tree's root, the environment, the process
// runner, a GET, the clock and the caller's streams. A test hands fakes, and
// the registered twin hands the real ones. [[spec/tickets/box-verbs-port-to-go]]
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"syscall"
	"time"

	"quackitect/src/branches"
	"quackitect/src/index"
	"quackitect/src/q"
)

// How one outside run goes: its folder, the variables past the box's own or the whole environment in place of it, what it reads, its bound, whether it writes to the caller's streams, whether it reads the caller's terminal, and whether its error stream joins its output. [[spec/tickets/box-verbs-port-to-go]] [[spec/tickets/quack-reaches-the-box-through-doors]]
type runOpts struct {
	cwd      string
	env      map[string]string
	environ  []string
	stdin    string
	timeout  time.Duration
	inherit  bool
	console  bool
	combined bool
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
	environ   func() []string
	goos      string
	pid       int
	run       func(argv []string, o runOpts) ranResult
	get       func(url string, wait time.Duration) (string, error)
	clock     q.Clock
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
		root:    root,
		env:     os.Getenv,
		environ: os.Environ,
		goos:    runtime.GOOS,
		pid:     os.Getpid(),
		run:     realRun(out, errs),
		get:     realGet,
		clock:   wall,
		disk:    realDisk(),
		out:     out,
		errs:    errs,
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
			ctx, cancel = wall.WithTimeout(ctx, o.timeout)
			defer cancel()
		}
		child := exec.CommandContext(ctx, argv[0], argv[1:]...)
		child.Dir = o.cwd
		if len(o.env) > 0 || o.environ != nil {
			child.Env = o.environ
			if child.Env == nil {
				child.Env = os.Environ()
			}
			for key, value := range o.env {
				child.Env = append(child.Env, key+"="+value)
			}
		}
		if o.stdin != "" {
			child.Stdin = strings.NewReader(o.stdin)
		}
		if o.console {
			child.Stdin = os.Stdin
		}
		var said, fell bytes.Buffer
		child.Stdout, child.Stderr = &said, &fell
		if o.combined {
			child.Stderr = &said
		}
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

// The binary this process runs, which a case swaps for one standing nowhere. [[spec/design_output/pull#the-hand-rule]]
var selfPath = os.Executable

// A process stands alive where it takes signal zero. Windows takes no signal, so there a process stands alive while it opens. [[spec/tickets/find-and-wait-in-go]]
func alive(pid int) bool {
	one, err := os.FindProcess(pid)
	if err != nil {
		return false
	}
	if runtime.GOOS == "windows" {
		one.Release()
		return true
	}
	return one.Signal(syscall.Signal(0)) == nil
}

// A connection to a port on this box. [[spec/design_output/model#the-editor-starts-quack-lsp]]
func dialLocal(port int) (io.ReadWriteCloser, error) {
	return net.Dial("tcp", fmt.Sprintf("127.0.0.1:%d", port))
}

// How long one request of the fire waits for its reply. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
const sendTimeout = time.Minute

// One request onto the network, its reply's headers keyed in lower case. [[spec/design_output/doors#a-door-reads-the-outside]]
func httpSend(url string, request branches.Request) (branches.Reply, error) {
	asked, err := http.NewRequest(request.Method, url, strings.NewReader(request.Body))
	if err != nil {
		return branches.Reply{}, err
	}
	for key, value := range request.Headers {
		asked.Header.Set(key, value)
	}
	said, err := (&http.Client{Timeout: sendTimeout}).Do(asked)
	if err != nil {
		return branches.Reply{}, err
	}
	defer said.Body.Close()
	body, err := io.ReadAll(said.Body)
	if err != nil {
		return branches.Reply{}, err
	}
	headers := map[string]string{}
	for key := range said.Header {
		headers[strings.ToLower(key)] = said.Header.Get(key)
	}
	return branches.Reply{Status: said.StatusCode, Text: string(body), Headers: headers}, nil
}

// Posts the body to /v1, under the wait the prefer header names. [[spec/tickets/the-quack-cli-gets-generated]]
func posts(url, prefer string, body []byte) (called, error) {
	var said called
	asked, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return said, err
	}
	asked.Header.Set("Content-Type", "application/json")
	asked.Header.Set("Prefer", prefer)
	err = answers(asked, &said)
	return said, err
}

// Reads one value off /v1 into into. [[spec/tickets/the-quack-cli-gets-generated]]
func reads(url string, into any) error {
	asked, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	return answers(asked, into)
}

// Sends the request, and decodes a success into into, or answers the problem's detail. [[spec/design_output/model#surfaces]]
func answers(asked *http.Request, into any) error {
	said, err := http.DefaultClient.Do(asked)
	if err != nil {
		return err
	}
	defer said.Body.Close()
	body, err := io.ReadAll(said.Body)
	if err != nil {
		return err
	}
	if said.StatusCode >= http.StatusBadRequest {
		var problem struct {
			Detail string `json:"detail"`
		}
		if json.Unmarshal(body, &problem) == nil && problem.Detail != "" {
			return fmt.Errorf("%s", problem.Detail)
		}
		return fmt.Errorf("%s answers %d: %s", asked.URL.Path, said.StatusCode, body)
	}
	return json.Unmarshal(body, into)
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
