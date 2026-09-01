package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
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
		body, err := assemble(root, p.Sources, vars)
		if err != nil {
			t.Fatalf("%s: %v", p.Name, err)
		}
		out, err := wrap(p, body)
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

// EVERY HOOK THE CAGE DECLARES RUNS HERE, DRIVEN THROUGH A SHELL.
//
// The cage carries relative paths so it travels, and a path that is the same
// everywhere carries no file extension. On Windows the engine is se.exe, and
// the plain name is the same file only because installing links them.
//
// WHAT HAPPENED WHEN IT WAS NOT. .bin/se was a Linux binary from an older
// checkout while .bin/se.exe was this platform's build. Every hook then failed
// to launch: the guard, the answer-first refusal, the stop refusal and the log
// writing. Nothing said so, because the thing that would have said so is the
// hook.
//
// THE GUARD THAT EXISTS SAYS IT ON ENGINE START, INTO THE LOG. That is no use
// for this. An engine cannot report that its own name is unrunnable, and the
// log it would write to is the one nothing was writing.
//
// IT GOES THROUGH A SHELL, AND THAT IS THE WHOLE POINT. A first version ran the
// program by path and stayed green with the broken file in place, because Go's
// exec adds an extension from PATHEXT when the name has none. cmd does the
// same. sh does not: it takes ./.bin/se literally and answers Exec format
// error, which is what the harness met. A check that papers over the difference
// the defect lives in is a check in the wrong language.
func TestEveryHookTheCageDeclaresRunsHere(t *testing.T) {
	root, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(filepath.Join(root, ".claude", "settings.json"))
	if err != nil {
		t.Skip("this reads the product's own cage, and it is not here")
	}
	// One command per hook, and the ones that matter name a path in this tree.
	said := map[string]bool{}
	for _, m := range regexp.MustCompile(`"command"\s*:\s*"([^"]+)"`).FindAllStringSubmatch(string(b), -1) {
		cmd := strings.ReplaceAll(m[1], `\"`, `"`)
		if strings.Contains(cmd, "./.bin/") || strings.Contains(cmd, ".bin\\") {
			said[cmd] = true
		}
	}
	if len(said) == 0 {
		t.Fatal("the cage declares no hook that runs a program in this tree, so this guards nothing")
	}
	// A STOP WITH NO CLAIM IS THE CHEAPEST QUESTION THE ENGINE ANSWERS, and its
	// answer is unmistakably its own.
	const event = `{"hook_event_name":"Stop","session_id":"a check","transcript_path":""}`
	for cmd := range said {
		run := exec.Command("sh", "-c", cmd)
		run.Dir = root
		run.Stdin = strings.NewReader(event)
		out, _ := run.CombinedOutput()
		// ONE ASSERTION, AND IT IS THAT THE ENGINE ANSWERED. A list of the
		// error words a shell might use is a list fitted to the failures
		// already seen: the first version of this matched "not found" and the
		// shell said "No such file or directory". What the engine says when it
		// answers is one string, and everything else is a failure whatever it
		// is spelled.
		// READ WITHOUT ITS CASE, and matched on the one word the engine's stop
		// answer always carries whichever refusal it gives. Which refusal that
		// is depends on what is open, and a check that turned on that would be
		// a check whose result follows the queue.
		if !strings.Contains(strings.ToLower(string(out)), "sanctioned") {
			t.Errorf("a shell running the hook %q did not get the engine's answer: %s",
				cmd, firstLines(strings.TrimSpace(string(out)), 3))
		}
	}
}
