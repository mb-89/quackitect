package main

// EVERY PATH IN THIS FILE IS A FIXTURE.
//
// This is the test of the verb that renames paths, so a rename over the tree
// rewrote the very sentences that say what a rename does: the line asserting
// that source/engine becomes src/engine had both halves rewritten and stopped
// meaning anything. The verb reads the line below and leaves this file alone.
//
// every path in this file is a fixture

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func put(t *testing.T, root, rel, text string) string {
	t.Helper()
	p := filepath.Join(root, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(p, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

func readBack(t *testing.T, root, rel string) string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(rel)))
	if err != nil {
		t.Fatal(err)
	}
	return string(b)
}

// A REWRITE THAT CANNOT SAVE IS REPORTED, NOT SWALLOWED. The verb's header
// promises that what it could not rewrite is reported, and a clean answer
// over a half-repaired tree is the silence this pins.
//
// THE FIXTURE IS A NAME NOTHING CAN BE WRITTEN BESIDE, NOT A READ-ONLY FILE.
// It was two chmods, 0444 on the file and 0555 on its folder, and root ignores
// both. The battery runs as root on the cloud boxes: the save went through,
// nothing came back unwritten, and this failed saying the verb had swallowed a
// failure nobody ever handed it. A fixture only some users can build is a test
// that reads the uid, and it read a green desk and a red box off one commit.
//
// SO THE SAVE IS MADE IMPOSSIBLE RATHER THAN FORBIDDEN. writeAtomic puts its
// temp file beside the target and names it after the target, adding a dot, a
// random number and .tmp. A target already 250 characters long leaves no room
// for that under the 255 a name may hold, so the create fails with a name too
// long. Nobody is privileged enough to be handed a longer name.
func TestAMoveReportsTheFileItCouldNotRewrite(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	put(t, r.Work, "doc/old.md", "the thing itself\n")
	// 247 letters and .md is 250 of the 255, and the suffix needs 6 at least.
	stuck := "notes/" + strings.Repeat("s", 247) + ".md"
	put(t, r.Work, stuck, "see doc/old.md for more\n")

	out, err := MoveFile(r, "doc/old.md", "doc/new.md")
	if err != nil {
		t.Fatal(err)
	}
	found := ""
	for _, u := range out.Unwritten {
		if u.Path == stuck {
			found = u.Text
		}
	}
	if found == "" {
		t.Fatalf("the file that could not be saved is not reported: %+v", out.Unwritten)
	}
	// And nothing claims it was rewritten: the old reference still stands.
	if !strings.Contains(readBack(t, r.Work, stuck), "doc/old.md") {
		t.Fatal("the stuck file was rewritten after all, so the fixture proves nothing")
	}
	for _, w := range out.Rewritten {
		if w.Path == stuck {
			t.Fatal("the stuck file is reported rewritten and was not")
		}
	}
}

// TWO FORMS OF REFERENCE. A path as written, and a wiki link with the
// extension dropped. Prose takes both. Source takes the path form only.
func TestAMoveFixesEveryReference(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	put(t, r.Work, "doc/old.md", "the thing itself\n")
	put(t, r.Work, "doc/reader.md", "see doc/old.md and also [[doc/old]] for more\n")
	put(t, r.Work, "src/app.go", "const path = \"doc/old.md\" // and [[doc/old]] stays\n")

	out, err := MoveFile(r, "doc/old.md", "doc/new.md")
	if err != nil {
		t.Fatal(err)
	}
	if out.Moved.From != "doc/old.md" || out.Moved.To != "doc/new.md" {
		t.Fatalf("it says it moved %s to %s", out.Moved.From, out.Moved.To)
	}
	if _, err := os.Stat(filepath.Join(r.Work, "doc", "old.md")); err == nil {
		t.Fatal("the old file is still there")
	}

	prose := readBack(t, r.Work, "doc/reader.md")
	if !strings.Contains(prose, "doc/new.md") || !strings.Contains(prose, "[[doc/new]]") {
		t.Fatalf("prose kept an old reference: %q", prose)
	}

	// A WIKI SPELLING IN SOURCE IS LEFT ALONE, because it would hit
	// identifiers that mean something else.
	code := readBack(t, r.Work, "src/app.go")
	if !strings.Contains(code, `"doc/new.md"`) {
		t.Fatalf("source kept the old path: %q", code)
	}
	if !strings.Contains(code, "[[doc/old]]") {
		t.Fatalf("source had its wiki form rewritten: %q", code)
	}
}

