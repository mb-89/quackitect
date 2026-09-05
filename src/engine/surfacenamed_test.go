package main

import (
	"encoding/json"
	"os"
	"strings"
	"testing"
)

// THE RECORD SAYS WHICH SURFACE DROVE THE SESSION.
//
// No line said which harness posted the event. A spike had to attribute every
// line by matching its timestamp against the entrypoint field in the harness's
// own transcript files under the user's home folder, which a cloud box does not
// have and which nothing in the tree keeps.
//
// THE EVENT'S OWN ENVIRONMENT IS WHAT IT CARRIES. The harness spawns the hook
// for the event it is announcing, so what that process was handed is what this
// session was started from. Anything else is a second source, matched back by
// timestamp, in a folder a cloud box does not have.

// theSurfaceOnTheSessionLine reads the log back and answers what the last
// session line says it was started from, because the record is the product
// here and not the function behind it.
func theSurfaceOnTheSessionLine(t *testing.T, path string) (string, bool) {
	t.Helper()
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	said, found := "", false
	for _, line := range strings.Split(string(b), "\n") {
		var rec struct {
			Kind string         `json:"kind"`
			Msg  string         `json:"msg"`
			Data map[string]any `json:"data"`
		}
		if json.Unmarshal([]byte(line), &rec) != nil {
			continue
		}
		if rec.Kind != "session" || !strings.HasPrefix(rec.Msg, "session started") {
			continue
		}
		if surface, ok := rec.Data["surface"]; ok {
			said, found = surface.(string), true
		}
	}
	return said, found
}

func TestASessionLineNamesTheSurface(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()

	// EVERY WAY THE SURFACE CAN BE SAID, DRIVEN THROUGH ONE TABLE. A harness
	// names its surface with a variable of its own, a box the table does not
	// know is told by hand, and a box nothing said about says so.
	for _, one := range []struct {
		says       string
		byHand     string
		entrypoint string
		want       string
	}{
		{"the harness said it", "", "remote_desktop", "remote_desktop"},
		{"a person said it", "a desk over ssh", "", "a desk over ssh"},
		{"the hand wins", "a desk over ssh", "remote_desktop", "a desk over ssh"},
		{"nothing said", "", "", "unknown"},
	} {
		t.Setenv("SE_SURFACE", one.byHand)
		t.Setenv("CLAUDE_CODE_ENTRYPOINT", one.entrypoint)
		arrive(t, r, log, "s-surface")
		got, found := theSurfaceOnTheSessionLine(t, log.Path())
		if !found {
			t.Fatalf("%s: no session line says what surface it was started from, so the "+
				"record still cannot answer it about itself", one.says)
		}
		if got != one.want {
			t.Errorf("%s: the session line says the surface is %q, want %q", one.says, got, one.want)
		}
	}
}
