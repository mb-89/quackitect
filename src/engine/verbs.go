package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"io"
	"sort"
	"strings"
)

// EVERY VERB THIS PROGRAM ANSWERS, AND ONE DOOR THAT PARSES ITS FLAGS.
//
// Every verb parsed its flags and dropped whatever was left over. So
// `se lint doc/guidance/reviewing.md` answered clean, and so did
// `se lint /nope/not-a-file.md`. It is spelled like a check on the thing
// named, it exits zero, and the answer cannot be told apart from one where the
// file was read and approved. Three submissions in one day cited it as
// evidence about a file, in good faith, and each of them was right that they
// had run it.
//
// NO VERB HERE READS A PATH IT WAS HANDED. Everything a verb reads is named by
// a flag. So anything left over is a mistake, and a verb that will not use what
// it was given says so rather than answering success.
//
// THE LIST IS THE DISPATCH. A second list written by hand would go stale the
// first time somebody added a verb, and the check over it would then be a check
// over the verbs somebody remembered.
//
// A VERB IS A FUNCTION OVER A CALL, AND THE ENGINE THAT LIVES RUNS IT. The
// call carries the roots, what came in, and where the answer goes, and the
// verb answers an exit code. Nothing in a verb reaches the process it runs
// in: no standard output, no exit. So the same function runs inside the
// resident engine for the command line and the lane, which are clients of
// it, and a verb is one thing under both doors.
var run = map[string]verb{
	"apply":   runApply,
	"ask":     runAsk,
	"find":    runFind,
	"test":    runTest,
	"run":     runRun,
	"work":    runWork,
	"pull":    runPull,
	"stop":    runStop,
	"query":   runQuery,
	"state":   runState,
	"view":    runView,
	"move":    runMove,
	"claim":   runClaim,
	"lint":    runLint,
	"hold":    runHold,
	"retro":   runRetro,
	"said":    runSaid,
	"answer":  runAnswer,
	"config":  runConfig,
	"archive": runArchive,
}

// A VERB'S FLAG ERRORS AND USAGE GO TO err, NEVER TO out.
//
// THE OWNER'S WORDS: What's up with this error message?
//
// Every flag set sent its output to the answer stream. So one flag a verb has
// not got put a usage message where the reader was parsing JSON, and the
// panel could only say the answer was not JSON and nothing was minted: the
// cause was in the answer it had thrown away. out carries the answer and
// nothing else, err carries every reason, and a reader that finds an empty
// answer knows to read the other stream.
// TestAFlagAVerbHasNotGotLeavesTheAnswerStreamEmpty holds every verb to it.

// verb is what a verb is: the call in, the exit code out.
type verb func(c *call) int

// call is one invocation of a verb: whose tree, what was said, where the
// answer goes, and the context it runs under, which is the engine's for a
// verb run inside and main's for one run at a prompt.
type call struct {
	ctx   context.Context
	roots Roots
	args  []string
	in    io.Reader
	out   io.Writer
	err   io.Writer
	// refused is set by a verb that answers a refusal as a result with exit 0,
	// the way pull does, so the count of wrong results still sees it.
	refused bool
}

// Verbs answers every verb this program has, in order.
func Verbs() []string {
	out := make([]string, 0, len(run))
	for name := range run {
		out = append(out, name)
	}
	sort.Strings(out)
	return out
}

// WHAT THE ENGINE DID WITH A CALL, AS A CODE RATHER THAN AS A SENTENCE.
//
// A CHECK ASKED WHETHER A REFUSAL WAS WORDED ONE OF THREE WAYS, so rewording
// one would have turned it green over a command the engine never read. A
// message is a string somebody will reword and a code is the engine saying
// which kind of answer this is.
//
// ONE IS A REFUSAL ABOUT THE CONTENT, which is a real answer: a token id that
// does not exist is the engine reading the call and disagreeing with it.
const Unread = 2

// Stray answers what a verb was handed and will not read.
func Stray(verb string, left []string) error {
	if len(left) == 0 {
		return nil
	}
	// The flag form has no verb to name, so it names itself.
	said, help := "se "+verb, "se "+verb+" --help"
	if verb == "" {
		said, help = "se", "se --help"
	}
	return fmt.Errorf("%s reads nothing but its flags, and it was handed %s, "+
		"which nothing read. Name what you mean with a flag: %s",
		said, strings.Join(left, " "), help)
}

// parse is the one door a verb's flags come through. A verb that parses its own
// is a verb that can drop what it was handed, which is the whole defect.
//
// It answers whether the verb is done: a help asked for and printed, a flag
// the verb does not have, or something left over that nothing would read.
func (c *call) parse(fs *flag.FlagSet, verb string) (code int, stop bool) {
	// THE SET DOES NOT EXIT, because the process it runs in is the engine.
	fs.Init(fs.Name(), flag.ContinueOnError)
	fs.SetOutput(c.err)
	if err := fs.Parse(c.args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return 0, true
		}
		return Unread, true // the set has printed the flag and the usage
	}
	if err := Stray(verb, fs.Args()); err != nil {
		fmt.Fprintln(c.err, "engine:", err)
		return Unread, true
	}
	return 0, false
}

// fail is how a verb says it could not do what it was asked.
func (c *call) fail(err error) int {
	fmt.Fprintln(c.err, "engine:", err)
	return 1
}

// parse is the door for a verb that is its own process: the language
// server, which the editor starts and speaks to for as long as the window
// is open. A verb that runs inside the engine goes through the call's.
func parse(fs *flag.FlagSet, verb string, args []string) {
	_ = fs.Parse(args) // the set is ExitOnError, so a bad flag has already left
	if err := Stray(verb, fs.Args()); err != nil {
		failUnread(err)
	}
}

// parseFlags is the same door for the flag form.
//
// THE PROGRAM HAS TWO ENTRY POINTS AND THE RULE IS ABOUT BOTH. The eight verbs
// went through the door and the flag form did not, so se lint /nope refused
// while se --config /nope answered the configuration as though nothing were
// wrong, and the flag form is the one that carries --said, --answer and --set.
func parseFlags() {
	flag.Parse()
	if err := Stray("", flag.Args()); err != nil {
		failUnread(err)
	}
}
