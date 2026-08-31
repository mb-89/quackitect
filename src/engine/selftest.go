package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

// THE END TO END TEST, RUN BY HAND, WITH NO AGENT.
//
// The story this system exists for is: a copy is produced, and that copy
// drives a project that is not itself. Nothing about that story is proved by
// the parts working on their own, and it is the story most likely to be
// broken by a change somewhere else.
//
//   se --selftest
//
// It produces a copy into a temporary place, registers it, makes an empty
// project folder, drives it with the copy, and checks what came out. Then it
// says what happened, step by step, and leaves nothing behind.

type step struct {
	what string
	ok   bool
	says string
}

func SelfTest(roots Roots, keep bool) int {
	var steps []step
	say := func(what string, ok bool, says string) {
		steps = append(steps, step{what, ok, says})
	}

	work, err := os.MkdirTemp("", "se-selftest-")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 1
	}
	if !keep {
		defer os.RemoveAll(work)
	}
	copyRoot := filepath.Join(work, "vehicle")
	project := filepath.Join(work, "project")
	registry := filepath.Join(work, "registry")

	// The register is redirected, so the test cannot touch the real one.
	os.Setenv("SE_REGISTRY", registry)
	os.MkdirAll(project, 0o755)

	// 1. A copy is produced.
	err = Produce(roots.Method, copyRoot)
	say("produce a copy", err == nil, saysOf(err, copyRoot))
	if err != nil {
		return report(steps)
	}

	// 2. It carries the method and not the tree it came from.
	_, hasGuidance := os.Stat(filepath.Join(copyRoot, "doc", "guidance", "voice.md"))
	_, hasGit := os.Stat(filepath.Join(copyRoot, ".git"))
	_, hasPrivate := os.Stat(filepath.Join(copyRoot, ".se"))
	say("the copy carries the method", hasGuidance == nil, "guidance/voice.md")
	say("the copy carries no history and nothing private", hasGit != nil && hasPrivate != nil,
		"no .git, no .se")

	// 3. The copy has an identity of its own, and it is not this one.
	mine, _ := CopyID(roots.Method)
	theirs, err := RegisterCopy(copyRoot, "selftest")
	say("the copy has its own identity", err == nil && theirs != "" && theirs != mine,
		short(mine)+" drives, "+short(theirs)+" was made")

	// 4. The copy drives a project that is not itself.
	driven := Roots{Method: copyRoot, Work: project}
	_, err = Attach(driven)
	say("the project records which copy drives it", err == nil, ".se/project.json")

	// 5. The identity resolves to a place, through the register.
	found, known, recorded := FindDriver(driven)
	say("the driver is found by identity, not by path", known && recorded && found == copyRoot, found)

	// 6. The copy projects into the project, and not into itself.
	//
	// A copy carries an AGENTS.md, because the tree it was made from is a
	// project as well as the method. So the file being there proves nothing.
	// What is asked here is where this run WROTE, and Project says that.
	written, err := Project(driven)
	_, inProject := os.Stat(filepath.Join(project, "AGENTS.md"))
	say("the copy writes into the project", err == nil && len(written) > 0 && inProject == nil,
		fmt.Sprintf("%d files", len(written)))
	apart, says := nothingUnder(written, copyRoot)
	say("the copy does not write into itself", apart, says)

	// 7. The record is written where the project keeps private material.
	log, err := OpenLog(driven.Private("log"))
	if err == nil {
		log.Write("engine", "start", "engine", "selftest", Yes(), nil)
		log.Close()
	}
	b, readErr := os.ReadFile(filepath.Join(driven.Private("log"), Current))
	say("the record is in the project, not in the copy",
		err == nil && readErr == nil && strings.Contains(string(b), "selftest"),
		filepath.Join(".se", "log", Current))

	// 8. The guard in the copy refuses a write to the project's projection.
	yes, instead := IsProjection(driven, filepath.Join(project, "AGENTS.md"))
	say("the guard knows the project's projections", yes, instead)

	// 9. And the two trees stay apart: nothing was written back here.
	apart, says = nothingUnder(written, roots.Method)
	say("nothing was written back into the tree that produced the copy", apart, says)

	// 10. THE STORY, END TO END. The vehicle makes a project of its own, and
	// that project answers the one command every project must answer. This is
	// the step the others exist to make possible.
	//
	// The copy carries no built programs, so it is given this one: that is
	// what installing it would have done, without needing a toolchain here.
	if err := installInto(copyRoot); err != nil {
		say("give the copy a built engine", false, err.Error())
		return report(steps)
	}
	made := filepath.Join(work, "made-by-the-vehicle")
	os.MkdirAll(made, 0o755)
	out, err := runEngine(copyRoot, "--init", "project", "--work", made)
	say("the vehicle makes a project", err == nil, firstLineOf(out))

	version, err := runRunme(made, "--version")
	say("the project answers --version through RUNME",
		err == nil && strings.TrimSpace(version) != "", strings.TrimSpace(firstLineOf(version)))

	// The one thing a document may rely on about a command it does not own.
	// The README hands the reader here, so this has to answer.
	helped, err := runRunme(made, "--help")
	say("the project answers --help through RUNME",
		err == nil && strings.Contains(helped, "-work"), firstLineOf(helped))

	_, seededReadme := os.Stat(filepath.Join(made, "README.md"))
	_, seededRunme := os.Stat(filepath.Join(made, runmeName()))
	say("the project has a README and a "+runmeName(), seededReadme == nil && seededRunme == nil,
		"next to each other")

	if keep {
		say("left behind for inspection", true, work)
	}
	return report(steps)
}

