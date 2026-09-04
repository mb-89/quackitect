package main

import (
	"os"
	"path/filepath"
	"strconv"
)

// WHERE A REPLACED PROGRAM GOES, AND WHO CLEARS IT UP.
//
// WINDOWS WILL NOT DELETE A RUNNING PROGRAM AND WILL RENAME ONE. So putting a
// new engine in place while the old one answers calls means renaming the old
// one out of the way: that frees the name, and the process still running keeps
// executing from the renamed file because the handle stays open.
//
// THE RENAMED ONES WERE LEFT BESIDE THE SHIPPED PROGRAMS. .bin held se, se.exe,
// se~, se~1, se.exe.was, se-mcp~ and se-mcp.exe~, and only two of those are
// programs this tree ships. A reader could not tell which, and nothing ever
// removed one: every swap added another.
//
// SO THEY GO IN A FOLDER OF THEIR OWN AND THE ENGINE SWEEPS IT. .bin holds what
// this tree ships; .bin/was holds what it used to. A sweep at every start
// removes each one that will delete, and one that will not delete is one a
// process is still running from, which is exactly the file that has to stay.
//
// NOBODY DECIDES ANY OF THIS. The agent asks the engine to replace itself and
// the engine does the whole of it: build, verify, move aside, link, hand over,
// sweep. There is no build script for an agent to call and no leavings for a
// person to judge.

// WasDir is where a program that has been replaced waits for the last process
// running it to end.
func WasDir(methodRoot string) string { return filepath.Join(methodRoot, ".bin", "was") }

// PutAside moves a program out of the way so its name is free, and answers
// where it went. A name already taken by something still running is passed
// over, which is why the name is searched rather than fixed.
func PutAside(methodRoot, program string) (string, error) {
	dir := WasDir(methodRoot)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	base := filepath.Base(program)
	for i := 0; i < 10; i++ {
		aside := filepath.Join(dir, base)
		if i > 0 {
			aside += "." + strconv.Itoa(i)
		}
		if err := os.Remove(aside); err != nil && !os.IsNotExist(err) {
			continue // a process is still running from that one
		}
		if err := os.Rename(program, aside); err == nil {
			return aside, nil
		}
	}
	return "", os.ErrExist
}

// SweepWhatWasReplaced removes every replaced program nothing is running any
// more, and answers how many went.
//
// A FILE THAT WILL NOT DELETE IS ONE STILL IN USE, and it stays. That is the
// whole rule: the filesystem already knows the answer, so nothing here has to
// ask which processes are alive or keep a list of what it left behind.
func SweepWhatWasReplaced(methodRoot string) int {
	entries, err := os.ReadDir(WasDir(methodRoot))
	if err != nil {
		return 0
	}
	swept := 0
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		if os.Remove(filepath.Join(WasDir(methodRoot), e.Name())) == nil {
			swept++
		}
	}
	return swept
}
