package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// STARTING THE ENGINE IS A TOOL, BECAUSE NOTHING ELSE COULD DO IT.
//
// A cloud box clones this tree with nothing built. The lane comes up at once
// and answers its tool list, and every one of those tools asks an engine that
// is not there yet. The wake starts one, and the wake runs once: a session
// whose build finished a minute later had a built engine, no running one, and
// no way for the agent to say so.
//
// SO THE AGENT HAS A HAND ON IT. se_start builds what is missing, starts the
// engine, and says which of those it did. It is idempotent: an engine already
// answering is the answer, and nothing is started twice.
//
// IT IS THE ONE TOOL THAT DOES NOT ASK THE ENGINE. Every other tool in this
// lane sends a verb over the engine's socket and prints what came back. This
// one cannot, because the case it exists for is the case where there is nobody
// to send it to.

// theEngineExe is the built engine under the method root, whatever it is called
// on this platform.
func theEngineExe(r roots) string {
	name := "se"
	if isWindows() {
		name += ".exe"
	}
	return filepath.Join(r.method, ".bin", name)
}

// engineAnswers says whether an engine is up over this folder. It asks the
// engine itself rather than reading the pid file, because a pid file outlives
// the process that wrote it and a stale one reads exactly like a live engine.
func engineAnswers(r roots) bool {
	exe := theEngineExe(r)
	if _, err := os.Stat(exe); err != nil {
		return false
	}
	cmd := exec.Command(exe, "--ping", "--work", r.work, "--method", r.method)
	cmd.Stdin = nil
	done := make(chan error, 1)
	if err := cmd.Start(); err != nil {
		return false
	}
	go func() { done <- cmd.Wait() }()
	select {
	case err := <-done:
		return err == nil
	case <-time.After(10 * time.Second):
		_ = cmd.Process.Kill()
		return false
	}
}

// theBuildScript is the installer's bootstrap for this platform. The installer
// is the one thing that knows how this tree compiles, including the C compiler
// the engine's SQLite is pinned to, so nothing here builds anything itself.
func theBuildScript(r roots) (string, []string) {
	if isWindows() {
		return "powershell", []string{"-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
			filepath.Join(r.method, "util", "setup", "install.ps1"), "--profile", "headless"}
	}
	return "sh", []string{filepath.Join(r.method, "util", "setup", "install.sh"), "--profile", "headless"}
}

// buildIsRunning says whether a build is already writing into .bin. The lane's
// own stub starts one on a cold clone, so a se_start arriving during that must
// report it rather than start a second one over the same files.
func buildIsRunning(r roots) bool {
	marker := filepath.Join(r.work, ".se", "building.json")
	b, err := os.ReadFile(marker)
	if err != nil {
		return false
	}
	var m struct {
		Since string `json:"since"`
	}
	if json.Unmarshal(b, &m) != nil {
		return false
	}
	since, err := time.Parse(time.RFC3339, m.Since)
	if err != nil {
		return false
	}
	// A BUILD THAT HAS RUN LONGER THAN ANY BUILD DOES IS NOT A BUILD. The marker
	// is written by whoever starts one and nothing removes it when the process
	// dies, so age is what tells a running build from a leftover.
	return time.Since(since) < 20*time.Minute
}

func markBuilding(r roots) {
	_ = os.MkdirAll(filepath.Join(r.work, ".se"), 0o755)
	b, _ := json.Marshal(map[string]string{"since": time.Now().UTC().Format(time.RFC3339)})
	_ = os.WriteFile(filepath.Join(r.work, ".se", "building.json"), b, 0o644)
}

// startArgs is what se_start takes.
type startArgs struct {
	Wait int `json:"wait" says:"seconds to wait for it to answer, 0 for the default"`
}

// startTheEngine builds what is missing, starts the engine, and says what it
// did. Every answer names what to do next, because the case this runs in is the
// one where the agent has nothing else to go on.
func startTheEngine(r roots, a startArgs) string {
	say := func(v map[string]any) string {
		b, err := json.MarshalIndent(v, "", "  ")
		if err != nil {
			return fail(err.Error())
		}
		return string(b)
	}

	if engineAnswers(r) {
		return say(map[string]any{
			"running": true, "started": false,
			"says": "An engine is already up over this folder. Every tool in this lane reaches it.",
		})
	}

	exe := theEngineExe(r)
	if _, err := os.Stat(exe); err != nil {
		if buildIsRunning(r) {
			return say(map[string]any{
				"running": false, "building": true,
				"says": "The engine is being built and is not here yet. The first build compiles " +
					"SQLite and takes a few minutes, once. .se/lane.out says how far it has got. " +
					"Ask again in a minute.",
			})
		}
		markBuilding(r)
		build, args := theBuildScript(r)
		cmd := exec.Command(build, args...)
		cmd.Dir = r.method
		cmd.Stdin = nil
		if out, err := os.OpenFile(filepath.Join(r.work, ".se", "lane.out"),
			os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644); err == nil {
			cmd.Stdout, cmd.Stderr = out, out
			defer out.Close()
		}
		if err := cmd.Start(); err != nil {
			return say(map[string]any{
				"running": false, "building": false,
				"says": "The build would not start: " + err.Error() + ". At a shell, " +
					"util/setup/install.sh --profile headless is the same call.",
			})
		}
		_ = cmd.Process.Release()
		return say(map[string]any{
			"running": false, "building": true,
			"says": "The build has started. It compiles SQLite, which takes a few minutes, once. " +
				"Ask se_start again in a minute. .se/lane.out says how far it has got.",
		})
	}

	// THE ENGINE IS ITS OWN PROCESS. This one returns, and the harness may kill
	// this lane at any time, so the engine is released rather than waited on.
	_ = os.MkdirAll(filepath.Join(r.work, ".se"), 0o755)
	cmd := exec.Command(exe, "--work", r.work, "--method", r.method)
	cmd.Stdin = nil
	if out, err := os.OpenFile(filepath.Join(r.work, ".se", "engine.out"),
		os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644); err == nil {
		cmd.Stdout, cmd.Stderr = out, out
		defer out.Close()
	}
	if err := cmd.Start(); err != nil {
		return say(map[string]any{
			"running": false, "started": false,
			"says": "The engine would not start: " + err.Error(),
		})
	}
	_ = cmd.Process.Release()

	wait := a.Wait
	if wait <= 0 {
		wait = 30
	}
	until := time.Now().Add(time.Duration(wait) * time.Second)
	for time.Now().Before(until) {
		if engineAnswers(r) {
			return say(map[string]any{
				"running": true, "started": true,
				"says": "The engine is up. The guards are live from here, and every tool in this " +
					"lane reaches it. It writes the harness's own hook door as it starts, so the " +
					"cage arrives with it.",
			})
		}
		time.Sleep(500 * time.Millisecond)
	}
	said := ""
	if b, err := os.ReadFile(filepath.Join(r.work, ".se", "engine.out")); err == nil {
		lines := strings.Split(strings.TrimRight(string(b), "\n"), "\n")
		if n := len(lines); n > 0 {
			said = lines[n-1]
		}
	}
	return say(map[string]any{
		"running": false, "started": true,
		"says": "The engine was started and has not answered yet. .se/engine.out is what it said. " +
			"Ask se_start again.",
		"last": said,
	})
}
