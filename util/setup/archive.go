package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

// A TOOL THAT COMES AS AN ARCHIVE is fetched from its publisher, checked
// against the hash the manifest pins, and unpacked whole into a folder this
// program owns. The folder is named by version, so a folder that is there is
// the pinned version and a second run skips it.
//
// Not through winget. Its extractor was measured at ten files a second over
// the 20,000 entries in the zig archive and was killed after fifteen minutes.
// The tar the platform ships unpacked the same archive in twelve seconds.

type Archive struct {
	Version string `json:"version"`
	// Platforms is keyed by GOOS/GOARCH, which is the one spelling both the
	// manifest and runtime agree on.
	Platforms map[string]Artifact `json:"platforms"`
}

type Artifact struct {
	URL    string `json:"url"`
	SHA256 string `json:"sha256"`
	Size   int64  `json:"size"`
}

// downloadLimit bounds one fetch. The largest archive is under 100 MB, and a
// link that cannot move that in twenty minutes is a link worth naming.
const downloadLimit = 20 * time.Minute

// toolsDir is where archives land: one folder per tool and version, under
// the per-user data folder of this platform.
func toolsDir() string { return filepath.Join(dataDir(), "quackitect", "tools") }

func archiveHome(name string, a *Archive) string {
	return filepath.Join(toolsDir(), name+"-"+a.Version)
}

// archiveExe answers the program inside an unpacked archive. Unpacking strips
// the archive's top folder, so the program sits at the top of its home.
func archiveExe(name string, a *Archive) string {
	exe := filepath.Join(archiveHome(name, a), name)
	if runtime.GOOS == "windows" {
		exe += ".exe"
	}
	return exe
}

func ensureArchive(name string, t Tool) error {
	a := t.Archive
	exe := archiveExe(name, a)
	if _, err := os.Stat(exe); err == nil {
		say("  %-8s already here, %s", name, a.Version)
		return nil
	}
	platform := runtime.GOOS + "/" + runtime.GOARCH
	art, ok := a.Platforms[platform]
	if !ok {
		return fmt.Errorf("the manifest has no %s %s archive for %s", name, a.Version, platform)
	}
	home := archiveHome(name, a)
	mb := art.Size / 1_000_000
	if *dry {
		say("  %-8s would be downloaded, %d MB, into %s (%s)", name, mb, home, t.Why)
		return nil
	}
	if err := os.MkdirAll(toolsDir(), 0o755); err != nil {
		return err
	}
	// The archive and the unpacked tree are made beside the target and the
	// tree is renamed into place last. A run that dies midway leaves nothing
	// a second run mistakes for done.
	archive := home + ".download"
	staging := home + ".partial"
	say("  %-8s downloading %s, %d MB, about a minute, because %s", name, a.Version, mb, t.Why)
	if err := download(art, archive); err != nil {
		return fmt.Errorf("could not download %s: %w", name, err)
	}
	say("  %-8s unpacking, about fifteen seconds", name)
	if err := os.RemoveAll(staging); err != nil {
		return err
	}
	if err := os.MkdirAll(staging, 0o755); err != nil {
		return err
	}
	if err := unpack(archive, staging); err != nil {
		return fmt.Errorf("could not unpack %s: %w", name, err)
	}
	_ = os.Remove(archive) // verified and unpacked, so it has done its work
	if err := os.Rename(staging, home); err != nil {
		return err
	}
	if _, err := os.Stat(exe); err != nil {
		return fmt.Errorf("%s was unpacked and %s is not in it", name, exe)
	}
	say("  %-8s %s at %s", name, a.Version, home)
	return nil
}

// download fetches one artifact into dest and keeps it only when the bytes
// hash to what the manifest pins. A refused file is removed, so nothing
// unverified stays on disk.
func download(art Artifact, dest string) error {
	ctx, cancel := context.WithTimeout(context.Background(), downloadLimit)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, art.URL, nil)
	if err != nil {
		return err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("%s answered %s", art.URL, resp.Status)
	}
	f, err := os.Create(dest)
	if err != nil {
		return err
	}
	// One byte past the pinned size is enough to tell a larger body from the
	// right one, and it bounds what a wrong URL can put on the disk.
	got, n, err := hashInto(f, io.LimitReader(resp.Body, art.Size+1))
	if cerr := f.Close(); err == nil {
		err = cerr
	}
	if err == nil && n > art.Size {
		err = fmt.Errorf("%s is larger than the %d bytes the manifest pins", art.URL, art.Size)
	}
	if err == nil {
		err = checkSum(got, art.SHA256)
	}
	if err != nil {
		_ = os.Remove(dest) // a refused download is not left behind
		return err
	}
	return nil
}

