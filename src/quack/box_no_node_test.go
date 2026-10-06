// Every box verb starts no node to run JavaScript: over fakes, no run it makes
// names node past asking its version. The probe's dry road stands apart, on
// its own ticket. [[spec/tickets/box-verbs-no-node-test]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

// The words each box verb runs under in the case. [[spec/tickets/box-verbs-no-node-test]]
var noNodeWords = map[string][][]string{
	"probe": {{"compact"}, {"cold"}, {"reply"}, {"nothing"}},
}

func startsNode(argv []string) bool {
	for _, one := range argv {
		base := strings.TrimSuffix(filepath.Base(one), ".exe")
		if base == "node" && !slices.Equal(argv[len(argv)-1:], []string{"--version"}) {
			return true
		}
	}
	return false
}

func TestEveryBoxVerbStartsNoNode(t *testing.T) {
	t.Parallel()
	if len(boxAnswers) == 0 {
		t.Fatal("no box verb registers")
	}
	for verb, answer := range boxAnswers {
		words := noNodeWords[verb]
		if words == nil {
			words = [][]string{nil}
		}
		for _, argv := range words {
			d, runner, _, _ := fakeBoxDoors(t, "node", "git", "code", "npm", "claude")
			answer(d, argv)
			for _, one := range runner.ran {
				if startsNode(one) {
					t.Errorf("%s %v starts node: %v", verb, argv, one)
				}
			}
		}
	}
}

func TestTheNoNodeCaseCatchesANodeRun(t *testing.T) {
	t.Parallel()
	if !startsNode([]string{"/opt/bin/node", "x.js"}) || !startsNode([]string{"cmd", "/c", "node.exe", "y.js"}) {
		t.Error("a node run reads as none")
	}
	if startsNode([]string{"/opt/bin/node", "--version"}) || startsNode([]string{"npm", "install"}) {
		t.Error("a version ask or npm reads as a node run")
	}
}
