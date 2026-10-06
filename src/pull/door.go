// The ticket verbs and the pull in Go: the reads every verb shares, the
// writes, and the pull itself, off src/scripts/ticket.js and pull*.js. This
// file holds the disk door and its fake, and no other file reaches outside.
// [[spec/tickets/ticket-verbs-port-to-go]]
package pull

import (
	"bytes"
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"

	"quackitect/src/proc"
)

// The disk under the root, by slashed paths relative to it. [[spec/tickets/ticket-verbs-port-to-go]]
type Disk interface {
	Read(path string) (string, bool)
	Exists(path string) bool
	Files(folder string) []string
	Write(path, text string) error
	Remove(path string) error
}

// A disk in memory, which every case of this package writes to. [[spec/tickets/ticket-verbs-port-to-go]]
type FakeDisk map[string]string

func (one FakeDisk) Read(path string) (string, bool) {
	text, ok := one[path]
	return text, ok
}

func (one FakeDisk) Exists(path string) bool {
	if _, ok := one[path]; ok {
		return true
	}
	for held := range one {
		if len(held) > len(path) && held[:len(path)+1] == path+"/" {
			return true
		}
	}
	return false
}

func (one FakeDisk) Files(folder string) []string {
	out := []string{}
	for held := range one {
		if len(held) <= len(folder)+1 || held[:len(folder)+1] != folder+"/" {
			continue
		}
		if name := held[len(folder)+1:]; !containsSlash(name) {
			out = append(out, name)
		}
	}
	sortStrings(out)
	return out
}

func (one FakeDisk) Write(path, text string) error {
	one[path] = text
	return nil
}

func (one FakeDisk) Remove(path string) error {
	delete(one, path)
	return nil
}

// The disk under a root on this box. [[spec/tickets/ticket-verbs-port-to-go]]
type OSDisk struct{ Root string }

func (one OSDisk) at(path string) string { return filepath.Join(one.Root, filepath.FromSlash(path)) }

func (one OSDisk) Read(path string) (string, bool) {
	said, err := os.ReadFile(one.at(path))
	return string(said), err == nil
}

func (one OSDisk) Exists(path string) bool {
	_, err := os.Stat(one.at(path))
	return err == nil
}

func (one OSDisk) Files(folder string) []string {
	found, _ := os.ReadDir(one.at(folder))
	out := []string{}
	for _, each := range found {
		if !each.IsDir() {
			out = append(out, each.Name())
		}
	}
	sort.Strings(out)
	return out
}

// Writes the text, and makes the folder it stands in. [[spec/tickets/ticket-verbs-port-to-go]]
func (one OSDisk) Write(path, text string) error {
	at := one.at(path)
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		return err
	}
	return os.WriteFile(at, []byte(text), 0o644)
}

// Removes the file, and a file standing nowhere removes clean. [[spec/tickets/ticket-verbs-port-to-go]]
func (one OSDisk) Remove(path string) error {
	if err := os.Remove(one.at(path)); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func containsSlash(said string) bool {
	for _, r := range said {
		if r == '/' {
			return true
		}
	}
	return false
}

// Git under a root on this box, its streams trimmed as the JavaScript door trims them. [[spec/design_output/doors#a-door-standing-on-another]]
type GitDoor struct{ Root string }

func (one GitDoor) Run(args ...string) Ran {
	run := exec.Command("git", args...)
	run.Dir = one.Root
	var out, errs bytes.Buffer
	run.Stdout, run.Stderr = &out, &errs
	err := run.Run()
	return Ran{OK: err == nil, Out: strings.TrimSpace(out.String()), Err: strings.TrimSpace(errs.String())}
}

// A command line through sh -c in the root on a process runner: what it printed, its exit code, and a fault where its program never starts. [[spec/design_output/doors#the-process-door]]
func ShellOver(run proc.Runner, root string) Shell {
	return func(string) (string, int, error) { return "", 0, nil }
}

// A command line through sh under a root: what it printed, its exit code, and why where it starts not. [[spec/design_output/pull#the-commands-answer]]
func OSShell(root string) Shell {
	return func(line string) (string, int, error) {
		run := exec.Command("sh", "-c", line)
		run.Dir = root
		var out bytes.Buffer
		run.Stdout = &out
		err := run.Run()
		var exit *exec.ExitError
		if errors.As(err, &exit) {
			return out.String(), exit.ExitCode(), nil
		}
		if err != nil {
			return "", 0, err
		}
		return out.String(), 0, nil
	}
}
