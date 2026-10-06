// A dump lands where no projection reads it back.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package main

import (
	"os"
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
	text, err := os.ReadFile(filepath.Join(treeRoot, filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "seen.md"), []byte("a dumped line\n"), 0o644); err != nil {
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
	at := filepath.Join(root, filepath.FromSlash(dumpPath("files/")))
	written := ""
	for range ticketPolls {
		if err := dumps("files/"); err != nil {
			t.Fatal(err)
		}
		body, err := os.ReadFile(at)
		if err != nil {
			t.Fatal(err)
		}
		written = string(body)
		if strings.Contains(written, "files/seen.md") && strings.Contains(written, "a dumped line") {
			break
		}
		time.Sleep(100 * time.Millisecond)
	}
	said, err := askIndex("dump", "files/")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(written, "files/seen.md") || written != said {
		t.Fatalf("quack dump writes %q where the index answers %q", written, said)
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
