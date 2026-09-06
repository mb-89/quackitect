package main

import (
	"os"
	"path/filepath"
	"testing"
)

// THE PLAIN NAME IS LINKED TO THE .exe ON EVERY PLATFORM.
//
// The battery builds .bin/se.exe on every platform and the cage names
// ./.bin/se. LinkBothNames compared the plain name with exeName(name), which
// adds .exe on Windows alone, so on Linux the two names were one string, the
// loop moved on, and nothing was linked. In an installed tree the installer had
// made both names once, and the battery left .bin/se on that old build ever
// after. In a fresh worktree there was no .bin/se at all, and the battery's
// engine_up answered "no engine at .bin/se".
func TestThePlainNameIsLinkedToTheExeEverywhere(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	bin := filepath.Join(root, ".bin")
	if err := os.MkdirAll(bin, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(bin, "se.exe"), []byte("#!/bin/sh\necho se\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	done, err := LinkBothNames(root, []string{"se", "se-mcp"})
	if err != nil {
		t.Fatal(err)
	}
	if len(done) != 1 || done[0] != "se" {
		t.Fatalf("linked %v, and se.exe alone was built", done)
	}
	plain, err := os.Stat(filepath.Join(bin, "se"))
	if err != nil {
		t.Fatalf("no .bin/se after the link: %v", err)
	}
	suffixed, _ := os.Stat(filepath.Join(bin, "se.exe"))
	if !os.SameFile(plain, suffixed) {
		t.Fatal(".bin/se and .bin/se.exe are two files")
	}
}
