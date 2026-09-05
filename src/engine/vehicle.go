package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"quackitect/engine/internal/replaced"
	"strings"
	"time"
)

// A COPY, AND THE PROJECT IT DRIVES.
//
// The purpose of this system is to work on projects that are not itself. That
// needs three things, and all three are this layer's:
//
//   1. A copy has an IDENTITY of its own, made when it is installed.
//   2. A project records WHICH COPY drives it, by that identity.
//   3. The register turns an identity into a place, so either tree can move.
//
// A path would do none of this. It goes stale the moment either end moves,
// which is why v3 could record a driver and never resolve one.

// CopyID is this installation's own identity. It lives in the method tree, so
// a produced copy gets its own and a moved tree keeps its own.
func CopyID(methodRoot string) (string, error) {
	path := filepath.Join(methodRoot, ".se", "copy.json")
	var got struct {
		ID   string    `json:"id"`
		Made time.Time `json:"made"`
	}
	if b, err := os.ReadFile(path); err == nil && json.Unmarshal(b, &got) == nil && got.ID != "" {
		return got.ID, nil
	}
	buf := make([]byte, 8)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	got.ID = hex.EncodeToString(buf)
	got.Made = time.Now().UTC()
	b, err := json.MarshalIndent(got, "", "  ")
	if err != nil {
		return "", err
	}
	return got.ID, writeAtomic(path, append(b, '\n'), 0o644)
}

// A project says which copy drives it. The file is the marker that a folder
// is a project this system has worked on.
type Driven struct {
	Driver string    `json:"driver"`
	Since  time.Time `json:"since"`
}

func projectPath(roots Roots) string { return roots.Private("project.json") }

func LoadDriven(roots Roots) (Driven, bool) {
	var p Driven
	b, err := os.ReadFile(projectPath(roots))
	if err != nil || json.Unmarshal(b, &p) != nil || p.Driver == "" {
		return Driven{}, false
	}
	return p, true
}

// Attach records that this copy drives this folder. It is written on the
// first start, so working on a new folder needs no ceremony.
func Attach(roots Roots) (Driven, error) {
	id, err := CopyID(roots.Method)
	if err != nil {
		return Driven{}, err
	}
	p := Driven{Driver: id, Since: time.Now().UTC()}
	b, err := json.MarshalIndent(p, "", "  ")
	if err != nil {
		return p, err
	}
	return p, writeAtomic(projectPath(roots), append(b, '\n'), 0o644)
}

// Detach forgets which copy drives this folder, so the next start asks again.
func Detach(roots Roots) error {
	err := os.Remove(projectPath(roots))
	if os.IsNotExist(err) {
		return nil
	}
	return err
}

// TheOnlyCopy is what a folder with no recorded driver uses when there is no
// choice to make. One copy is not a question.
func TheOnlyCopy() (string, bool) {
	var found []string
	for _, dir := range registerDirs() {
		for _, e := range readRegister(filepath.Join(dir, "registry.json")) {
			found = append(found, e.MethodRoot)
		}
	}
	if len(found) == 1 {
		return found[0], true
	}
	return "", false
}

// FindDriver turns the recorded identity into a place, through the register.
// An identity that is not on this machine is a fact, not an error: the copy
// may simply be somewhere else.
func FindDriver(roots Roots) (path string, known bool, recorded bool) {
	p, ok := LoadDriven(roots)
	if !ok {
		return "", false, false
	}
	for _, dir := range registerDirs() {
		for _, e := range readRegister(filepath.Join(dir, "registry.json")) {
			if e.ID == p.Driver {
				return e.MethodRoot, true, true
			}
		}
	}
	return "", false, true
}

// Produce makes a copy of the method somewhere else. The copy carries the
// method and nothing else: no record of this tree's own work, no private
// material, and no identity, so it makes its own on first use.
func Produce(methodRoot, dest string) error {
	if _, err := os.Stat(dest); err == nil {
		return fmt.Errorf("%s is already there. A copy is made into a new place", dest)
	}
	return produce(methodRoot, dest)
}

// ProduceInto writes the method into a folder that already exists, which is
// what making the folder you are standing in into a vehicle means.
func ProduceInto(methodRoot, dest string) error {
	if sameFile(methodRoot, dest) {
		return fmt.Errorf("a copy cannot be made into the tree it is copied from")
	}
	return produce(methodRoot, dest)
}

