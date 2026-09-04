package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A PROJECTION THAT NAMES A MACHINE IS DEAD ON EVERY OTHER ONE.
//
// Some projections are in version control, because a fresh clone is caged
// before anything has run in it. So the cage travels, and an absolute path in
// a travelling file was right where it was written and wrong everywhere else.
// That is how a Windows path reached a Linux box and the tool lane failed to
// connect on the first session.
//
// This reads the product's own list, and not a fixture's. The mechanism was
// never the thing that broke. The list was: one of three cage files was
// missed, and nothing said so.
func TestNoCagedFileNamesTheMachineItWasWrittenOn(t *testing.T) {
	t.Parallel()
	root, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, "util", "projections.json")); err != nil {
		t.Skip("this test reads the product's own list, and it is not here")
	}

	// SELF-HOSTING, which is the case that travels. A driven project keeps
	// absolute paths, because the method lives somewhere it cannot name from
	// where it stands.
	r := Roots{Method: root, Work: root}
	list, err := LoadProjections(root)
	if err != nil {
		t.Fatal(err)
	}
	vars, err := variables(r)
	if err != nil {
		t.Fatal(err)
	}
	if len(list) == 0 {
		t.Fatal("the list is empty, so this test proves nothing")
	}

	for _, p := range list {
		body, err := assemble(root, p.Sources, p.Section, vars)
		if err != nil {
			t.Fatalf("%s: %v", p.Name, err)
		}
		out, err := wrap(p, p.Sources, body)
		if err != nil {
			t.Fatalf("%s: %v", p.Name, err)
		}
		for i, line := range strings.Split(out, "\n") {
			if said := namesTheMachine(line, root); said != "" {
				t.Errorf("%s (%s) line %d names this machine as %s: %s",
					p.Name, p.Target, i+1, said, strings.TrimSpace(line))
			}
		}
	}
}

// AND THE ONES ON DISK SAY THE SAME. The check above reads what would be
// written. This reads what is committed, because an engine from an older
// build re-projects too, and it writes what its own build knew how to write.
func TestNoCommittedProjectionNamesTheMachine(t *testing.T) {
	t.Parallel()
	root, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	list, err := LoadProjections(root)
	if err != nil || len(list) == 0 {
		t.Skip("this test reads the product's own list, and it is not here")
	}
	for _, p := range list {
		path := filepath.Join(root, filepath.FromSlash(p.Target))
		b, err := os.ReadFile(path)
		if err != nil {
			continue // not written yet, which the check above already covers
		}
		if said := namesTheMachine(string(b), root); said != "" {
			t.Errorf("%s names this machine as %s. Run the engine to write it again",
				p.Target, said)
		}
	}
}

// namesTheMachine answers the spelling of this machine's root that a text
// carries, or nothing.
//
// A PATH HAS TWO SPELLINGS HERE AND ONLY ONE OF THEM WAS LOOKED FOR.
// filepath.Abs answers this machine's root with backslashes, and every file the
// cage writes uses forward slashes, because that is what JSON and a shell both
// want. So the check compared the spelling nothing writes, and on this platform
// it could not fail for the defect it exists to catch. On Linux the two are one
// string, which is why it passed there.
//
// WATCHED: with util/cage/mcp.json holding this machine's path in full, written
// with forward slashes exactly as a projection writes one, the check was green.
func namesTheMachine(text, root string) string {
	for _, spelling := range []string{root, filepath.ToSlash(root)} {
		if strings.Contains(text, spelling) {
			return spelling
		}
	}
	return ""
}

// AND NO CAGED FILE NAMES A PROGRAM THAT IS NOT BUILT YET.
//
// A cage travels, so a clone is caged before anything in it has been compiled.
// .bin is out of version control, so a cage naming a path under it names a file
// that is not there on the one box that has just arrived. It cost two sessions.
// The first was .mcp.json naming .bin/se-mcp: the harness spawned it, answered
// ENOENT, and the session had no se_ tool at all. The second was the settings
// file naming .bin/se for the hook at SessionStart and for the wake on every
// prompt, which no hook can repair, because the harness spawns the tool lane
// before any hook runs.
//
// EVERY ONE OF THEM GOES THROUGH A FILE GIT CARRIES, under util/cage, which
// builds what is missing and hands over.
//
// IT IS ABOUT THE CONFIGS AND NOT ABOUT THE SCRIPTS. A JSON config cannot look
// before it leaps: whatever it names, the harness starts, and if it is not there
// the answer is ENOENT. A script can ask, and the wake does, which is why it
// names .bin/se three times and is right to.
func TestNoCagedFileNamesAProgramThatIsNotBuiltYet(t *testing.T) {
	t.Parallel()
	root, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	list, err := LoadProjections(root)
	if err != nil || len(list) == 0 {
		t.Skip("this test reads the product's own list, and it is not here")
	}
	vars, err := variables(root2(root))
	if err != nil {
		t.Fatal(err)
	}
	for _, p := range list {
		if !strings.HasSuffix(p.Target, ".json") {
			continue
		}
		body, err := assemble(root, p.Sources, p.Section, vars)
		if err != nil {
			t.Fatalf("%s: %v", p.Name, err)
		}
		for i, line := range strings.Split(body, "\n") {
			if strings.Contains(line, ".bin/") || strings.Contains(line, `.bin\`) {
				t.Errorf("%s (%s) line %d names a program a clone does not carry: %s",
					p.Name, p.Target, i+1, strings.TrimSpace(line))
			}
		}
	}
}

// root2 is the self-hosting pair, which is the case a cage travels in.
func root2(root string) Roots { return Roots{Method: root, Work: root} }
