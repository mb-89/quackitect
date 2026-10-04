// The check verb: the tests, level zero, the Go tests, the doors, the
// projections, the plugin, the server, then the rules over the tree, each
// part timed, and the stamp a door reads before a push.
// [[spec/design_output/work#the-battery-answers-first]]
package main

import (
	"io"
	"time"
)

// One part of the battery: its name, its run, and whether it runs beside the parts after it. [[spec/design_output/work#the-battery-answers-first]]
type part struct {
	name   string
	run    func() int
	beside bool
}

// What the check reaches: the root, a verb through quack's own road, a process, the health call, the clock, the platform, the red list and the streams. [[spec/design_output/work#the-battery-answers-first]]
type checkDoors struct {
	root      string
	verb      func(words []string, quiet bool) int
	run       func(argv, env []string, quiet bool) (int, string, error)
	get       func(url string) ([]byte, error)
	now       func() time.Time
	windows   bool
	red       []string
	out, errs io.Writer
}

// One run of the test part. [[spec/tickets/the-tests-start-fewer-processes]]
type testPart struct {
	glob, times string
	shared      bool
}

var testParts = []testPart{}

func batteryRun(parts []part, now func() time.Time) (int, map[string]float64, []string, float64) {
	return 0, nil, nil, 0
}

func partsOf(d checkDoors, words []string, quiet bool) []part { return nil }

func serverRead(answers, ok bool, where, why string) (int, string, bool) { return 0, "", false }

func goTestNames(paths []string, read func(string) string) []string { return nil }

func goSkipOf(red []string, read func(string) string) []string { return nil }

func goGate(d checkDoors, quiet bool, skip []string) int { return 0 }

func testArgv(root string, red []string, one testPart) []string { return nil }

func errorsSaid(lines string, erred []string) []string { return nil }