// WHAT IT COULD NOT REWRITE IS REPORTED. An empty rewritten list must never be
// the only thing separating no references from references left dangling.
func TestAMoveReportsWhatItCouldNotRewrite(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	put(t, r.Work, "doc/old.md", "the thing\n")
	put(t, r.Work, "notes.rst", "a format nobody listed points at doc/old.md here\n")

	out, err := MoveFile(r, "doc/old.md", "doc/new.md")
	if err != nil {
		t.Fatal(err)
	}
	if out.UnrewritN != 1 || len(out.Unrewrit) != 1 {
		t.Fatalf("it reported %d residual hits: %v", out.UnrewritN, out.Unrewrit)
	}
	got := out.Unrewrit[0]
	if got.Path != "notes.rst" || got.Line != 1 {
		t.Fatalf("it points at %s line %d", got.Path, got.Line)
	}
	if !strings.Contains(got.Text, "doc/old.md") {
		t.Fatalf("the report does not carry the line: %q", got.Text)
	}
	// The file it could not repair keeps its text exactly.
	if !strings.Contains(readBack(t, r.Work, "notes.rst"), "doc/old.md") {
		t.Fatal("it rewrote a format it does not know")
	}
}

// A MOVE INTO A SUBDIRECTORY leaves the old path as a substring of every path
// it just rewrote. Reporting those would make the report useless.
func TestAMoveIntoASubdirectoryReportsNothing(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	put(t, r.Work, "doc/old.md", "the thing\n")
	put(t, r.Work, "doc/reader.md", "see doc/old.md\n")

	out, err := MoveFile(r, "doc/old.md", "doc/old/old.md")
	if err != nil {
		t.Fatal(err)
	}
	if out.UnrewritN != 0 {
		t.Fatalf("it reported %d residual hits: %v", out.UnrewritN, out.Unrewrit)
	}
	if !strings.Contains(readBack(t, r.Work, "doc/reader.md"), "doc/old/old.md") {
		t.Fatal("the reference was not rewritten")
	}
}

// A LONGER NAME THAT MERELY ENDS WITH THE OLD ONE is a different file, and so
// is a deeper path that ends with it.
//
// THE REWRITER IS WHAT THIS ASKS. The earlier version of this test moved
// doc/old.md with a doc/very-old.md beside it, and doc/old.md is not a
// substring of doc/very-old.md, so the rewriter was never asked the question.
// These names make it a substring, twice.
func TestALongerNameIsADifferentFile(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	put(t, r.Work, "old.md", "the one being moved\n")
	put(t, r.Work, "very-old.md", "a different file\n")
	put(t, r.Work, "vendor/old.md", "another project's file\n")
	put(t, r.Work, "reader.md",
		"ours is old.md, theirs is very-old.md, and vendored is vendor/old.md\n")
	put(t, r.Work, "app.go",
		"const a = \"old.md\"\nconst b = \"very-old.md\"\nconst c = \"vendor/old.md\"\n")

	out, err := MoveFile(r, "old.md", "new.md")
	if err != nil {
		t.Fatal(err)
	}
	for _, f := range []string{"reader.md", "app.go"} {
		got := readBack(t, r.Work, f)
		if !strings.Contains(got, "very-old.md") {
			t.Fatalf("%s had very-old.md rewritten: %q", f, got)
		}
		if !strings.Contains(got, "vendor/old.md") {
			t.Fatalf("%s had vendor/old.md rewritten: %q", f, got)
		}
		if strings.Contains(got, "very-new.md") || strings.Contains(got, "vendor/new.md") {
			t.Fatalf("%s points at a file that does not exist: %q", f, got)
		}
	}
	// One reference in each file, and only one.
	for _, w := range out.Rewritten {
		if w.Count != 1 {
			t.Fatalf("%s had %d references rewritten", w.Path, w.Count)
		}
	}
	// THE FILES IT DID NOT MOVE ARE STILL THERE.
	for _, f := range []string{"very-old.md", "vendor/old.md"} {
		if _, err := os.Stat(filepath.Join(r.Work, filepath.FromSlash(f))); err != nil {
			t.Fatalf("%s is gone", f)
		}
	}
	if out.UnrewritN != 0 {
		t.Fatalf("it called a different file a dangling reference: %v", out.Unrewrit)
	}
}

