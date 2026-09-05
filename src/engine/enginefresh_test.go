package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// THE SUITE DRIVES THE TREE, NOT THE LAST SWAP. See enginefresh.go.

// aFileBuiltAt writes a file and sets when it was built.
func aFileBuiltAt(t *testing.T, path string, at time.Time) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte("x"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Chtimes(path, at, at); err != nil {
		t.Fatal(err)
	}
}

func TestATreeNewerThanTheEngineIsBuilt(t *testing.T) {
	dir := t.TempDir()
	then := time.Date(2026, 9, 5, 10, 0, 0, 0, time.UTC)
	engine := filepath.Join(dir, "se")
	src := filepath.Join(dir, "src")
	hook := filepath.Join(src, "hook.go")
	aFileBuiltAt(t, engine, then)
	aFileBuiltAt(t, hook, then.Add(time.Minute))
	c := engineToRun(engine, []string{src}, then.Add(2*time.Minute))
	if !c.Build {
		t.Fatal("a hook newer than the engine did not have the suite build one, so a hook change is seen only after a swap")
	}
	if c.Newer != hook {
		t.Fatalf("the source named as newer is %q, and the hook that changed is %q", c.Newer, hook)
	}
	// AN ENGINE THAT IS NOT THERE IS BUILT AS WELL, the way it always was.
	if c := engineToRun(filepath.Join(dir, "gone"), []string{src}, then); !c.Build {
		t.Fatal("an engine that is not there was not built")
	}
}

func TestAnEngineNewerThanTheTreeIsRunAsItIs(t *testing.T) {
	dir := t.TempDir()
	then := time.Date(2026, 9, 5, 10, 0, 0, 0, time.UTC)
	engine := filepath.Join(dir, "se")
	src := filepath.Join(dir, "src")
	aFileBuiltAt(t, filepath.Join(src, "hook.go"), then)
	aFileBuiltAt(t, engine, then.Add(time.Minute))
	// A TEST FILE IS NOT SOURCE: the engine has none in it, so a newer one
	// is no reason to build.
	aFileBuiltAt(t, filepath.Join(src, "hook_test.go"), then.Add(2*time.Minute))
	// AND NEITHER IS A FILE THE TOOLCHAIN PASSES OVER. A base name beginning
	// with an underscore or a dot is not source to go build, so a build over
	// one of those compiles nothing new and the fresh engine is the same
	// program. A parked file left beside its own source is exactly this case.
	aFileBuiltAt(t, filepath.Join(src, "_parked.go"), then.Add(2*time.Minute))
	aFileBuiltAt(t, filepath.Join(src, ".hidden.go"), then.Add(2*time.Minute))
	c := engineToRun(engine, []string{src}, then.Add(3*time.Minute))
	if c.Build {
		t.Fatalf("an engine newer than every source was built again, because of %q", c.Newer)
	}
	if c.Path != engine {
		t.Fatalf("the engine to run is %q, and %q was handed over", c.Path, engine)
	}
	if c.Age != 2*time.Minute {
		t.Fatalf("the age answered is %s, and the engine was built two minutes before now", c.Age)
	}
}

// THE REAL SUITE, WHATEVER IT WAS HANDED. A source newer than the engine
// these tests drive is a change they cannot see.
func TestTheSuiteDrivesAnEngineNoOlderThanItsTree(t *testing.T) {
	engine := theEngine(t)
	info, err := os.Stat(engine)
	if err != nil {
		t.Fatal(err)
	}
	newest, at := newestSource([]string{"."})
	if at.After(info.ModTime()) {
		t.Fatalf("the suite drives %s, built %s before %s changed, so a change there is not what these tests see",
			engine, at.Sub(info.ModTime()).Round(time.Second), newest)
	}
}

func TestTheAnswerNamesTheEngineItDrove(t *testing.T) {
	r, _ := aTreeWithTests(t)
	then := time.Now().Add(-10 * time.Minute)
	resident := filepath.Join(r.Method, ".bin", exeName("se"))
	hook := filepath.Join(r.Method, "src", "engine", "hook.go")
	aFileBuiltAt(t, hook, then)
	aFileBuiltAt(t, resident, then.Add(time.Minute))
	db := openTheIndex(t, r)
	got, err := TestTheDelta(r, db, "", []string{"TestA"}, true, "worker-one")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(got.Engine, resident+", built ") || !strings.HasSuffix(got.Engine, " ago") {
		t.Fatalf("the answer says %q of the engine, and the resident one ran, built nine minutes ago", got.Engine)
	}
	// THEN THE HOOK CHANGES, AND NO SWAP LANDS.
	now := time.Now()
	if err := os.Chtimes(hook, now, now); err != nil {
		t.Fatal(err)
	}
	got, err = TestTheDelta(r, db, "", []string{"TestA"}, true, "worker-one")
	if err != nil {
		t.Fatal(err)
	}
	fresh := filepath.Join(r.Private("tests"), exeName("se.fresh"))
	if !strings.HasPrefix(got.Engine, fresh+", built now from the tree: ") || !strings.Contains(got.Engine, "hook.go is newer than "+resident) {
		t.Fatalf("the answer says %q of the engine, and the hook changed after the resident one was built", got.Engine)
	}
}
