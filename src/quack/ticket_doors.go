// The doors the ticket verbs reach the outside through: the two roots a
// vehicle holds, and git over the work root.
// [[spec/tickets/ticket-verbs-port-to-go]]
package main

import (
	"os"
	"os/exec"
	"strings"
)

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
