package main

import (
	"os"
	"path/filepath"
)

// Two roots, and neither is declared. The method root is where this program
// lives. The work root is the folder being worked on. v3 made a person
// register them, which bought nothing and annoyed everyone.
type Roots struct {
	Method string
	Work   string
}

func FindRoots(workArg string) (Roots, error) {
	exe, err := os.Executable()
	if err != nil {
		return Roots{}, err
	}
	// The built program sits in .bin under the method root.
	method := filepath.Dir(filepath.Dir(exe))
	work := workArg
	if work == "" {
		if work, err = os.Getwd(); err != nil {
			return Roots{}, err
		}
	}
	work, err = filepath.Abs(work)
	if err != nil {
		return Roots{}, err
	}
	return Roots{Method: method, Work: projectRoot(work)}, nil
}

// THE PROJECT IS THE FOLDER, NOT THE DIRECTORY SOMEBODY IS STANDING IN.
//
// A guard is started by the harness with whatever the shell's directory
// happens to be. That drifts: a terminal moves into src/mcp and stays
// there. Taking it literally gives that subfolder its own .se, and then the
// record, the ledger and the agent's stop claim all split by directory. A
// claim written at the root cannot be found by a guard standing in a
// subfolder, which is how this was noticed.
//
// So the walk goes UP to the nearest folder that carries .se, which is the
// marker that a folder is a project this system has worked on.
//
// IT STOPS BEFORE THE HOME DIRECTORY. The register lives in a .se there, and
// it is not a project. A walk that accepted it would make every project under
// the home directory resolve to the home directory, which is worse than the
// defect this was written to fix.
//
// A tree with no marker is a folder being driven for the first time, and then
// where somebody is standing is the only answer there is.
func projectRoot(start string) string {
	home, _ := os.UserHomeDir()
	for dir := start; ; {
		if home != "" && sameDir(dir, home) {
			return start
		}
		if st, err := os.Stat(filepath.Join(dir, ".se")); err == nil && st.IsDir() {
			return dir
		}
		up := filepath.Dir(dir)
		if up == dir {
			return start
		}
		dir = up
	}
}

// Windows compares paths without case, and a home directory reached two ways
// is one directory either way.
func sameDir(a, b string) bool {
	if a == b {
		return true
	}
	fa, err1 := os.Stat(a)
	fb, err2 := os.Stat(b)
	return err1 == nil && err2 == nil && os.SameFile(fa, fb)
}

// Private is where material that must not travel is kept. The log lives here
// because it holds prompts.
func (r Roots) Private(parts ...string) string {
	return filepath.Join(append([]string{r.Work, ".se"}, parts...)...)
}
