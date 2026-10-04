// The commit verb: reads the message, lands the commit, runs the check, and
// pushes on green from a cloud box.
// [[spec/tickets/landing-verbs-port-to-go]]
package main

import (
	"io"
	"time"
)

// What the landing verbs reach: the root, the cloud flag, a verb run through the road, where claude stands, Vale over a message, the session log and the clock. [[spec/tickets/landing-verbs-port-to-go]]
type landingDoors struct {
	root   string
	cloud  bool
	verb   func(words ...string) (int, string)
	claude string
	voice  func(message string) []heard
	log    func(row map[string]any) error
	now    func() time.Time
}

// What a git run answers: its standard output, both streams, and whether it exits 0. [[spec/tickets/landing-verbs-port-to-go]]
type gitRan struct {
	out  string
	said string
	ok   bool
}

// [[spec/tickets/landing-verbs-port-to-go]]
func gitRun(root string, args ...string) gitRan { return gitRan{} }

// [[spec/tickets/landing-verbs-port-to-go]]
func commitVerb(d landingDoors) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return -1 }
}
