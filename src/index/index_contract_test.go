// The index door meets the real outside once: a door on loopback answers a
// verb's question over both its ports, and git's own list turns the flags.
// Every other case of the package runs on the door's fakes.
// [[spec/tickets/test-walks-move-onto-fakes]]
package index

import (
	"fmt"
	"io"
	"net/http"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestTheDoorAnswersEveryQuestionAVerbAsks(t *testing.T) {
	root := tree(t)
	stop, _, err := Serve(qtest.Wall(), root, filepath.Join(t.TempDir(), "index.db"), q.New())
	if err != nil {
		t.Fatal(err)
	}
	defer stop()

	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	if standing.Pid == 0 || standing.Port == 0 || standing.V1 == 0 {
		t.Fatalf("the standing file says %+v", standing)
	}

	said, err := posts(standing, []string{"find", "search"})
	if err != nil {
		t.Fatal(err)
	}
	if said.Error != "" {
		t.Fatalf("find answered %q", said.Error)
	}

	said, err = posts(standing, []string{"dangling"})
	if err != nil {
		t.Fatal(err)
	}
	rows, ok := said.Result.([]any)
	if !ok || len(rows) != 1 {
		t.Fatalf("dangling answered %#v", said.Result)
	}

	read, err := http.Get(fmt.Sprintf("http://127.0.0.1:%d/v1/openapi.json", standing.V1))
	if err != nil {
		t.Fatal(err)
	}
	defer read.Body.Close()
	body, err := io.ReadAll(read.Body)
	if err != nil || read.StatusCode != http.StatusOK || !strings.Contains(string(body), "/values/") {
		t.Fatalf("/v1 answers %d, %v: %.200s", read.StatusCode, err, body)
	}
}

func TestGitsOwnIndexTurnsTheTrackedFlags(t *testing.T) {
	root := tree(t)
	run := func(argv ...string) {
		one := exec.Command("git", argv...)
		one.Dir = root
		if said, err := one.CombinedOutput(); err != nil {
			t.Fatalf("git %v: %s", argv, said)
		}
	}
	run("init", "-q")
	db := opened(t, root)
	if counted(t, db, `SELECT count(*) FROM file WHERE tracked = 1`) != 0 {
		t.Fatal("a repository tracking nothing marks rows tracked")
	}

	run("add", "spec/one.md")
	moved, err := Retracks(db, root)
	if err != nil {
		t.Fatal(err)
	}
	if moved != 1 || counted(t, db, `SELECT count(*) FROM file WHERE tracked = 1 AND path = 'spec/one.md'`) != 1 {
		t.Fatalf("git's list turns one flag, and it turns %d", moved)
	}
}