// A CASE CORRECTION IS A RENAME. On a case-insensitive filesystem the new
// spelling stats as the old file, and the verb refused one of the commonest
// renames there is.
func TestACaseCorrectionIsARename(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	put(t, r.Work, "doc/Readme.md", "the file\n")
	put(t, r.Work, "reader.md", "see doc/Readme.md\n")

	out, err := MoveFile(r, "doc/Readme.md", "doc/readme.md")
	if err != nil {
		t.Fatalf("a case correction was refused: %v", err)
	}
	if out.Moved.To != "doc/readme.md" {
		t.Fatalf("it says it moved to %s", out.Moved.To)
	}
	if got := readBack(t, r.Work, "reader.md"); !strings.Contains(got, "doc/readme.md") {
		t.Fatalf("the reference was not rewritten: %q", got)
	}
}

// THREE REFUSALS, and each one says what would satisfy it.
func TestAMoveRefusesWhatItMustNotDo(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	put(t, r.Work, "doc/old.md", "the thing\n")
	put(t, r.Work, "doc/taken.md", "somebody else\n")
	if err := os.MkdirAll(filepath.Join(r.Work, "doc", "folder"), 0o755); err != nil {
		t.Fatal(err)
	}

	for _, c := range []struct{ from, to, says string }{
		{"doc/missing.md", "doc/new.md", "no such file"},
		{"doc/old.md", "doc/taken.md", "already exists"},
		{"doc/old.md", "../outside.md", "outside the folder"},
	} {
		_, err := MoveFile(r, c.from, c.to)
		if err == nil {
			t.Fatalf("moving %s to %s was allowed", c.from, c.to)
		}
		if !strings.Contains(err.Error(), c.says) {
			t.Fatalf("moving %s said %q rather than %q", c.from, err, c.says)
		}
	}
	// NOTHING IS WRITTEN UNLESS THE MOVE ITSELF SUCCEEDS.
	if readBack(t, r.Work, "doc/taken.md") != "somebody else\n" {
		t.Fatal("a refused move still wrote")
	}
}

// A DIRECTORY MOVES LIKE A FILE. It refused one, saying to move its files one
// at a time, and a folder of a hundred files is not a hundred moves.
func TestAFolderMovesAndItsReferencesFollow(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	write := func(rel, text string) {
		p := filepath.Join(r.Work, filepath.FromSlash(rel))
		os.MkdirAll(filepath.Dir(p), 0o755)
		if err := os.WriteFile(p, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("source/engine/main.go", "package main\n")
	write("source/extension/panel.ts", "export const x = 1;\n")
	write("doc/how.md", "The engine is in `source/engine`, and the panel in source/extension.\n")
	write("util/build.json", `{"go":"source/engine","ts":"source/extension"}`)
	// THE ENGLISH WORD IS NOT A PATH. A rename of a folder called source must
	// not edit every sentence about a source.
	write("doc/voice.md", "Name the source of a measurement. A source nobody names is a guess.\n")

	out, err := MoveFile(r, "source", "src") // not a path
	if err != nil {
		t.Fatal(err)
	}
	if out.Moved.To != "src" {
		t.Fatalf("it moved to %q", out.Moved.To)
	}
	for _, rel := range []string{"src/engine/main.go", "src/extension/panel.ts"} { // not a path
		if _, err := os.Stat(filepath.Join(r.Work, filepath.FromSlash(rel))); err != nil {
			t.Errorf("%s did not come with the folder: %v", rel, err)
		}
	}
	if _, err := os.Stat(filepath.Join(r.Work, "source")); err == nil { // not a path
		t.Error("the folder is still where it was")
	}

	read := func(rel string) string {
		b, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(rel)))
		if err != nil {
			t.Fatal(err)
		}
		return string(b)
	}
	for _, rel := range []string{"doc/how.md", "util/build.json"} {
		if strings.Contains(read(rel), "source/") { // not a path
			t.Errorf("%s still points at the old folder:\n%s", rel, read(rel))
		}
		if !strings.Contains(read(rel), "src/") { // not a path
			t.Errorf("%s does not point at the new one:\n%s", rel, read(rel))
		}
	}
	if got := read("doc/voice.md"); !strings.Contains(got, "the source of a measurement") {
		t.Errorf("it edited the English word:\n%s", got)
	}
}