func produce(methodRoot, dest string) error {
	skip := map[string]bool{
		".git":         true, // the tool's own development record does not travel
		".se":          true, // private material, and the copy's identity
		".bin":         true, // built programs, which the copy builds for itself
		"node_modules": true,
		"_to_delete":   true,
	}
	return filepath.Walk(methodRoot, func(p string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(methodRoot, p)
		if err != nil {
			return err
		}
		if rel == "." {
			return os.MkdirAll(dest, 0o755)
		}
		if skip[strings.Split(filepath.ToSlash(rel), "/")[0]] {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}
		out := filepath.Join(dest, rel)
		if info.IsDir() {
			return os.MkdirAll(out, info.Mode())
		}
		return copyFile(p, out, info.Mode())
	})
}

func copyFile(from, to string, mode os.FileMode) error {
	in, err := os.Open(from)
	if err != nil {
		return err
	}
	defer in.Close()
	if err := os.MkdirAll(filepath.Dir(to), 0o755); err != nil {
		return err
	}
	out, err := os.OpenFile(to, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, mode)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, in)
	return err
}

// The register says which copies exist on this machine. The environment may
// name where it lives, which is how a cloud box says so. An entry that no
// longer resolves is skipped rather than treated as an error.
type Registered struct {
	ID         string `json:"id"`
	Version    string `json:"version"`
	MethodRoot string `json:"method_root"`
	Registered string `json:"registered"`
}

func registerDirs() []string {
	if s := os.Getenv("SE_REGISTRY"); s != "" {
		return strings.Split(s, string(os.PathListSeparator))
	}
	home, err := os.UserHomeDir()
	if err != nil {
		return nil
	}
	return []string{filepath.Join(home, ".se")}
}

func readRegister(path string) []Registered {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	var all []Registered
	if json.Unmarshal(b, &all) != nil {
		return nil
	}
	out := all[:0:0]
	for _, e := range all {
		if e.MethodRoot == "" {
			continue
		}
		if _, err := os.Stat(e.MethodRoot); err != nil {
			continue
		}
		out = append(out, e)
	}
	return out
}

// RegisterCopy adds or replaces this copy in every register it can write.
func RegisterCopy(methodRoot, version string) (string, error) {
	id, err := CopyID(methodRoot)
	if err != nil {
		return "", err
	}
	var last error
	wrote := false
	for _, dir := range registerDirs() {
		path := filepath.Join(dir, "registry.json")
		entries := readRegister(path)
		kept := entries[:0:0]
		for _, e := range entries {
			if e.ID != id && e.MethodRoot != methodRoot {
				kept = append(kept, e)
			}
		}
		kept = append(kept, Registered{ID: id, Version: version, MethodRoot: methodRoot,
			Registered: time.Now().UTC().Format(time.RFC3339)})
		b, err := json.MarshalIndent(kept, "", "  ")
		if err != nil {
			last = err
			continue
		}
		if err := writeAtomic(path, append(b, '\n'), 0o644); err != nil {
			last = err
			continue
		}
		wrote = true
	}
	if wrote {
		return id, nil
	}
	return id, last
}

// twoNames says whether a program's two names have come apart. The installer
// gives every built program a suffixed name and a plain one, as one file
// under both, because a shell finds a command by extension and a cage cannot
// name an extension that differs by platform.
//
// On a platform where the two names are the same string there is nothing to
// come apart, and this says so.
func twoNames(methodRoot, name string) (string, string, bool) {
	bin := filepath.Join(methodRoot, ".bin")
	return apart(filepath.Join(bin, name), filepath.Join(bin, exeName(name)))
}

// apart says whether two names have become two files. Two names that are the
// same string are one file. So are two names linked to each other, which is
// what the installer makes and what a build run by hand takes away.
//
// A name that is not there is not a difference. The engine is running, so at
// least one of them is, and the other may belong to a platform that does not
// use it.
func apart(a, b string) (string, string, bool) {
	if a == b {
		return a, b, false
	}
	one, err := os.Stat(a)
	if err != nil {
		return a, b, false
	}
	other, err := os.Stat(b)
	if err != nil {
		return a, b, false
	}
	return a, b, !os.SameFile(one, other)
}

// rebuiltSince says whether the program was replaced after this process
// started from it. Installing writes a new file over the old name, so the
// name is younger than the process running the old bytes.
func rebuiltSince(methodRoot string, started time.Time) bool {
	info, err := os.Stat(filepath.Join(methodRoot, ".bin", "se"))
	if err != nil {
		return false
	}
	return info.ModTime().After(started)
}

