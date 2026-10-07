// The folder under a root and its fake answer the same reads.
// [[spec/design_output/failures#the-registry-reads-the-nodes]]
package failure_test

import (
	"os"
	"path/filepath"
	"reflect"
	"testing"

	"quackitect/src/failure"
)

// level0: FixtureOutsideHome - the contract writes real files into a folder of its own, which the real door reads beside the fake
func TestDirAndFakeDirAnswerAlike(t *testing.T) {
	t.Parallel()
	files := map[string]string{failure.Folder + "/a.md": "one", failure.Folder + "/b.md": "two", "spec/other.md": "three"}
	root := t.TempDir()
	for path, text := range files {
		at := filepath.Join(root, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	for name, reader := range map[string]failure.Reader{"dir": failure.Dir{Root: root}, "fake": failure.FakeDir(files)} {
		if got := reader.Files(failure.Folder); !reflect.DeepEqual(got, []string{"a.md", "b.md"}) {
			t.Errorf("%s lists %v", name, got)
		}
		if got, ok := reader.Read(failure.Folder + "/b.md"); !ok || got != "two" {
			t.Errorf("%s reads %q, %v", name, got, ok)
		}
		if _, ok := reader.Read(failure.Folder + "/none.md"); ok {
			t.Errorf("%s reads a file nobody wrote", name)
		}
		if got := reader.Files("spec/none"); len(got) != 0 {
			t.Errorf("%s lists %v under a folder nobody made", name, got)
		}
		if got := reader.Walk("spec"); !reflect.DeepEqual(got, []string{failure.Folder + "/a.md", failure.Folder + "/b.md", "spec/other.md"}) {
			t.Errorf("%s walks %v", name, got)
		}
		if got := reader.Walk("spec/none"); len(got) != 0 {
			t.Errorf("%s walks %v under a folder nobody made", name, got)
		}
	}
}

// level0: FixtureOutsideHome - the contract runs a real RUNME.sh it writes into a folder of its own, beside the fake runner
func TestShellAndFakeRunnerAnswerAlike(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "RUNME.sh"), []byte("#!/bin/sh\necho \"$@\" >> ran.txt\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	fake := &failure.FakeRunner{}
	for name, runner := range map[string]failure.Runner{"shell": failure.Shell{Root: root}, "fake": fake} {
		if exit, err := runner.Run("branch release"); exit != 0 || err != nil {
			t.Errorf("%s runs the line to %d, %v", name, exit, err)
		}
	}
	if ran, _ := os.ReadFile(filepath.Join(root, "ran.txt")); string(ran) != "branch release\n" {
		t.Errorf("the shell runs %q", ran)
	}
	if !reflect.DeepEqual(fake.Lines, []string{"branch release"}) {
		t.Errorf("the fake keeps %q", fake.Lines)
	}
}

// level0: FixtureOutsideHome - the contract runs a real failing RUNME.sh it writes into a folder of its own, and one under an empty folder
func TestShellAndFakeRunnerAnswerAFailingExit(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "RUNME.sh"), []byte("#!/bin/sh\nexit 3\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	for name, runner := range map[string]failure.Runner{"shell": failure.Shell{Root: root}, "fake": &failure.FakeRunner{Exits: map[string]int{"branch release": 3}}} {
		if exit, err := runner.Run("branch release"); exit != 3 || err != nil {
			t.Errorf("%s answers %d, %v, want 3", name, exit, err)
		}
	}
	if exit, err := (failure.Shell{Root: t.TempDir()}).Run("branch release"); exit == 0 && err == nil {
		t.Error("the shell answers 0 under a root holding no RUNME.sh")
	}
}