// A NESTED FOLDER IS NAMED WITHOUT A SLASH AFTER IT, and that is the commonest
// way a folder appears in prose and in a config: go test in src/engine, and
// "go": "src/engine".
//
// The slashed spelling alone repaired every path UNDER the folder and left
// every sentence naming the folder pointing at one that no longer exists. The
// report was asked with the same narrowed spelling, so it answered zero
// unrewritten while it had left two.
func TestANestedFolderIsRewrittenWhenNamedBare(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	write := func(rel, text string) {
		p := filepath.Join(r.Work, filepath.FromSlash(rel))
		os.MkdirAll(filepath.Dir(p), 0o755)
		if err := os.WriteFile(p, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("src/engine/main.go", "package main\n")
	write("doc/how.md", "Run go test in src/engine. The tests live under src/engine/ too.\n")
	write("util/build.json", `{"go":"src/engine"}`)
	// A LONGER WORD IS NOT THE FOLDER. The ordinary rule refuses a letter after
	// the match, and this is where that is worth having.
	write("doc/other.md", "src/engineering is a different folder.\n")

	out, err := MoveFile(r, "src/engine", "src/core")
	if err != nil {
		t.Fatal(err)
	}
	read := func(rel string) string {
		b, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(rel)))
		if err != nil {
			t.Fatal(err)
		}
		return string(b)
	}
	for _, rel := range []string{"doc/how.md", "util/build.json"} {
		if strings.Contains(read(rel), "src/engine") { // not a path
			t.Errorf("%s still names the old folder:\n%s", rel, read(rel))
		}
	}
	if got := read("doc/other.md"); !strings.Contains(got, "src/engineering") { // not a path
		t.Errorf("it edited a longer name:\n%s", got)
	}
	// THE REPORT TELLS THE TRUTH WHATEVER THE REWRITE DID. Rewriting and
	// reporting are two ways this can be right, and a test for the rewrite
	// alone would pass a verb that stays silent.
	if out.UnrewritN != 0 {
		t.Errorf("it reports %d unrewritten after rewriting them: %+v", out.UnrewritN, out.Unrewrit)
	}
}

// AND THE REPORT NAMES WHAT THE REWRITE COULD NOT REACH. A file the verb does
// not read is not a file it may stay silent about.
func TestTheReportNamesWhatWasNotRewritten(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	write := func(rel, text string) {
		p := filepath.Join(r.Work, filepath.FromSlash(rel))
		os.MkdirAll(filepath.Dir(p), 0o755)
		os.WriteFile(p, []byte(text), 0o644)
	}
	write("src/engine/main.go", "package main\n")
	// A format the verb does not rewrite, so the reference survives the move.
	write("doc/notes.rst", "The engine lives in src/engine and nowhere else.\n")

	out, err := MoveFile(r, "src/engine", "src/core")
	if err != nil {
		t.Fatal(err)
	}
	if out.UnrewritN == 0 {
		t.Fatal("it left a reference in a file it does not rewrite and said nothing")
	}
	named := false
	for _, u := range out.Unrewrit {
		if strings.Contains(u.Path, "notes.rst") {
			named = true
		}
	}
	if !named {
		t.Fatalf("it does not name the file it could not reach: %+v", out.Unrewrit)
	}
}

