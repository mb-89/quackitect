// The node module runs a request a person marks with the harness variables
// taken out, so the verb reads a person's hand.
// [[spec/tickets/the-lens-calls-actions]]
package main

import (
	"io"
	"os"
	"path/filepath"
	"runtime"
	"slices"
	"testing"

	"quackitect/src/proc"
	"quackitect/src/q"
)

// The child road a person's run starts, standing in for quack: it prints the harness variable it reads. [[spec/tickets/program-of-drops-node]]
const childSays = "#!/bin/sh\necho \"${CLAUDECODE:-none}\"\n"

// The quack a person's child road names, a path standing on no box. [[spec/tickets/quack-spawns-meet-fake-process]]
const fakeQuack = "/fake/quack"

// The binary the child road runs, as os.Executable answers it. [[spec/tickets/quack-spawns-meet-fake-process]]
func fakeSelf() (string, error) { return fakeQuack, nil }

// A case of TestVerbRegistry, since it writes the registry the other cases write. [[spec/tickets/quack-spawns-meet-fake-process]]
func aPersonRunDropsTheHarnessAndNamesItsRoot(t *testing.T) {
	registersFor(t, "person probe", func([]string, bool, io.Writer, io.Writer) int { return 0 })
	var ran []proc.Command
	fake := &proc.FakeRunner{Programs: map[string]proc.Program{fakeQuack: func(one proc.Command) proc.Said {
		ran = append(ran, one)
		return proc.Said{Out: "the road ran\n"}
	}}}
	root := t.TempDir()
	said, err := nodeAcceptOver(fake.Run, fakeSelf, root)(q.Request{Module: "node", Verb: "run", Args: map[string]any{"words": []any{"person", "probe"}, "person": true}})
	if err != nil || said != "the road ran" {
		t.Fatalf("a person's run answers %v, %v, and wants the child's output", said, err)
	}
	if len(ran) != 1 {
		t.Fatalf("a person's run starts %d child roads, and wants one", len(ran))
	}
	one := ran[0]
	want := []string{fakeQuack, "verb", filepath.Join(root, "src", "scripts"), "person", "probe"}
	if !slices.Equal(one.Argv, want) || one.Dir != root {
		t.Fatalf("the child road runs %q in %s, and wants %q in %s", one.Argv, one.Dir, want, root)
	}
	if !slices.Equal(one.Drop, harness) || !slices.Equal(one.Env, []string{workRoot + "=" + root}) {
		t.Fatalf("the child road drops %q and adds %q, and wants %q dropped and %s named", one.Drop, one.Env, harness, workRoot)
	}
}

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
