// The box verbs setup, probe, tools and doctor answer in Go, each registered
// from its own file, and their programs leave the scripts folder.
// [[spec/tickets/box-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"os"
	"path/filepath"
	"testing"
)

// The verbs this group moves into Go. [[spec/tickets/box-verbs-port-to-go]]
var boxVerbs = []string{"setup", "probe", "tools", "doctor"}

func TestTheBoxVerbsRegister(t *testing.T) {
	t.Parallel()
	for _, verb := range boxVerbs {
		if registry[verb] == nil {
			t.Errorf("%s registers no Go answer", verb)
		}
	}
}

func TestTheBoxVerbsLeaveTheScripts(t *testing.T) {
	t.Parallel()
	for _, verb := range boxVerbs {
		at := filepath.Join("..", "..", filepath.FromSlash(programsFolder), verb+".js")
		if _, err := os.Stat(at); err == nil {
			t.Errorf("%s still stands as a program", at)
		}
	}
}
