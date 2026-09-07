package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"io"
	"io/fs"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"slices"
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

// The manifest pins the C compiler by version and by hash, for every
// platform the installer runs on. A pin with a hole is a download nobody
// checked.
func TestTheManifestPinsTheCompiler(t *testing.T) {
	t.Parallel()
	m, err := readManifest("manifest.json")
	if err != nil {
		t.Fatal(err)
	}
	cc, ok := m.Tools[m.CC]
	if !ok || cc.Archive == nil {
		t.Fatalf("cc %q is not an archive in the manifest", m.CC)
	}
	if cc.Archive.Version == "" {
		t.Error("the compiler has no version")
	}
	for _, profile := range []string{"desktop", "headless"} {
		if !slices.Contains(m.Profiles[profile], m.CC) {
			t.Errorf("profile %s does not install %s", profile, m.CC)
		}
	}
	hex64 := regexp.MustCompile(`^[0-9a-f]{64}$`)
	for _, platform := range []string{"windows/amd64", "linux/amd64"} {
		t.Run(platform, func(t *testing.T) {
			t.Parallel()
			a, ok := cc.Archive.Platforms[platform]
			if !ok {
				t.Fatalf("no archive for %s", platform)
			}
			if !strings.Contains(a.URL, cc.Archive.Version) {
				t.Errorf("url %s does not carry the version %s", a.URL, cc.Archive.Version)
			}
			if !hex64.MatchString(a.SHA256) {
				t.Errorf("sha256 %q is not 64 lower-case hex digits", a.SHA256)
			}
			if a.Size <= 0 {
				t.Errorf("size %d is no size", a.Size)
			}
		})
	}
}

func TestCheckSum(t *testing.T) {
	t.Parallel()
	const sum = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
	tests := []struct {
		name, got, want string
		refused         bool
	}{
		{name: "same", got: sum, want: sum},
		{name: "publisher printed upper case", got: sum, want: strings.ToUpper(sum)},
		{name: "one digit off", got: sum, want: sum[:63] + "e", refused: true},
		{name: "nothing pinned", got: sum, want: "", refused: true},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			err := checkSum(tc.got, tc.want)
			if (err != nil) != tc.refused {
				t.Errorf("checkSum(%q, %q) = %v, refused %v", tc.got, tc.want, err, tc.refused)
			}
		})
	}
}

// hashInto answers the sha256 of what passed through, on the known vector.
func TestHashInto(t *testing.T) {
	t.Parallel()
	var out bytes.Buffer
	got, n, err := hashInto(&out, strings.NewReader("abc"))
	if err != nil {
		t.Fatal(err)
	}
	if want := "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"; got != want {
		t.Errorf("got %s, want %s", got, want)
	}
	if n != 3 || out.String() != "abc" {
		t.Errorf("copied %d bytes %q, want 3 bytes abc", n, out.String())
	}
}

// A download is kept only when it hashes to the pin and is no larger than
// the pin says. Anything else is removed, so a second run starts clean.
func TestADownloadIsKeptOnlyWhenItMatchesThePin(t *testing.T) {
	t.Parallel()
	body := "abc"
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/missing" {
			http.NotFound(w, r)
			return
		}
		io.WriteString(w, body)
	}))
	t.Cleanup(srv.Close)
	const sum = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
	tests := []struct {
		name string
		art  Artifact
		kept bool
	}{
		{name: "matches", art: Artifact{URL: srv.URL + "/a", SHA256: sum, Size: 3}, kept: true},
		{name: "wrong hash", art: Artifact{URL: srv.URL + "/a", SHA256: strings.Repeat("0", 64), Size: 3}},
		{name: "larger than pinned", art: Artifact{URL: srv.URL + "/a", SHA256: sum, Size: 2}},
		{name: "not there", art: Artifact{URL: srv.URL + "/missing", SHA256: sum, Size: 3}},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			dest := filepath.Join(t.TempDir(), "a.download")
			err := download(tc.art, dest)
			if (err == nil) != tc.kept {
				t.Errorf("download = %v, kept %v", err, tc.kept)
			}
			_, statErr := os.Stat(dest)
			if (statErr == nil) != tc.kept {
				t.Errorf("file present %v, want %v", statErr == nil, tc.kept)
			}
		})
	}
}