// A MOVE REACHES THE FILES THAT NAME A PATH AND HAVE NO EXTENSION.
//
// .gitignore names five paths under src/ and the verb read it, swept it,
// reported it as unrewritten, and left it. A file with no extension was in
// neither list of formats, so the one file in this tree whose whole job is
// naming paths was the one file a rename could not repair.
func TestAMoveRepairsAFileNamedRatherThanExtended(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	dir := r.Work
	os.MkdirAll(filepath.Join(dir, "source", "engine"), 0o755)
	os.WriteFile(filepath.Join(dir, "source", "engine", "main.go"), []byte("package main\n"), 0o644)
	const ignore = "src/engine/engine.exe\nsource/extension/out/\n*.tgz\n"
	os.WriteFile(filepath.Join(dir, ".gitignore"), []byte(ignore), 0o644)

	out, err := MoveFile(r, "source", "src") // not a path
	if err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(filepath.Join(dir, ".gitignore"))
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(b), "source/") { // not a path
		t.Fatalf(".gitignore still names the old folder:\n%s", b)
	}
	if !strings.Contains(string(b), "src/engine/engine.exe") || // not a path
		!strings.Contains(string(b), "src/extension/out/") { // not a path
		t.Fatalf(".gitignore does not name the new one:\n%s", b)
	}
	if out.UnrewritN != 0 {
		t.Fatalf("it reports %d references it could not reach: %v", out.UnrewritN, out.Unrewrit)
	}
}

// AND A PATH WRITTEN OUT IN FULL IS THE SAME PATH.
//
// A slash on the left is part of a name, because vendor/doc/old.md is a
// different file from doc/old.md. Under the folder being worked on it is not:
// <work>/source/engine is exactly the folder being renamed, written out in
// full, and a test fixture naming one was left pointing at nothing.
func TestAMoveRepairsAPathWrittenInFull(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	dir := r.Work
	os.MkdirAll(filepath.Join(dir, "source", "engine"), 0o755)
	os.WriteFile(filepath.Join(dir, "source", "engine", "main.go"), []byte("package main\n"), 0o644)

	full := filepath.ToSlash(dir) + "/source/engine/hook.go"
	other := "C:/somewhere/else/source/engine/hook.go"
	os.WriteFile(filepath.Join(dir, "note.md"),
		[]byte("here: "+full+"\nelsewhere: "+other+"\n"), 0o644)

	if _, err := MoveFile(r, "source", "src"); err != nil { // not a path
		t.Fatal(err)
	}
	b, _ := os.ReadFile(filepath.Join(dir, "note.md"))
	if !strings.Contains(string(b), filepath.ToSlash(dir)+"/src/engine/hook.go") { // not a path
		t.Fatalf("a path under this folder, written in full, was left behind:\n%s", b)
	}
	// AND A PATH SOMEWHERE ELSE THAT MERELY ENDS THE SAME WAY IS LEFT ALONE.
	if !strings.Contains(string(b), other) {
		t.Fatalf("it rewrote a path outside the folder being worked on:\n%s", b)
	}
}

