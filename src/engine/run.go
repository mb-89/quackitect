package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"quackitect/engine/internal/quiet"
	"runtime"
	"strings"
	"time"
)

// A SHELL COMMAND NAMES ITS TOKEN, BECAUSE IT COULD WRITE.
//
// THE OWNER'S WORDS: make the shell thing also route through the server, and a
// shell will just always demand a token because it could write.
//
// THE ENGINE CANNOT READ A COMMAND AND KNOW WHETHER IT WRITES. sed -i, a
// redirection, mv, rm and a script somebody wrote all reach the filesystem, and
// a list of safe programs goes stale the day anybody runs a new one. So the
// question is not asked: every command names the work it belongs to, the same
// way every edit does, and the record says which token each one was run under.
//
// A STANDING HAND WAS THE OTHER ANSWER AND IT LEAKED. Holding a token let every
// shell call through for as long as it was held, so one name bought a session
// of writes and nothing said which of them belonged to what.

// THE WHOLE OUTPUT IS KEPT AND A WINDOW OF IT COMES BACK.
//
// TRUNCATION AND PAGING ARE NOT THE SAME THING, and this was truncation. It
// dropped the head of a long output on the floor, so a build that printed a
// hundred errors answered with the last few and the rest was gone: the agent
// could not go and look, because there was nowhere to look.
//
// So the output goes to a file under .se/out and the answer carries a window
// plus how to ask for the next one. Nothing is lost, the turn stays small, and
// which part matters is the reader's decision rather than this function's.

// ThePageSize is how much of an output comes back at once.
const ThePageSize = 40 * 1024

// TheRunCeiling is how long a command may take before it is stopped. A command
// that never finishes holds the turn open for ever.
const TheRunCeiling = 10 * time.Minute

// Ran is what a command did, at the width an agent needs to act on it.
type Ran struct {
	On      string `json:"on"`
	Command string `json:"command,omitempty"`
	Exit    int    `json:"exit"`

	// Output is the window, and Bytes is how long the whole thing is.
	Output string `json:"output"`
	Bytes  int    `json:"bytes"`
	From   int    `json:"from"`

	// Page is the handle this output is kept under, and More says there is
	// something after this window. A reader asks for the next one by name, so
	// a second command in between does not move it.
	Page string `json:"page,omitempty"`
	More bool   `json:"more,omitempty"`

	// Shell is what ran the command. It is sh wherever there is one, and cmd
	// on a Windows without it, and the two do not understand the same syntax.
	// A command that behaved oddly is a command whose shell is worth knowing.
	Shell string `json:"shell,omitempty"`

	// Timeout says the command was stopped rather than finished, because an
	// exit code alone reads as an ordinary failure.
	Timeout bool `json:"timed_out,omitempty"`
}

func outDir(r Roots) string { return r.Private("out") }

// Run runs one command in the folder being worked on and answers what it did.
//
// OUT AND ERR COME BACK AS ONE STREAM, in the order they were written, because
// that is the order a person reads them in and splitting them puts a failure's
// message somewhere other than under the line that caused it.
func Run(r Roots, command string) (Ran, error) {
	command = strings.TrimSpace(command)
	if command == "" {
		return Ran{}, fmt.Errorf("say what to run")
	}
	out := Ran{Command: command, Shell: TheShell(r)}

	cmd := shellCommand(r, command)
	done := make(chan struct{})
	var said []byte
	var err error
	go func() { said, err = cmd.CombinedOutput(); close(done) }()

	select {
	case <-done:
	case <-time.After(TheRunCeiling):
		if cmd.Process != nil {
			_ = cmd.Process.Kill() // it has already finished, which is the only way this fails
		}
		<-done
		out.Timeout = true
	}
	if code := cmd.ProcessState; code != nil {
		out.Exit = code.ExitCode()
	} else if err != nil {
		out.Exit = -1
	}

	out.Bytes = len(said)
	// A SHORT OUTPUT IS KEPT NOWHERE. Most commands answer in a line or two,
	// and a file per line would fill the folder with nothing worth reading.
	if len(said) <= ThePageSize {
		out.Output = string(said)
		return out, nil
	}
	page, err := keepOutput(r, said)
	if err != nil {
		// THE OUTPUT IS STILL ANSWERED IF IT CANNOT BE KEPT. A page nobody can
		// write is a reason to say so, not a reason to lose the first window.
		out.Output = string(said[:ThePageSize])
		out.More = true
		return out, nil
	}
	out.Page, out.Output, out.More = page, string(said[:ThePageSize]), true
	return out, nil
}

