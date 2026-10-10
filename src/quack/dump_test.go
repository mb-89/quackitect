// A dump lands where no projection reads it back.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/index"
	"quackitect/src/q"
)

// quack dump asks the served index for a prefix, and writes the answer under the root where dumpPath names it. [[spec/design_output/model#everything-on-disk-mirrors]]
func TestQuackDumpWritesWhatTheIndexAnswers(t *testing.T) {
	w := treeWiring(t)
	root := t.TempDir()
	if err := realDisk().write(filepath.Join(root, "seen.md"), []byte("a dumped line\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	c := q.New()
	starts, err := load(w, c)
	if err != nil {
		t.Fatal(err)
	}
	stop, _, err := index.Serve(wall, root, filepath.Join(t.TempDir(), "index.db"), c, starts...)
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	t.Setenv("QUACKITECT_ROOT", root)
	heardStanding(t)
	at := filepath.Join(root, filepath.FromSlash(dumpPath("files/")))
	if err := dumps("files/"); err != nil {
		t.Fatal(err)
	}
	body, err := realDisk().read(at)
	if err != nil {
		t.Fatal(err)
	}
	written := string(body)
	said, err := askIndex("dump", "files/")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(written, "files/seen.md") || !strings.Contains(written, "a dumped line") || written != said {
		t.Fatalf("quack dump writes %q where the index answers %q", written, said)
	}
}

// Waits until the index answers the standing file the serve writes, since the watch hands its new folder in after the seed, and a dump racing it answers a different prefix. [[spec/tickets/seed-survives-bad-files]]
func heardStanding(t *testing.T) {
	t.Helper()
	deadline := wall.Now().Add(30 * time.Second)
	for {
		said, err := askIndex("dump", "files/")
		if text, ok := said.(string); err == nil && ok && strings.Contains(text, "files/.se/.runtime/index.json") {
			return
		}
		if wall.Now().After(deadline) {
			t.Fatalf("the index never answers its standing file: %q (%v)", said, err)
		}
		<-wall.After(20 * time.Millisecond)
	}
}

func TestADumpIsReadByNothing(t *testing.T) {
	t.Parallel()
	at := dumpPath("tickets/")
	if !strings.HasPrefix(at, ".se/.dump/") {
		t.Fatalf("the dump of tickets/ lands at %q", at)
	}
	for _, one := range projections() {
		if matched, _ := path.Match(one.glob, at); matched {
			t.Fatalf("the projection over %s reads the dump back", one.glob)
		}
	}
}

func TestADumpNamesItsFileAfterItsPrefix(t *testing.T) {
	t.Parallel()
	for prefix, want := range map[string]string{"ops/": ".se/.dump/ops.json", "files/src/": ".se/.dump/files-src.json", "": ".se/.dump/all.json"} {
		if got := dumpPath(prefix); got != want {
			t.Fatalf("the dump of %q lands at %s", prefix, got)
		}
	}
}
