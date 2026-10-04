// The doors the ticket verbs reach the outside through: the disk under a
// root, the two roots a vehicle holds, and git over the work root.
// [[spec/tickets/ticket-verbs-port-to-go]]
package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
)

// The disk under a root, as src/pull reads it. [[spec/tickets/ticket-verbs-port-to-go]]
type pullDisk struct{ root string }

func (one pullDisk) at(path string) string { return filepath.Join(one.root, filepath.FromSlash(path)) }

func (one pullDisk) Read(path string) (string, bool) {
	said, err := os.ReadFile(one.at(path))
	return string(said), err == nil
}

func (one pullDisk) Exists(path string) bool {
	_, err := os.Stat(one.at(path))
	return err == nil
}

func (one pullDisk) Files(folder string) []string {
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

func (one pullDisk) Write(path, text string) error { return writesFile(one.at(path), text) }

// The roots a verb reads: the method root the index stands over, and the work root a vehicle names over it. [[spec/design_output/vehicle#the-work-root-inherits]]
func rootsOf(rootOf func() (string, error)) (method, work string, err error) {
	if method, err = rootOf(); err != nil {
		return "", "", err
	}
	if work = strings.TrimSpace(os.Getenv(workRootVar)); work == "" {
		work = method
	}
	return method, work, nil
}

// One git call under the root, answering what it printed with the end trimmed, and whether it ran clean. [[spec/tickets/ticket-verbs-port-to-go]]
func gitIn(root string, args ...string) (string, bool) {
	run := exec.Command("git", args...)
	run.Dir = root
	said, err := run.Output()
	return strings.TrimSpace(string(said)), err == nil
}
