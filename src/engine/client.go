package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// THE COMMAND LINE IS A CLIENT OF THE ENGINE THAT LIVES.
//
// A verb typed at a prompt is sent to the engine over the folder, which runs
// it with the index open and the record held, and what the engine wrote
// comes back to the prompt with the engine's exit code. Nothing about the
// verb runs in this process. With no engine over the folder there is nothing
// to run it, and the answer says to start one.
//
// HELP NEEDS NO ENGINE. A verb asked for its usage is answered here, off the
// same function, because a person reading the flags has not started
// anything yet and should not have to.

// verbAsk is what the client sends: the verb, its flags, and what was on
// standard input, which a verb such as run or pull reads whole.
type verbAsk struct {
	Verb  string   `json:"verb"`
	Args  []string `json:"args"`
	Stdin string   `json:"stdin,omitempty"`
}

// verbAnswer is what comes back: both streams and the code.
type verbAnswer struct {
	Out  string `json:"out"`
	Err  string `json:"err"`
	Code int    `json:"code"`
}

// verbBudget is how long the client waits for a verb. A run of the test
// suite is a verb, so the budget is the run verb's own ceiling and a little.
const verbBudget = TheRunCeiling + time.Minute

// callTheEngine sends one verb and answers its exit code.
func callTheEngine(ctx context.Context, verb string, args []string) int {
	// BOTH ROOTS COME OFF THE VERB'S OWN ARGUMENTS. Only the flag form carried
	// --method, so every verb took the guess whatever the caller typed.
	roots, err := FindRoots(argValue(args, "--work"), argValue(args, "--method"))
	if err != nil {
		fmt.Fprintln(os.Stderr, "engine:", err)
		return 1
	}
	// NO METHOD, NO WORK. A verb run from outside the method used to derive
	// every path from a folder that was not one, and file findings from it.
	if !roots.MethodFound() {
		fmt.Fprintln(os.Stderr, TheMethodIsLost())
		return 1
	}
	// THE CALLER HEARS WHERE ITS WORK WENT. A folder named inside a project
	// answers the project, and a mint aimed at a scratch folder that lands in
	// the real backlog is quiet damage while nothing says this.
	if asked, got, moved := WorkMoved(argValue(args, "--work")); moved {
		fmt.Fprintf(os.Stderr, "engine: %s is inside %s, so that is the folder being worked on. "+
			"Every path is under it, and anything minted lands there. Name a folder "+
			"outside a project to work on its own\n", asked, got)
	}
	if wantsHelp(args) {
		return run[verb](&call{ctx: ctx, roots: roots, args: args, in: os.Stdin, out: os.Stdout, err: os.Stderr})
	}
	raw, _, ok := askModelWithin(roots, "verb", verbAsk{Verb: verb, Args: args, Stdin: stdinFor(verb, args)}, verbBudget)
	if !ok {
		fmt.Fprintf(os.Stderr, "engine: no engine is running over %s, so there is nothing to run %s. "+
			"Start it: se --work %s\n", roots.Work, verb, roots.Work)
		return 1
	}
	var a verbAnswer
	if err := json.Unmarshal(raw, &a); err != nil {
		fmt.Fprintln(os.Stderr, "engine: the engine's answer will not read:", err)
		return 1
	}
	_, _ = io.WriteString(os.Stdout, a.Out) // a closed stdout is the caller's, and the code still says what happened
	_, _ = io.WriteString(os.Stderr, a.Err)
	return a.Code
}

// stdinFor reads standard input for the verbs that take a payload there, and
// for no other.
//
// READING STDIN FOR EVERY VERB HUNG THE CLIENT. A shell that hands a process
// an open pipe and never closes it is not a terminal, so a read until the end
// waited for an end that never came, and se lint sat for the whole of the
// verb's budget. So the verb decides: run and apply take their payload there
// and read to the end, work does when told to, and pull may, so it waits a
// moment for one and goes on without.
func stdinFor(verb string, args []string) string {
	if st, err := os.Stdin.Stat(); err != nil || st.Mode()&os.ModeCharDevice != 0 {
		return "" // a terminal, and nobody typed a payload
	}
	switch verb {
	case "run", "apply":
		return readAllStdin()
	case "work":
		for _, a := range args {
			if a == "--stdin" || a == "-stdin" {
				return readAllStdin()
			}
		}
		return ""
	case "pull":
		got := make(chan string, 1)
		go func() { got <- readAllStdin() }()
		select {
		case s := <-got:
			return s
		case <-time.After(payloadGrace):
			return "" // an open pipe with nothing on it is a pull for work
		}
	}
	return ""
}

// payloadGrace is how long a pull waits for a payload on an open pipe.
const payloadGrace = 300 * time.Millisecond

func readAllStdin() string {
	b, _ := io.ReadAll(io.LimitReader(os.Stdin, 16<<20)) // a stream that will not read is an empty one, and the verb says so
	return string(b)
}

func wantsHelp(args []string) bool {
	for _, a := range args {
		if a == "-h" || a == "--help" || a == "-help" {
			return true
		}
	}
	return false
}

// runVerbInside runs one verb inside the engine that lives, over a fresh
// snapshot of the roots, and answers what it wrote.
//
// A SNAPSHOT PER VERB. The roots carry one, filled the first time the verb
// asks and dropped by its writes, and it is this verb's alone: a snapshot
// that outlived the verb would be a second truth in a process that lives.
func runVerbInside(ctx context.Context, r Roots, ask verbAsk) verbAnswer {
	v, ok := run[ask.Verb]
	if !ok {
		return verbAnswer{Err: "engine: no such verb: " + ask.Verb + "\n", Code: Unread}
	}
	var out, errs strings.Builder
	c := &call{ctx: ctx, roots: r.ReadOnce(), args: ask.Args, in: strings.NewReader(ask.Stdin), out: &out, err: &errs}
	code := v(c)
	// EVERY RESULT IS COUNTED HERE, because every lane result passes here on
	// its way back. Wrong is a code that is not zero, or a refusal the verb
	// answered with exit 0 and marked. See results.go.
	CountResult(r, code != 0 || c.refused)
	return verbAnswer{Out: out.String(), Err: errs.String(), Code: code}
}

// workRootOf answers the folder a verb's --work names, or the current one.
func workRootOf(args []string) string {
	for i, a := range args {
		if a == "--work" && i+1 < len(args) {
			return args[i+1]
		}
	}
	wd, _ := os.Getwd()
	return filepath.Clean(wd)
}