// A produced copy carries no built programs. Installing it would build them.
// Here it is given the engine that is running, which is the same thing for
// the purpose of the test and needs no toolchain.
func installInto(copyRoot string) error {
	self, err := os.Executable()
	if err != nil {
		return err
	}
	bin := filepath.Join(copyRoot, ".bin")
	if err := os.MkdirAll(bin, 0o755); err != nil {
		return err
	}
	// Under both names, because installing writes both. The cage names the
	// one with no suffix, so a copy that had only the other one would be
	// caged by a file that is not there.
	if err := copyFile(self, filepath.Join(bin, exeName("se")), 0o755); err != nil {
		return err
	}
	return copyFile(self, filepath.Join(bin, "se"), 0o755)
}

func runEngine(copyRoot string, args ...string) (string, error) {
	exe := filepath.Join(copyRoot, ".bin", exeName("se"))
	out, err := Quietly(exec.Command(exe, append(args, "--method", copyRoot)...)).CombinedOutput()
	return string(out), err
}

// RUNME is run the way a person runs it, through the shell of the platform.
func runRunme(dir string, args ...string) (string, error) {
	script := filepath.Join(dir, runmeName())
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = Quietly(exec.Command("powershell", append([]string{"-NoProfile", "-File", script}, args...)...))
	} else {
		cmd = Quietly(exec.Command("sh", append([]string{script}, args...)...))
	}
	cmd.Dir = dir
	out, err := cmd.CombinedOutput()
	return string(out), err
}

// nothingUnder answers whether a projection landed inside a tree it had no
// business writing to, and names the first one that did.
func nothingUnder(written []string, root string) (bool, string) {
	for _, w := range written {
		rel, err := filepath.Rel(root, w)
		if err == nil && rel != ".." && !strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
			return false, w
		}
	}
	return true, "nothing was written under " + root
}

func firstLineOf(s string) string {
	s = strings.TrimSpace(s)
	if i := strings.IndexByte(s, '\n'); i >= 0 {
		return s[:i]
	}
	return s
}

func report(steps []step) int {
	bad := 0
	for _, s := range steps {
		mark := "ok  "
		if !s.ok {
			mark = "FAIL"
			bad++
		}
		fmt.Printf("%s  %-52s %s\n", mark, s.what, s.says)
	}
	fmt.Println()
	if bad == 0 {
		fmt.Printf("%d steps, all of them passed.\n", len(steps))
		return 0
	}
	fmt.Printf("%d steps, %d failed.\n", len(steps), bad)
	return 1
}

func saysOf(err error, ok string) string {
	if err != nil {
		return err.Error()
	}
	return ok
}

func short(id string) string {
	if len(id) > 8 {
		return id[:8]
	}
	return id
}

var _ = json.Marshal