// hashInto copies r into w and answers the hex sha256 of what passed and how
// many bytes did.
func hashInto(w io.Writer, r io.Reader) (sum string, n int64, err error) {
	h := sha256.New()
	n, err = io.Copy(io.MultiWriter(w, h), r)
	return hex.EncodeToString(h.Sum(nil)), n, err
}

// checkSum refuses a hash that is not the pinned one. Publishers print hex
// in either case, so the case is not part of the comparison.
func checkSum(got, want string) error {
	if want == "" {
		return fmt.Errorf("the manifest pins no sha256, so the download cannot be checked")
	}
	if !strings.EqualFold(got, want) {
		return fmt.Errorf("sha256 mismatch: got %s, the manifest pins %s", got, want)
	}
	return nil
}

func unpack(archive, dir string) error {
	cmd := Quietly(exec.Command(tarPath(), "-xf", archive, "-C", dir, "--strip-components=1"))
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("%s: %w", strings.TrimSpace(string(out)), err)
	}
	return nil
}

// CgoEnv answers the environment a cgo build runs under, as KEY=value lines:
// the C compiler is the given one, and cgo is on. The build here sets these
// on its process, and the same lines go into the env file, so the battery
// and the engine build with the compiler the installer built with.
func CgoEnv(cc string) []string {
	// go splits CC like a shell line, so a path with a space is quoted.
	if strings.ContainsAny(cc, " \t") {
		cc = `"` + cc + `"`
	}
	// zig IS A TOOLBOX AND ITS C COMPILER IS A SUBCOMMAND, so the pinned
	// compiler is two words. A compiler that is already a compiler is one, and
	// CgoEnvWith is what that goes through.
	return CgoEnvWith(cc + " cc")
}

// CgoEnvWith is the same answer for a compiler that is a whole command already.
//
// THE MACHINE'S OWN COMPILER IS THE FALLBACK, and it takes no subcommand. A
// cloud box reaches package registries and GitHub and not much else, so the
// pinned archive cannot always be fetched there, and a box that ships cc can
// still build. See aWorkingCompiler.
func CgoEnvWith(compiler string) []string {
	// THE FULL-TEXT MODULE IS A BUILD TAG. The SQLite driver compiles FTS5
	// in only when asked, so the tag rides in the same file as the compiler
	// and every build that has the one has the other.
	return []string{"CC=" + compiler, "CGO_ENABLED=1", "GOFLAGS=-tags=sqlite_fts5"}
}

// aWorkingCompiler answers a C compiler on this machine that can actually
// compile, or an empty string.
//
// IT COMPILES SOMETHING RATHER THAN ASKING FOR A VERSION. A name on PATH is not
// a compiler that works: a wrapper with no backend answers --version and fails
// on the first translation unit, and the failure then arrives in the middle of
// building SQLite where nobody reads it as a missing compiler.
func aWorkingCompiler() string {
	dir, err := os.MkdirTemp("", "cc-probe-")
	if err != nil {
		return ""
	}
	defer os.RemoveAll(dir)
	src := filepath.Join(dir, "probe.c")
	if err := os.WriteFile(src, []byte("int probe(void) { return 0; }\n"), 0o644); err != nil {
		return ""
	}
	for _, name := range []string{"cc", "gcc", "clang"} {
		if _, err := exec.LookPath(name); err != nil {
			continue
		}
		out := filepath.Join(dir, name+".o")
		if err := Quietly(exec.Command(name, "-c", src, "-o", out)).Run(); err == nil {
			return name
		}
	}
	return ""
}

// CgoEnvPath is where the env file lives. Another program reads it rather
// than working the compiler's path out for itself.
func CgoEnvPath() string { return filepath.Join(dataDir(), "quackitect", "cgo.env") }

func writeCgoEnv(path string, env []string) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	tmp, err := os.CreateTemp(filepath.Dir(path), ".cgo.env-*")
	if err != nil {
		return err
	}
	if _, err := tmp.WriteString(strings.Join(env, "\n") + "\n"); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmp.Name(), path)
}

// firstCgoBuild says whether the compiler has built anything on this machine
// yet. Its cache holds the C runtime once compiled, and its absence is the
// three minutes the first build costs.
func firstCgoBuild() bool {
	cache, err := os.UserCacheDir()
	if err != nil {
		return true
	}
	_, err = os.Stat(filepath.Join(cache, "zig"))
	return err != nil
}
