package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// WHICH ENGINE A SUITE DRIVES: THE ONE IT IS HANDED, UNLESS THE TREE IS NEWER.
//
// A test that drives the engine as a subprocess is handed one in SE_ENGINE,
// so the suite is spared a link. That engine was built at the last swap, and
// the tree moved on. A hook changed in the tree read as a hook not changed,
// because the binary answering was built before the change. Two tests over
// the same lines then disagreed, the in-process one green and the subprocess
// one red, with a right fix under both.
//
// So the handed engine serves only while it is newer than every source it
// was built from. Older, and one is built from the tree. Either way the
// answer names which engine ran and how old it is, so a stale run reads as
// stale and never as a failed fix.

// engineChoice is the decision.
type engineChoice struct {
	Path  string        // the engine to run, or the one passed over when Build is set
	Build bool          // the tree is newer than Path, or Path is not there
	Age   time.Duration // how long ago Path was built, when it is there
	Newer string        // the source newer than Path, when that is why Build is set
}

// engineToRun decides between given and a build from the Go source under
// dirs. Test files are not source here, because the engine has none in it.
func engineToRun(given string, dirs []string, now time.Time) engineChoice {
	if given == "" {
		return engineChoice{Build: true}
	}
	info, err := os.Stat(given)
	if err != nil {
		return engineChoice{Path: given, Build: true}
	}
	c := engineChoice{Path: given, Age: now.Sub(info.ModTime()).Round(time.Second)}
	if newest, at := newestSource(dirs); at.After(info.ModTime()) {
		c.Build, c.Newer = true, newest
	}
	return c
}

// newestSource answers the Go source under dirs that changed last, and when.
func newestSource(dirs []string) (path string, at time.Time) {
	for _, dir := range dirs {
		filepath.WalkDir(dir, func(p string, d os.DirEntry, err error) error {
			if err != nil || d.IsDir() || !strings.HasSuffix(p, ".go") || strings.HasSuffix(p, "_test.go") {
				return nil
			}
			// WHAT THE TOOLCHAIN PASSES OVER IS NOT SOURCE HERE EITHER. go build
			// ignores a file whose base name begins with an underscore or a dot,
			// so a build over one of those compiles nothing new and the engine it
			// makes is the same program. Counting one is a stale reading that no
			// build can clear: a parked file left beside its own source made the
			// suite build a fresh engine for code nothing compiles.
			if base := filepath.Base(p); strings.HasPrefix(base, "_") || strings.HasPrefix(base, ".") {
				return nil
			}
			if info, err := d.Info(); err == nil && info.ModTime().After(at) {
				path, at = p, info.ModTime()
			}
			return nil
		})
	}
	return path, at
}

// whyBuilt says why the handed engine was passed over.
func (c engineChoice) whyBuilt() string {
	switch {
	case c.Path == "":
		return "none was named"
	case c.Newer != "":
		return fmt.Sprintf("%s is newer than %s, built %s ago", c.Newer, c.Path, c.Age)
	}
	return c.Path + " is not there"
}

// residentStale says why the engine in .bin is older than the source it was
// built from, or nothing: when it is current, when there is none, or when this
// tree carries no engine source to compare it with.
func residentStale(r Roots) string {
	src := filepath.Join(r.Method, "src", "engine")
	if !fileExists(src) {
		return ""
	}
	c := engineToRun(filepath.Join(r.Method, ".bin", exeName("se")), []string{src}, time.Now())
	if !c.Build || c.Newer == "" {
		return ""
	}
	return c.whyBuilt()
}

// suiteEngine answers the engine se test hands a subprocess test in
// SE_ENGINE, and the sentence the answer carries about it. The resident
// engine in .bin serves while it is newer than every source under
// src/engine. Older, and one is built from the tree into .se/tests, once per
// change, through the toolchain seam, so a fed toolchain builds nothing
// real. A tree with no engine source names none, and the suite builds its
// own the way it always did.
func suiteEngine(r Roots) (engine, said string) {
	src := filepath.Join(r.Method, "src", "engine")
	if !fileExists(src) {
		return "", ""
	}
	resident := filepath.Join(r.Method, ".bin", exeName("se"))
	now := time.Now()
	c := engineToRun(resident, []string{src}, now)
	if !c.Build {
		return resident, fmt.Sprintf("%s, built %s ago", resident, c.Age)
	}
	fresh := filepath.Join(r.Private("tests"), exeName("se.fresh"))
	if f := engineToRun(fresh, []string{src}, now); !f.Build {
		return fresh, fmt.Sprintf("%s, built %s ago from the tree: %s", fresh, f.Age, c.whyBuilt())
	}
	if theToolchain.buildEngine == nil {
		return "", "none: " + c.whyBuilt() + ", and this toolchain builds no engine"
	}
	if err := os.MkdirAll(filepath.Dir(fresh), 0o755); err != nil {
		return "", "none: " + c.whyBuilt() + ", and .se/tests cannot be made: " + err.Error()
	}
	if out, err := theToolchain.buildEngine(src, fresh); err != nil {
		return "", fmt.Sprintf("none: %s, and the tree will not build: %v\n%s", c.whyBuilt(), err, tailOf(string(out), 500))
	}
	return fresh, fmt.Sprintf("%s, built now from the tree: %s", fresh, c.whyBuilt())
}
