package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/fsnotify/fsnotify"
)

// THE MODEL ANSWERS ON ITS SOCKET, AND A CLIENT THAT FINDS NONE WORKS COLD.
func TestTheModelAnswersOnItsSocketAndClientsGoColdWithoutIt(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	fed, stop := aFedDaemon(t, r, true)

	raw, _, ok := askModel(r, "ping", nil)
	if !ok {
		t.Fatal("the model did not answer a ping")
	}
	var pong struct {
		PID int `json:"pid"`
	}
	if json.Unmarshal(raw, &pong) != nil || pong.PID != os.Getpid() {
		t.Fatalf("the ping answered %s", raw)
	}

	// THE COPY CHECK GOES THROUGH THE MODEL, and the first scan has the file.
	two, _ := os.ReadFile(filepath.Join(r.Work, ".se", "work", "wk-two.md"))
	if from, found, answered := privateCopyViaModel(r, string(two)); !answered || !found || filepath.Base(from) != "wk-two.md" {
		t.Fatalf("the model answered %q %v %v for a file the scan indexed", from, found, answered)
	}
	// AND THE REVISION MOVES WITH THE TREE, on the event the watcher hands in.
	_, before, _ := askModel(r, "ping", nil)
	three := filepath.Join(r.Work, ".se", "work", "wk-three.md")
	if err := os.WriteFile(three, []byte("---\nkind: [[work-token]]\ntitle: the third\n---\n\n## detail\n\nBy hand.\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	fed.feed(three, fsnotify.Create)
	if _, after, ok := askModel(r, "ping", nil); !ok || after <= before {
		t.Fatalf("the revision was %d before the write and %d after", before, after)
	}

	// AN ASK THROUGH THE MODEL CANNOT WRITE, and answers rows when it reads.
	if _, _, ok := askModel(r, "ask", map[string]any{"sql": "DELETE FROM file"}); ok {
		t.Fatal("the model took a write")
	}
	got, err := Ask(r, AskParams{SQL: "SELECT count(*) AS n FROM file", Limit: 10})
	if err != nil || len(got.Rows) != 1 {
		t.Fatalf("an ask through the model answered %v %v", got, err)
	}

	// THE MODEL GOES, AND THE CLIENT GOES COLD: the same questions are
	// answered off the index file and the files.
	stop()
	if _, _, ok := askModel(r, "ping", nil); ok {
		t.Fatal("a stopped model answered")
	}
	if _, _, answered := privateCopyViaModel(r, string(two)); answered {
		t.Fatal("the copy check was answered by a model that is gone")
	}
	if from, yes := copyOfAPrivateOriginal(r, string(two)); !yes || filepath.Base(from) != "wk-two.md" {
		t.Fatalf("the cold path answered %q %v", from, yes)
	}
	// AND AN ASK WITH NO ENGINE IS REFUSED, and says how to start one.
	if _, err := Ask(r, AskParams{SQL: "SELECT count(*) AS n FROM file", Limit: 10}); err == nil || !strings.Contains(err.Error(), "se --work") {
		t.Fatalf("an ask with no engine answered %v", err)
	}
}

// A socket path too long for the platform lands in the temporary folder,
// and a short one under the private folder.
func TestTheSocketPathFitsThePlatform(t *testing.T) {
	t.Parallel()
	short := Roots{Work: filepath.Join(os.TempDir(), "short")}
	if got := socketPath(short); filepath.Dir(got) != short.Private() {
		t.Fatalf("a short path landed at %s", got)
	}
	deep := Roots{Work: filepath.Join(os.TempDir(), "a-folder-with-a-very-long-name-that-goes-on-and-on-and-on-and-on-and-on-and-on-and-on-and-on")}
	if got := socketPath(deep); len(got) >= socketPathLimit || filepath.Dir(got) == deep.Private() {
		t.Fatalf("a long path landed at %s", got)
	}
}
