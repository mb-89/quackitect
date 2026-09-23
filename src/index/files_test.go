// The rows a reader of the whole tree takes: the list with its hashes and the
// tracked flag, and the texts it names.
// [[spec/design_output/index#a-reader-takes-the-tree]]
package main

import (
	"os/exec"
	"testing"
)

func TestTheListNamesEveryPathWithItsHashAndAFolderGitHoldsNowhereTracksThemAll(t *testing.T) {
	root := tree(t)
	write(t, root, "src/stub/.claude-plugin/plugin.json", "{\"name\": \"level0\"}\n")
	db := opened(t, root)

	held, err := Files(db)
	if err != nil {
		t.Fatal(err)
	}
	seen := map[string]Held{}
	for _, one := range held {
		seen[one.Path] = one
	}
	for _, path := range []string{"spec/one.md", "src/plain.js", "src/stub/.claude-plugin/plugin.json"} {
		one, ok := seen[path]
		if !ok || one.Hash == "" || !one.Tracked {
			t.Fatalf("%s stands in the list with a hash, tracked, and it answers %+v", path, one)
		}
	}
	if _, ok := seen[".se/.runtime/skipped.md"]; ok {
		t.Fatal("the runtime half stands in the list")
	}
}

func TestAFolderGitHoldsMarksTheRowsItTracks(t *testing.T) {
	root := tree(t)
	for _, argv := range [][]string{{"init", "-q"}, {"add", "spec/one.md"}} {
		run := exec.Command("git", argv...)
		run.Dir = root
		if said, err := run.CombinedOutput(); err != nil {
			t.Fatalf("git %v: %s", argv, said)
		}
	}
	db := opened(t, root)

	held, err := Files(db)
	if err != nil {
		t.Fatal(err)
	}
	for _, one := range held {
		if one.Tracked != (one.Path == "spec/one.md") {
			t.Fatalf("%s reads tracked %v, and git tracks spec/one.md alone", one.Path, one.Tracked)
		}
	}
}

func TestTheTextsAnswerThePathsNamedOrEveryPath(t *testing.T) {
	db := opened(t, tree(t))

	named, err := Texts(db, []string{"src/plain.js", "nowhere.md"})
	if err != nil {
		t.Fatal(err)
	}
	if len(named) != 1 || named["src/plain.js"] != "// a line the search finds\nconst said = 1;\n" {
		t.Fatalf("the texts answer the one path standing, and they answer %v", named)
	}
	every, err := Texts(db, nil)
	if err != nil {
		t.Fatal(err)
	}
	if every["spec/two.md"] == "" || len(every) < 4 {
		t.Fatalf("no path named answers every path, and it answers %d", len(every))
	}
}
