package main

import (
	"os"
	"path/filepath"
	"testing"
)

// ONE PROGRAM UNDER TWO NAMES, AND WHAT IT LOOKS LIKE WHEN THAT STOPS BEING
// TRUE. The installer links them, so the cage and RUNME run the same build. A
// build run by hand replaces one name and leaves the other where it was, and
// then a person reads one build while the guards run another.
func TestTwoNamesAreOneFileUntilSomebodyBuildsByHand(t *testing.T) {
	bin := t.TempDir()
	plain := filepath.Join(bin, "se")
	suffixed := filepath.Join(bin, "se.exe")

	if _, _, split := apart(plain, suffixed); split {
		t.Fatal("two names that are not there yet are not two files")
	}

	if err := os.WriteFile(plain, []byte("the build"), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, _, split := apart(plain, suffixed); split {
		t.Fatal("one name on its own is not two files")
	}

	// What installing does.
	if err := os.Link(plain, suffixed); err != nil {
		t.Fatal(err)
	}
	if _, _, split := apart(plain, suffixed); split {
		t.Fatal("linked names were read as two files")
	}

	// What a build run by hand does: a new file takes one of the names.
	if err := os.Remove(plain); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(plain, []byte("a newer build"), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, _, split := apart(plain, suffixed); !split {
		t.Fatal("a name replaced by a hand build was not noticed")
	}

	// AND THE SAME BYTES ARE STILL TWO FILES. What matters is that a later
	// build reaches both names, and a copy that happens to match today says
	// nothing about tomorrow.
	os.Remove(suffixed)
	if err := os.WriteFile(suffixed, []byte("a newer build"), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, _, split := apart(plain, suffixed); !split {
		t.Fatal("two files with the same bytes were read as one")
	}
}

// A platform where the two names are the same string has nothing to come
// apart, and this is how that reads.
func TestOneNameIsNeverApartFromItself(t *testing.T) {
	if _, _, split := apart("/x/.bin/se", "/x/.bin/se"); split {
		t.Fatal("a name was found to differ from itself")
	}
}
