// The node module runs a request a person marks with the harness variables
// taken out, so the verb reads a person's hand.
// [[spec/tickets/the-lens-calls-actions]]
package main

import (
	"io"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"quackitect/src/q"
)

// The child road a person's run starts, standing in for quack: it prints the harness variable it reads. [[spec/tickets/program-of-drops-node]]
const childSays = "#!/bin/sh\necho \"${CLAUDECODE:-none}\"\n"

func TestAPersonRunCarriesNoHarness(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("a Windows box runs no shell script as a binary")
	}
	root := t.TempDir()
	child := filepath.Join(root, "quack")
	if err := os.WriteFile(child, []byte(childSays), 0o755); err != nil {
		t.Fatal(err)
	}
	registersFor(t, "registry env", func([]string, bool, io.Writer, io.Writer) int { return 0 })
	was := selfPath
	selfPath = func() (string, error) { return child, nil }
	t.Cleanup(func() { selfPath = was })
	t.Setenv("CLAUDECODE", "1")
	said, err := nodeAccept(root)(q.Request{Module: "node", Verb: "run", Args: map[string]any{"words": []any{"registry", "env"}, "person": true}})
	if err != nil || said != "none" {
		t.Fatalf("a person's run answers %v, %v, and wants none", said, err)
	}
}
