// The folder under a root and its fake answer the same reads.
// [[spec/design_output/failures#the-registry-reads-the-nodes]]
package failure

import (
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

func TestDirAndFakeDirAnswerAlike(t *testing.T) {
	t.Parallel()
	files := map[string]string{Folder + "/a.md": "one", Folder + "/b.md": "two", "spec/other.md": "three"}
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
	for name, reader := range map[string]Reader{"dir": Dir{Root: root}, "fake": FakeDir(files)} {
		if got := reader.Files(Folder); !reflect.DeepEqual(got, []string{"a.md", "b.md"}) {
			t.Errorf("%s lists %v", name, got)
		}
		if got, ok := reader.Read(Folder + "/b.md"); !ok || got != "two" {
			t.Errorf("%s reads %q, %v", name, got, ok)
		}
		if _, ok := reader.Read(Folder + "/none.md"); ok {
			t.Errorf("%s reads a file nobody wrote", name)
		}
		if got := reader.Files("spec/none"); len(got) != 0 {
			t.Errorf("%s lists %v under a folder nobody made", name, got)
		}
		if got := reader.Walk("spec"); !reflect.DeepEqual(got, []string{Folder + "/a.md", Folder + "/b.md", "spec/other.md"}) {
			t.Errorf("%s walks %v", name, got)
		}
		if got := reader.Walk("spec/none"); len(got) != 0 {
			t.Errorf("%s walks %v under a folder nobody made", name, got)
		}
	}
}

func TestShellAndFakeRunnerAnswerAlike(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "RUNME.sh"), []byte("#!/bin/sh\necho \"$@\" >> ran.txt\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	fake := &FakeRunner{}
	for name, runner := range map[string]Runner{"shell": Shell{Root: root}, "fake": fake} {
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

func TestShellAndFakeRunnerAnswerAFailingExit(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "RUNME.sh"), []byte("#!/bin/sh\nexit 3\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	for name, runner := range map[string]Runner{"shell": Shell{Root: root}, "fake": &FakeRunner{Exits: map[string]int{"branch release": 3}}} {
		if exit, err := runner.Run("branch release"); exit != 3 || err != nil {
			t.Errorf("%s answers %d, %v, want 3", name, exit, err)
		}
	}
	if exit, err := (Shell{Root: t.TempDir()}).Run("branch release"); exit == 0 && err == nil {
		t.Error("the shell answers 0 under a root holding no RUNME.sh")
	}
}
