package main

import (
	"os"
	"path/filepath"
	"testing"
)

// THE LINK STEP TAKES ITS LIST FROM THE MANIFEST, NEVER FROM A LITERAL.
//
// Startup called LinkBothNames with se, se-mcp and logview written out in
// code. util/setup/manifest.json is the tree's list of what it ships, so that
// was a second copy of it. Nothing was wrong while the two agreed, and nothing
// held them together.
//
// A program added to the manifest is built by the installer and put in place by
// a swap, and was then left with only its suffixed name by the engine that
// starts. The cage names .bin/se with no extension because it travels, so the
// plain name is the one the hooks reach for. A program holding one of its two
// names fails with nothing saying why.
func TestTheLinkStepNamesWhatTheManifestNames(t *testing.T) {
	t.Parallel()
	method := t.TempDir()
	bin := filepath.Join(method, ".bin")
	setup := filepath.Join(method, "util", "setup")
	for _, dir := range []string{bin, setup} {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			t.Fatal(err)
		}
	}
	// A NAME THE LITERAL NEVER HELD. That is the whole trap: the manifest is
	// where a program is added, and the literal is where it is forgotten.
	const added = "quacklint"
	manifest := `{"builds": [
	    {"name": "se", "source": "src/engine"},
	    {"name": "` + added + `", "source": "src/quacklint"}
	]}`
	if err := os.WriteFile(filepath.Join(setup, "manifest.json"), []byte(manifest), 0o644); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"se", added} {
		built := filepath.Join(bin, name+".exe")
		if err := os.WriteFile(built, []byte("#!/bin/sh\necho "+name+"\n"), 0o755); err != nil {
			t.Fatal(err)
		}
	}

	done, err := LinkEveryProgram(method)
	if err != nil {
		t.Fatal(err)
	}

	for _, name := range []string{"se", added} {
		plain, err := os.Stat(filepath.Join(bin, name))
		if err != nil {
			t.Fatalf("the manifest names %s and the link step left it without its plain name: %v. "+
				"It linked %v", name, err, done)
		}
		suffixed, err := os.Stat(filepath.Join(bin, name+".exe"))
		if err != nil {
			t.Fatal(err)
		}
		if !os.SameFile(plain, suffixed) {
			t.Fatalf(".bin/%s and .bin/%s.exe are two files", name, name)
		}
	}
}
