// The rows a reader of the whole tree takes: the list with its hashes and the
// tracked flag, and the texts it names.
// [[spec/design_output/index#a-reader-takes-the-tree]]
package index

import "testing"

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
	db := openedWith(t, tree(t), func(rel string) bool { return rel == "spec/one.md" })

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

// The hash reads the text as the engine's hashText does, so a note hashed on either side matches. [[spec/design_output/pull#an-input-marks-its-steps]]
func TestHashesAnswersTheHashOfEachPath(t *testing.T) {
	db := opened(t, tree(t))

	said, err := Hashes(db, []HashAsk{{Path: "src/plain.js", Size: 10}, {Path: "nowhere.md"}})
	if err != nil {
		t.Fatal(err)
	}
	one, ok := said["src/plain.js"]
	if !ok || len(said) != 1 {
		t.Fatalf("the hashes answer the one path standing, and they answer %v", said)
	}
	if one.Hash != "8f93e4f24776ff1d" || one.Size != 43 {
		t.Fatalf("the hash and the size match hashText over the text, and they read %v", one)
	}
	if one.Head != "e0ce802675de49b5" {
		t.Fatalf("the head hashes the first ten units, and it reads %q", one.Head)
	}
}

// The hashes hashText in .claude/skills/level0/lib/hash.js answers, which the viewer's stamp reads. [[spec/design_output/tui#the-verb-builds-it]]
func TestHashTextMatchesJavaScript(t *testing.T) {
	for text, want := range map[string]string{
		"":                 "811c9dc59e3779b9",
		"abc":              "1a47e90b6898d0cd",
		"a\x1fé\U0001F600": "3aefc6a53ac2a999",
	} {
		if said := HashText(text); said != want {
			t.Errorf("%q hashes %s, want %s", text, said, want)
		}
	}
}
