package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// The editor's list holds every extension the person has. A careless write
// loses somebody else's work, so nothing that was there may vanish.
func TestRegisteringWithTheEditorKeepsEveryOtherExtension(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	dir := filepath.Join(home, ".vscode", "extensions")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	existing := `[{"identifier":{"id":"ms-python.python","uuid":"abc"},"version":"2024.1.0","weird":{"kept":true}}]`
	listPath := filepath.Join(dir, "extensions.json")
	os.WriteFile(listPath, []byte(existing), 0o644)

	if err := registerWithEditor(filepath.Join(dir, "quackitect.quackitect-0.1.0"), "quackitect"); err != nil {
		t.Fatal(err)
	}
	b, _ := os.ReadFile(listPath)
	var entries []map[string]any
	if err := json.Unmarshal(b, &entries); err != nil {
		t.Fatal(err)
	}
	ids := map[string]bool{}
	for _, e := range entries {
		ids[e["identifier"].(map[string]any)["id"].(string)] = true
	}
	if !ids["ms-python.python"] {
		t.Fatal("another extension was lost")
	}
	if !ids["quackitect.quackitect"] {
		t.Fatal("ours was not added")
	}
	// A field this program does not understand is still there.
	for _, e := range entries {
		if e["identifier"].(map[string]any)["id"] == "ms-python.python" {
			if e["weird"] == nil {
				t.Fatal("a field we do not understand was dropped")
			}
		}
	}
	if _, err := os.Stat(listPath + ".before-quackitect"); err != nil {
		t.Fatal("the list was changed without a backup")
	}
}

// A second run adds nothing.
func TestRegisteringTwiceLeavesOneEntry(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	dir := filepath.Join(home, ".vscode", "extensions")
	os.MkdirAll(dir, 0o755)
	dest := filepath.Join(dir, "quackitect.quackitect-0.1.0")
	for i := 0; i < 3; i++ {
		if err := registerWithEditor(dest, "quackitect"); err != nil {
			t.Fatal(err)
		}
	}
	b, _ := os.ReadFile(filepath.Join(dir, "extensions.json"))
	var entries []map[string]any
	json.Unmarshal(b, &entries)
	if len(entries) != 1 {
		t.Fatalf("expected one entry after three runs, got %d", len(entries))
	}
}

// An unreadable list is left alone. Half of somebody's extensions is worse
// than none of ours.
func TestAnUnreadableListIsLeftAlone(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	dir := filepath.Join(home, ".vscode", "extensions")
	os.MkdirAll(dir, 0o755)
	listPath := filepath.Join(dir, "extensions.json")
	os.WriteFile(listPath, []byte("{not json"), 0o644)
	if err := registerWithEditor(filepath.Join(dir, "x"), "quackitect"); err == nil {
		t.Fatal("should refuse")
	}
	b, _ := os.ReadFile(listPath)
	if string(b) != "{not json" {
		t.Fatal("the list was changed anyway")
	}
}

// UC-1. An entry in the register that no longer resolves is skipped. No
// error, no crash.
func TestTheRegisterSkipsWhatItCannotFind(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	path := filepath.Join(home, "registry.json")
	real := t.TempDir()
	os.WriteFile(path, []byte(`[
	  {"id":"gone","version":"0.1.0","method_root":"/no/such/place"},
	  {"id":"here","version":"0.1.0","method_root":"`+filepath.ToSlash(real)+`"}
	]`), 0o644)
	got := ReadRegister(path)
	if len(got) != 1 || got[0].ID != "here" {
		t.Fatalf("expected only the entry that resolves, got %+v", got)
	}
}

// UC-2. Two copies register themselves, and both are found.
func TestTwoCopiesBothRegister(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	path := filepath.Join(home, "registry.json")
	a, b := t.TempDir(), t.TempDir()
	if err := writeRegister(path, "quackitect", "0.1.0", a); err != nil {
		t.Fatal(err)
	}
	if err := writeRegister(path, "quackitect", "0.1.0", b); err != nil {
		t.Fatal(err)
	}
	got := ReadRegister(path)
	if len(got) != 2 {
		t.Fatalf("expected two copies, got %d", len(got))
	}
	// And registering the same copy again does not make a third.
	writeRegister(path, "quackitect", "0.1.0", a)
	if got = ReadRegister(path); len(got) != 2 {
		t.Fatalf("a second run of the same copy added an entry: %d", len(got))
	}
}

// The editor writes its own entries with a lower-case drive letter. An entry
// that does not look like the others is one it may not match to the folder.
func TestTheDriveLetterMatchesWhatTheEditorWrites(t *testing.T) {
	got := locationPath(`C:\Users\x\.vscode\extensions\quackitect.quackitect-0.1.0`)
	if runtimeIsWindows() && got != "/c:/Users/x/.vscode/extensions/quackitect.quackitect-0.1.0" {
		t.Fatalf("got %s", got)
	}
	if !runtimeIsWindows() && got == "" {
		t.Fatal("empty")
	}
}

// The bootstrap scripts declare no flags of their own. They hand everything
// through to this program, so every flag written anywhere in the tree has to
// be a flag this program actually has. RUNME.sh once called install.sh with
// --headless, which was never a flag here, and nothing caught it because the
// only place that said otherwise was a comment.
func TestEveryFlagHandedToTheInstallerExists(t *testing.T) {
	root := filepath.Join("..", "..")
	call := regexp.MustCompile(`install\.(?:sh|ps1)"?\)?((?:[ \t]+--?[a-z][a-z-]*(?:[ \t]+[a-z]+)?)+)`)
	flagName := regexp.MustCompile(`--?([a-z][a-z-]*)`)

	var checked int
	err := filepath.WalkDir(root, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		if d.IsDir() {
			switch d.Name() {
			case ".git", "node_modules", ".bin", ".se", "_to_delete":
				return filepath.SkipDir
			}
			return nil
		}
		switch filepath.Ext(p) {
		case ".sh", ".ps1", ".go", ".md":
		default:
			return nil
		}
		if filepath.Base(p) == "setup_test.go" {
			return nil
		}
		b, err := os.ReadFile(p)
		if err != nil {
			return nil
		}
		for _, m := range call.FindAllStringSubmatch(string(b), -1) {
			for _, f := range flagName.FindAllStringSubmatch(m[1], -1) {
				name := f[1]
				if name == "help" || name == "h" {
					continue // the flag package answers this one itself
				}
				checked++
				if flag.Lookup(name) == nil {
					t.Errorf("%s hands --%s to the installer, which has no such flag", p, name)
				}
			}
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if checked == 0 {
		t.Fatal("no call to a bootstrap script was found, so this test proves nothing")
	}
}

// --help is the only place the flags are written down, so it has to name all
// of them. A flag added without a description would be invisible.
func TestTheHelpNamesEveryFlag(t *testing.T) {
	var out bytes.Buffer
	flag.CommandLine.SetOutput(&out)
	defer flag.CommandLine.SetOutput(os.Stderr)
	usage()
	text := out.String()
	var seen int
	flag.VisitAll(func(f *flag.Flag) {
		seen++
		if !strings.Contains(text, "-"+f.Name) {
			t.Errorf("--help does not name --%s", f.Name)
		}
		if f.Usage == "" {
			t.Errorf("--%s has no description, so --help says nothing about it", f.Name)
		}
	})
	if seen == 0 {
		t.Fatal("no flags were declared, so this test proves nothing")
	}
}
