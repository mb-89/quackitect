package main

import (
	"os"
	"strings"
	"testing"
)

// THE COVER BUILD GOES THROUGH THE SEAM, OR THE SEAM IS DECORATION.
//
// The toolchain is a variable so that a test about which tests the engine picks
// is not a test of the Go compiler. buildCover was declared, filled by the real
// toolchain, fed by every fixture, and called by nobody: coverBinary ran go
// test -c itself, a few lines above. So a fed toolchain fed runOne alone, and
// every test taking the fixture really compiled a module.
//
// THE FED BUILD IS COUNTED, AND WHAT IT WROTE IS READ. A counter above zero
// says the seam was asked. The binary holding the fed toolchain's own bytes
// says no compiler wrote it, which is the other half of the same sentence.
func TestTheCoverBuildGoesThroughTheSeam(t *testing.T) {
	fed := aFedToolchain(t, "example.com/lib", nil)
	f := aTree(t)
	r := f.Roots
	f.write("lib.go", "package lib\n")
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })

	bin, err := coverBinary(r, db, ".")
	if err != nil {
		t.Fatalf("the cover binary would not build: %v", err)
	}

	fed.Lock()
	builds := fed.builds
	fed.Unlock()
	if builds == 0 {
		t.Fatalf("the toolchain was fed and the build went round it, so %s was compiled for real", bin)
	}
	b, err := os.ReadFile(bin)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(b), "a binary nothing runs") {
		t.Errorf("%s was not written by the fed toolchain, so a compiler ran", bin)
	}
}
