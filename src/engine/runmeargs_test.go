package main

import (
	"bytes"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

// RUNME HANDS THE ARGUMENTS THROUGH AND ADDS NOTHING.
//
// On a project it ran `se --work <here> <verb> ...`, so the verb was no longer
// os.Args[1]: dispatch missed it, the flag form parsed --work, and the
// stray-argument guard refused everything after it. The work root rides out of
// band now, in SE_WORK, which the engine reads only when --work is absent, and
// argv reaches the engine exactly as the person typed it.
//
// THE PERSON STANDS OUTSIDE THE PROJECT ON PURPOSE. Run from anywhere else,
// the work root can only have come out of band, so a RUNME that quietly leans
// on the working directory goes red here too.
func TestAVerbThroughRunmeReachesDispatchOnAProject(t *testing.T) {
	t.Parallel()
	exe := theEngine(t)
	base := t.TempDir()
	copyRoot := filepath.Join(base, "copy")
	project := filepath.Join(base, "project")
	registry := filepath.Join(base, "registry")
	elsewhere := filepath.Join(base, "elsewhere")
	for _, d := range []string{filepath.Join(project, ".se"), registry, elsewhere} {
		if err := os.MkdirAll(d, 0o755); err != nil {
			t.Fatal(err)
		}
	}

	// The copy that drives the project, with the built engine installed and
	// one process for the verb to mint with.
	if err := copyFile(exe, filepath.Join(copyRoot, ".bin", exeName("se")), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(ProcessesDir(copyRoot), 0o755); err != nil {
		t.Fatal(err)
	}
	const proc = `name: task
description: one step the queue hands out
traced: false
sections:
  required:
    - detail
states:
  - name: open
    description: waiting
  - name: done
    description: finished
activities:
  - name: mint
    does: write it down
    to: open
  - name: do
    does: do it
    from: open
    to: done
dispositions:
  - name: done
    description: it was done
  - name: dropped
    description: it was not
    reason: required
`
	if err := os.WriteFile(filepath.Join(ProcessesDir(copyRoot), "task.process.yaml"), []byte(proc), 0o644); err != nil {
		t.Fatal(err)
	}

	// The register knows the copy, and the project names it as its driver,
	// which is the project shape of RUNME: no command of its own.
	reg, _ := json.Marshal([]Registered{{ID: "cp-under-test", Version: "test", MethodRoot: copyRoot}})
	if err := writeAtomic(filepath.Join(registry, "registry.json"), reg, 0o644); err != nil {
		t.Fatal(err)
	}
	spec, _ := json.Marshal(Runme{Kind: AProject, Version: "0.1.0", Driver: "cp-under-test"})
	if err := writeAtomic(filepath.Join(project, ".se", "runme.json"), spec, 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(project, runmeName()), []byte(runmeScript()), 0o755); err != nil {
		t.Fatal(err)
	}

	// An engine lives over the project, the way one does when a person works.
	r := Roots{Method: copyRoot, Work: project}
	aLiveEngine(t, r)

	// A verb through RUNME, from outside the project, argv as typed.
	script := filepath.Join(project, runmeName())
	verb := []string{"work", "--title", "minted through RUNME", "--process", "task", "--detail", "argv untouched"}
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = Quietly(exec.Command("powershell", append([]string{"-NoProfile", "-File", script}, verb...)...))
	} else {
		cmd = Quietly(exec.Command("sh", append([]string{script}, verb...)...))
	}
	cmd.Dir = elsewhere
	env := make([]string, 0, len(os.Environ())+1)
	for _, e := range os.Environ() {
		if strings.HasPrefix(e, "SE_WORK=") || strings.HasPrefix(e, "SE_REGISTRY=") {
			continue
		}
		env = append(env, e)
	}
	cmd.Env = append(env, "SE_REGISTRY="+registry)
	var out, errs bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errs
	if err := cmd.Run(); err != nil {
		t.Fatalf("the verb did not run through RUNME: %v\nout: %s\nerr: %s", err, out.String(), errs.String())
	}

	// The verb reached dispatch: it answered a token, and the token is in the
	// project, so the work root arrived without touching argv.
	var minted Token
	if json.Unmarshal(out.Bytes(), &minted) != nil || minted.ID == "" {
		t.Fatalf("RUNME answered something that is not a token:\nout: %s\nerr: %s", out.String(), errs.String())
	}
	if _, err := LoadToken(r, minted.ID); err != nil {
		t.Fatalf("the token did not land in the project: %v", err)
	}
}