// The env file is two KEY=value lines, the compiler first, so a shell reads
// it line by line and go reads CC as a command line.
func TestCgoEnv(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name, cc string
		want     []string
	}{
		{name: "plain path", cc: `C:\tools\zig-0.16.0\zig.exe`,
			want: []string{`CC=C:\tools\zig-0.16.0\zig.exe cc`, "CGO_ENABLED=1", "GOFLAGS=-tags=sqlite_fts5"}},
		{name: "path with a space", cc: `/opt/my tools/zig`,
			want: []string{`CC="/opt/my tools/zig" cc`, "CGO_ENABLED=1", "GOFLAGS=-tags=sqlite_fts5"}},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			if got := CgoEnv(tc.cc); !slices.Equal(got, tc.want) {
				t.Errorf("got %q, want %q", got, tc.want)
			}
		})
	}
}

func TestTheEnvFileHoldsTheLinesItWasGiven(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "quackitect", "cgo.env")
	env := CgoEnv("/x/zig")
	for i := 0; i < 2; i++ { // a second write replaces, never appends
		if err := writeCgoEnv(path, env); err != nil {
			t.Fatal(err)
		}
	}
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if got, want := string(b), "CC=/x/zig cc\nCGO_ENABLED=1\nGOFLAGS=-tags=sqlite_fts5\n"; got != want {
		t.Errorf("got %q, want %q", got, want)
	}
	left, _ := filepath.Glob(filepath.Join(filepath.Dir(path), ".cgo.env-*"))
	if len(left) != 0 {
		t.Errorf("temporaries left behind: %v", left)
	}
}

// THE MACHINE'S OWN COMPILER IS A WHOLE COMMAND, AND THE PINNED ONE IS NOT.
//
// zig is a toolbox whose C compiler is a subcommand, so the pinned answer is
// two words. A cc that is already a cc takes no subcommand, and writing one
// there gives every cgo build a compiler it cannot run. The two shapes are one
// line apart and the failure lands in the middle of building SQLite, so they
// are held apart here.
func TestTheFallbackCompilerTakesNoSubcommand(t *testing.T) {
	t.Parallel()
	pinned := CgoEnv("/tools/zig/zig")
	if pinned[0] != "CC=/tools/zig/zig cc" {
		t.Errorf("the pinned compiler lost its subcommand: %q", pinned[0])
	}
	own := CgoEnvWith("cc")
	if own[0] != "CC=cc" {
		t.Errorf("the machine's own compiler was given a subcommand it has not got: %q", own[0])
	}
	// BOTH CARRY THE REST, because the tag and cgo being on are what make the
	// engine's index build at all, and a fallback that dropped them would build
	// a program that cannot open its own database.
	for _, env := range [][]string{pinned, own} {
		if len(env) != 3 || env[1] != "CGO_ENABLED=1" || env[2] != "GOFLAGS=-tags=sqlite_fts5" {
			t.Errorf("the environment is missing what every build here needs: %q", env)
		}
	}
}

// AND THE PROBE ANSWERS A COMPILER THAT COMPILES, OR NOTHING.
//
// A name on PATH is not a compiler that works. This machine may have one or
// not, and both are correct answers, so what is held here is that an answer is
// usable: an empty string, or a name that compiled a C file a moment ago.
func TestAWorkingCompilerAnswersOneThatCompiles(t *testing.T) {
	t.Parallel()
	cc := aWorkingCompiler()
	if cc == "" {
		t.Skip("this machine has no C compiler of its own, which is a fine answer")
	}
	if _, err := exec.LookPath(cc); err != nil {
		t.Fatalf("it answered %q, which is not on PATH: %v", cc, err)
	}
}