// LinkBothNames gives a program its plain name as the same file as its
// suffixed one, and answers what it did.
//
// ONE FILE UNDER BOTH NAMES. The cage names ./.bin/se, with no extension,
// because it travels and an extension differs by platform. A shell finds a
// command through PATHEXT and RUNME on Windows is a shell, so the suffixed name
// stays. Installing makes the two one file, and a build by hand replaced one
// and left the other.
//
// WHAT THAT COST. After a merge the plain name was a Linux binary from another
// checkout while the suffixed one was this platform's build. sh takes
// ./.bin/se literally, answers Exec format error, and every hook stops firing:
// the guard, the answer-first refusal, the stop refusal and the log. Nothing
// says so, because the thing that would say so is the hook.
//
// IT IS HERE RATHER THAN IN THE BUILD SCRIPT because a shell's ln is not one
// behaviour. The one in this project's shell moved the file instead of linking
// it, which left the tree with no engine at all.
func LinkBothNames(methodRoot string, names []string) ([]string, error) {
	var done []string
	for _, name := range names {
		bin := filepath.Join(methodRoot, ".bin")
		// THE SUFFIXED NAME IS .exe ON EVERY PLATFORM, because the battery builds
		// .bin/se.exe everywhere and the cage names ./.bin/se everywhere. This
		// asked exeName, which adds .exe on Windows alone, so on Linux the two
		// names were one string and nothing was linked: an installed tree kept
		// .bin/se on the build the installer made, and a fresh worktree had no
		// .bin/se at all, so its battery answered "no engine at .bin/se".
		plain, suffixed := filepath.Join(bin, name), filepath.Join(bin, name+".exe")
		if _, err := os.Stat(suffixed); err != nil {
			continue // that program is not built here, which is not a fault
		}
		// ALREADY ONE FILE IS THE ORDINARY CASE, AND IT DOES NOTHING.
		//
		// Linking runs on every install and every build, and almost always the
		// two names are already the one file. Unlinking and relinking them
		// asks the filesystem to delete a running image, which Windows
		// refuses through EVERY name the image holds, so the work below fails
		// on exactly the tree it had nothing to do.
		if fi, err := os.Stat(plain); err == nil {
			if sfi, err := os.Stat(suffixed); err == nil && os.SameFile(fi, sfi) {
				done = append(done, name)
				continue
			}
		}
		// A RUNNING PROGRAM CANNOT BE REMOVED ON WINDOWS, AND CAN BE RENAMED.
		//
		// After a build the two names are different files and the old one may
		// be running. Removing it answers that it is in use, the link fails,
		// and the copy underneath cannot open it either, so the tree keeps the
		// previous build under its plain name. Moving it aside frees the name,
		// and the processes holding it go on running from the moved file.
		//
		// IT GOES IN .bin/was, NOT BESIDE THE PROGRAMS IT IS NO LONGER ONE OF.
		// See wasbin.go: .bin holds what this tree ships, .bin/was holds what
		// it used to, and the engine sweeps that folder at every start.
		if err := os.Remove(plain); err != nil && !os.IsNotExist(err) {
			_, _ = replaced.PutAside(methodRoot, plain) // a name it cannot free is one the link below reports
		}
		if err := os.Link(suffixed, plain); err != nil {
			// A HARD LINK TO A FILE NEEDS NO PRIVILEGE, which is what makes it
			// the right one. It wants one volume, and a failure is worth naming
			// rather than hiding in a copy that then drifts.
			b, readErr := os.ReadFile(suffixed)
			if readErr != nil {
				return done, readErr
			}
			if err := os.WriteFile(plain, b, 0o755); err != nil {
				return done, err
			}
			done = append(done, name+" (a copy, because the link failed: "+err.Error()+")")
			continue
		}
		done = append(done, name)
	}
	return done, nil
}

// theProgramNames answers every program this tree ships, by name, for the
// doors that want the names and not where each is built from. theBuilds is the
// one list, read from util/setup/manifest.json, and the swap door reads the
// same call.
//
// MEASURED on startup. It named se, se-mcp and logview in a literal of its
// own, which was a second copy of the manifest in code. Nothing was wrong
// while the two agreed, and nothing held them together. A program added to the
// manifest is built by the installer and put in place by a swap, and was then
// left with only its suffixed name by the engine that starts.
func theProgramNames(methodRoot string) []string {
	var names []string
	for _, one := range theBuilds(methodRoot) {
		names = append(names, one.Name)
	}
	return names
}

// LinkEveryProgram is the link step: every program this tree ships is given its
// plain name and its suffixed one as the same file.
func LinkEveryProgram(methodRoot string) ([]string, error) {
	return LinkBothNames(methodRoot, theProgramNames(methodRoot))
}
