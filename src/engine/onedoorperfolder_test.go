package main

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"
)

// ONE FOLDER ANSWERS ONE DOOR, HOWEVER THE FOLDER IS SPELLED.
//
// hooksPort hashes the work root so the cage can name the URL before any engine
// starts, and so every engine over one folder binds the same port. That holds
// only while the path is one string, and it is not.
//
// WHAT IT COST. A session was handed this tree as c: and then as C:, which
// Windows means the same folder by. The two spellings hashed to two ports, the
// engine restarted onto the second, and the settings file was rewritten. The
// harness had read that file once and went on posting to the first. Every guard
// rides on that door, so all of them were absent for an hour and nothing said
// so: a Bash call the command guard had refused went straight through.
//
// THE TABLE IS THE RULE, and it is about spelling rather than about drive
// letters. A trailing separator and a forward slash are the same folder too,
// and each one would move the door the same way.
func TestOneFolderAnswersOneDoor(t *testing.T) {
	for _, one := range []struct {
		what  string
		paths []string
	}{
		{
			what:  "the drive letter in either case",
			paths: []string{`c:\Users\mb\Desktop\ai\quackitect-v4`, `C:\Users\mb\Desktop\ai\quackitect-v4`},
		},
		{
			what:  "a trailing separator or none",
			paths: []string{`C:\Users\mb\tree`, `C:\Users\mb\tree\`},
		},
		{
			what:  "forward slashes or back",
			paths: []string{`C:\Users\mb\tree`, `C:/Users/mb/tree`},
		},
		{
			what:  "a doubled separator inside",
			paths: []string{`C:\Users\mb\tree`, `C:\Users\\mb\tree`},
		},
	} {
		want := hooksPort(Roots{Work: one.paths[0]})
		for _, p := range one.paths[1:] {
			if got := hooksPort(Roots{Work: p}); got != want {
				t.Errorf("%s: %q answers %d and %q answers %d, so one folder grew two doors",
					one.what, one.paths[0], want, p, got)
			}
		}
	}

	// AND TWO FOLDERS STILL ANSWER TWO DOORS. A canonical form that flattened
	// every path to one port would pass every row above and be useless.
	if hooksPort(Roots{Work: `C:\Users\mb\one`}) == hooksPort(Roots{Work: `C:\Users\mb\two`}) {
		t.Error("two folders answer one door, so the port says nothing about which tree it is")
	}

	// AND THE SPELLING RULE IS WINDOWS'S, SO IT IS NOT APPLIED TO A POSIX PATH.
	// A backslash is an ordinary character in a POSIX name, and folding it on
	// every platform merged two real trees onto one door: the second engine
	// cannot bind that port, runs with no door, and every guard over that tree is
	// absent with nothing saying so. That is the class this test exists to shut,
	// arriving from the other side.
	for _, two := range []struct {
		what  string
		paths [2]string
	}{
		{
			what:  "a backslash in a POSIX name is a character, not a separator",
			paths: [2]string{`/home/u/a\b`, "/home/u/a/b"},
		},
	} {
		if got, other := hooksPort(Roots{Work: two.paths[0]}), hooksPort(Roots{Work: two.paths[1]}); got == other {
			t.Errorf("%s: %q and %q both answer %d, so two folders grew one door",
				two.what, two.paths[0], two.paths[1], got)
		}
	}
}

// A START WRITES NOTHING NEW INTO THE SETTINGS FILE.
//
// The harness reads that file once, when the session begins. Anything in it
// that moves between starts is stale from the next start on, and nothing says
// so. The port was such a value. This holds the door shut against the next one.
func TestAStartLeavesTheSettingsAsTheyWere(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	cage, err := os.ReadFile(filepath.Join("..", "..", "util", "cage", "claude-settings.json"))
	if err != nil {
		t.Fatal(err)
	}
	os.MkdirAll(filepath.Join(r.Method, "util", "cage"), 0o755)
	os.WriteFile(filepath.Join(r.Method, "util", "cage", "claude-settings.json"), cage, 0o644)
	os.WriteFile(filepath.Join(r.Method, "util", "projections.json"), []byte(`{"projections":[
	  {"name":"claude cage","target":".claude/settings.json","sources":["util/cage/claude-settings.json"],"wrap":"none"}
	]}`), 0o644)

	at := filepath.Join(r.Work, ".claude", "settings.json")
	if _, err := Project(r); err != nil {
		t.Fatal(err)
	}
	before, err := os.ReadFile(at)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Project(r); err != nil {
		t.Fatal(err)
	}
	after, err := os.ReadFile(at)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(before, after) {
		t.Error("a second start changed the settings file, so the harness that read the first one is now wrong")
	}
}
