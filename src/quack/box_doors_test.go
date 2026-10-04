// The fake doors the box verbs run over in a test: a temporary tree, a PATH
// of empty programs, a runner recording each run, and a GET that answers
// nothing. [[spec/tickets/box-verbs-no-node-test]]
package main

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"
)

// A runner recording each run, answering off a script keyed by the program's base name and its first word. [[spec/tickets/box-verbs-no-node-test]]
type fakeRunner struct {
	mu      sync.Mutex
	ran     [][]string
	opts    []runOpts
	answers map[string]ranResult
}

func (f *fakeRunner) run(argv []string, o runOpts) ranResult {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.ran = append(f.ran, argv)
	f.opts = append(f.opts, o)
	key := filepath.Base(argv[0])
	if len(argv) > 1 {
		if said, ok := f.answers[key+" "+argv[1]]; ok {
			return said
		}
	}
	if said, ok := f.answers[key]; ok {
		return said
	}
	return ranResult{stdout: key + " 1.2.3\n"}
}

// The fake doors over a temporary tree, with the named programs standing on its PATH. [[spec/tickets/box-verbs-no-node-test]]
func fakeBoxDoors(t *testing.T, programs ...string) (boxDoors, *fakeRunner, *strings.Builder, *strings.Builder) {
	t.Helper()
	root := t.TempDir()
	path := filepath.Join(root, "path")
	if err := os.MkdirAll(path, 0o755); err != nil {
		t.Fatal(err)
	}
	for _, one := range programs {
		if err := os.WriteFile(filepath.Join(path, one), nil, 0o755); err != nil {
			t.Fatal(err)
		}
	}
	env := map[string]string{"PATH": path}
	runner := &fakeRunner{answers: map[string]ranResult{}}
	var out, errs strings.Builder
	return boxDoors{
		root: root,
		env:  func(key string) string { return env[key] },
		goos: "linux",
		pid:  7,
		run:  runner.run,
		get:  func(string, time.Duration) (string, error) { return "", errors.New("no wire here") },
		now:  func() time.Time { return time.Unix(0, 0) },
		out:  &out,
		errs: &errs,
	}, runner, &out, &errs
}