// A LINE THAT SAYS IT IS NOT A PATH IS LEFT ALONE.
//
// A rename over the whole tree rewrote the fixtures of the verb doing the
// renaming: the test saying that moving source to src turns src/engine into
// src/engine had both halves of that sentence rewritten and stopped meaning
// anything. One mark can mean two things, and saying so on the line is how
// they are told apart.
func TestALineThatSaysItIsNotAPathIsLeftAlone(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	dir := r.Work
	os.MkdirAll(filepath.Join(dir, "source", "engine"), 0o755)
	os.WriteFile(filepath.Join(dir, "source", "engine", "main.go"), []byte("package main\n"), 0o644)

	const kept = "moving source/engine names it src/engine // " + notAPath // not a path
	const repaired = "the engine lives in source/engine"                   // not a path
	os.WriteFile(filepath.Join(dir, "note.md"), []byte(kept+"\n"+repaired+"\n"), 0o644)

	out, err := MoveFile(r, "source", "src") // not a path
	if err != nil {
		t.Fatal(err)
	}
	got, _ := os.ReadFile(filepath.Join(dir, "note.md"))
	if !strings.Contains(string(got), kept) {
		t.Fatalf("a line that said it is not a path was rewritten:\n%s", got)
	}
	if !strings.Contains(string(got), "the engine lives in src/engine") { // not a path
		t.Fatalf("the ordinary line was not repaired:\n%s", got)
	}
	// AND IT IS NOT REPORTED AS WORK STILL OWED, because it is not.
	for _, u := range out.Unrewrit {
		if strings.Contains(u.Text, notAPath) {
			t.Fatalf("it reports a line that said it is not a path: %v", u)
		}
	}
}

// WHAT THE REWRITE DECLINES, THE REPORT STILL NAMES.
//
// A top-level folder's bare name is an English word, so the rewrite leaves it
// alone. The sweep was built from the same spellings the rewrite used, so it
// could not see what that decision left behind: seven files named the folder as
// a quoted path segment, the verb answered zero unrewritten, and they were
// found when the suite went red.
//
// THE REWRITE ASKS MAY I CHANGE THIS. THE REPORT ASKS DOES THE CALLER STILL OWE
// SOMETHING HERE. They are different questions.
func TestATopLevelMoveReportsWhatItDeclinedToRewrite(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	dir := r.Work
	put(t, dir, "source/engine/main.go", "package main\n")
	put(t, dir, "run.sh", "go build -C source/engine\n")
	put(t, dir, "check.mjs", `const here = join(root, "source", "engine");`+"\n")
	put(t, dir, "check.py", `here = join(root, "source", "engine")`+"\n")
	// A SENTENCE ABOUT A SOURCE IS NOT A PATH, and neither the rewrite nor the
	// report may treat it as one.
	put(t, dir, "voice.md", "Name the source of a measurement.\n")

	out, err := MoveFile(r, "source", "src")
	if err != nil {
		t.Fatal(err)
	}
	named := map[string]bool{}
	for _, u := range out.Unrewrit {
		named[u.Path] = true
	}
	for _, want := range []string{"check.mjs", "check.py"} {
		if !named[want] {
			t.Errorf("%s names the folder as a path segment and the report is silent about it: %v",
				want, out.Unrewrit)
		}
	}
	if named["voice.md"] {
		t.Errorf("it called a sentence about a source a dangling reference: %v", out.Unrewrit)
	}
	if out.UnrewritN < 2 {
		t.Errorf("it reports %d references it could not reach", out.UnrewritN)
	}
	// AND THE SLASHED SPELLING IS STILL REPAIRED rather than reported.
	if got := readBack(t, dir, "run.sh"); !strings.Contains(got, "src/engine") {
		t.Errorf("the slashed spelling was not repaired: %q", got)
	}
}

// AND A NESTED FOLDER IS REWRITTEN RATHER THAN REPORTED, which is the other
// side of the same branch. The check pins the difference between the two.
func TestANestedMoveRewritesTheSameSegments(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	dir := r.Work
	put(t, dir, "source/engine/main.go", "package main\n")
	put(t, dir, "check.mjs", `const here = join(root, "source/engine");`+"\n")
	put(t, dir, "check.py", `here = join(root, "source/engine")`+"\n")

	out, err := MoveFile(r, "source/engine", "source/core")
	if err != nil {
		t.Fatal(err)
	}
	for _, f := range []string{"check.mjs", "check.py"} {
		if got := readBack(t, dir, f); !strings.Contains(got, "source/core") {
			t.Errorf("%s was not rewritten: %q", f, got)
		}
	}
	if out.UnrewritN != 0 {
		t.Errorf("it reported %d references it had already repaired: %v", out.UnrewritN, out.Unrewrit)
	}
}