// ReadPage answers one window of an output that was kept.
//
// FROM COUNTS FROM THE END WHEN IT IS NEGATIVE, because the reason to page a
// build log is usually to read how it ended.
func ReadPage(r Roots, page string, from int) (Ran, error) {
	if strings.ContainsAny(page, `/\:`) || strings.Contains(page, "..") {
		return Ran{}, fmt.Errorf("no such page: %q", page)
	}
	b, err := os.ReadFile(filepath.Join(outDir(r), page+".txt"))
	if err != nil {
		return Ran{}, fmt.Errorf("no such page: %s. A short output is not kept, "+
			"and a retro drains the ones that are", page)
	}
	if from < 0 {
		from = len(b) + from
	}
	if from < 0 {
		from = 0
	}
	if from > len(b) {
		from = len(b)
	}
	end := from + ThePageSize
	if end > len(b) {
		end = len(b)
	}
	return Ran{Page: page, Bytes: len(b), From: from,
		Output: string(b[from:end]), More: end < len(b)}, nil
}

// keepOutput writes the whole output and answers the name to ask for it by.
func keepOutput(r Roots, said []byte) (string, error) {
	name := time.Now().UTC().Format("20060102-150405.000000000")
	if err := writeAtomic(filepath.Join(outDir(r), name+".txt"), said, 0o644); err != nil {
		return "", err
	}
	return name, nil
}

// shellCommand is the one place a command line becomes a process.
//
// SH WHEREVER THERE IS ONE, INCLUDING HERE. This ran cmd on Windows, and cmd is
// not the shell this tree is written for: every check is `sh util/checks/...`,
// and a command with a newline or a single quote in it came back with an exit
// code of nought and no output at all. A command that silently does nothing is
// worse than one that is refused.
//
// CMD IS THE FALLBACK AND NOT THE DEFAULT, for a Windows without a sh on the
// path. The installer fetches Git, which brings one.
func shellCommand(r Roots, script string) *exec.Cmd {
	// THE RESOLVED PATH RUNS, NOT THE BARE NAME. The shell Git brought is not
	// on PATH, so naming it sh here would fail to start the very shell the
	// lookup just found.
	sh, _ := posixShell(r)
	name, args := sh, []string{"-c", script}
	if sh == "" {
		name, args = "cmd", []string{"/c", script}
	}
	cmd := quiet.Quietly(exec.Command(name, args...))
	if sh == "" {
		cmd = quiet.TheScriptVerbatim(cmd, script)
	}
	cmd.Dir = r.Work
	// EVERY PROBED TOOL RESOLVES, so a command carries no environment of its
	// own. A stale probe only pins directories, and a directory that lost its
	// tool falls through to the parent's PATH behind it.
	if p, ok := LoadProbe(r); ok {
		cmd.Env = PathWithTools(os.Environ(), p.Found)
	}
	return cmd
}

// TheShell says which shell a command will run in, so a caller can say so and a
// check can assert it rather than guessing from the platform.
func TheShell(r Roots) string {
	if sh, _ := posixShell(r); sh != "" {
		return "sh"
	}
	return "cmd"
}

// posixShell answers the shell a command runs in, and the places it looked. An
// empty name means this machine really has none.
//
// IT IS THE LOOKUP THE BATTERY ALREADY USES, rather than a second one beside
// it. This asked exec.LookPath for sh and nothing else. Git for Windows puts
// git.exe on PATH from its cmd folder and leaves sh.exe in the sibling bin
// folder, which is not on PATH, so on a machine carrying two copies of sh the
// answer was cmd. Every command written for sh, which is what the guidance and
// every helper script assume, then ran in cmd: exit 0, no output worth reading,
// and a line saying 'ls' is not recognized. Nothing said the shell had changed
// under it. The battery had already learned to ask the probe where git is and
// look beside it, so both ask the same question in the same place now.
func posixShell(r Roots) (string, []string) {
	if runtime.GOOS != "windows" {
		return "sh", []string{"sh on PATH"}
	}
	return batteryShell(r)
}
