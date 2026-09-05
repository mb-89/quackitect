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
	"tidy":    runTidy,
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
	// door is the client this call came through, empty for a shell. A verb
	// reads it the way it reads a flag.
	door string
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

// EVERY CALL A CALLER MAKES, BESIDE THE DISPATCH THAT ANSWERS IT.
//
// The dispatch above says which verbs there are and each verb's flag set says
// which flags it takes, and neither is readable from outside this process. So
// every caller retypes both, and the only thing joining the two programs is an
// array of strings that neither one checks. A control in the panel sent
// `se work --form "test"`: the engine has no --form, it printed its usage, and
// the person who typed a token watched it vanish.
//
// SO THE ENGINE ANSWERS THE CALLS ITSELF, at se query --calls, and the catalog
// sits beside the dispatch it describes. A second file would be the copy this
// exists to remove.
//
// THE LANGUAGE IS SUBSTITUTION AND NOTHING ELSE, so no caller needs an
// interpreter:
//
//   {name}  a hole anywhere in an argument, which the caller fills
//   when    a segment kept where the parameter it names is not empty
//
// A flag that varies with a boolean is two entries, hold.on beside hold.off,
// because a hole never spans a flag name. An entry carries the whole call, so
// what a caller composes into a view call is an entry with that call around it.
//
// TestEveryCallInTheCatalogIsOneTheVerbTakes hands each of these to the flag
// set of the verb it names, so a flag that is renamed here or there is red in
// the engine's own suite rather than in somebody's hands.

// aCall is one call: the arguments, and the segments kept only where the
// parameter they name has a value.
type aCall struct {
	Argv []string    `json:"argv"`
	When []whenGiven `json:"when,omitempty"`
}

// whenGiven is a segment of a call and the parameter that decides it.
type whenGiven struct {
	Given string   `json:"given"`
	Argv  []string `json:"argv"`
}

// catalog is what se query --calls answers.
type catalog struct {
	Always []string         `json:"always"`
	Calls  map[string]aCall `json:"calls"`
}

// everyCallCarries is what a caller appends to every call it makes. The folder
// being worked on is the caller's and nothing in a call names it.
var everyCallCarries = []string{"--work", "{work}"}

// theCalls is the catalog itself, one entry per call.
var theCalls = map[string]aCall{
	// THE CALL THAT FETCHES THE CATALOG IS IN THE CATALOG, so a caller holds one
	// call of its own and the engine hands back the rest.
	"calls": {Argv: []string{"query", "--calls"}},

	// THE WORK ITSELF.
	"mint": {
		Argv: []string{"work", "--title", "{title}", "--by", "person", "--process", "note"},
		When: []whenGiven{{Given: "detail", Argv: []string{"--detail", "{detail}"}}},
	},
	"editCell":    {Argv: []string{"work", "--set", "{id}", "--field", "{field}", "--to", "{text}", "--by", "person"}},
	"file":        {Argv: []string{"work", "--set", "{id}", "--field", "{field}", "--to", "{into}", "--by", "person"}},
	"group":       {Argv: []string{"work", "--file", "{ids}", "--by", "person"}},
	"renameGroup": {Argv: []string{"work", "--rename", "{from}", "--to", "{to}", "--by", "person"}},

	// THE HOLD, WHICH IS ONE PRESS AND TWO CALLS.
	"hold.on":  {Argv: []string{"hold", "--on", "--by", "person"}},
	"hold.off": {Argv: []string{"hold", "--off", "--by", "person"}},

	// HOW MUCH OF THE ENGINE SPEAKS TO THE AGENT, AND WHAT IT IS ASKED.
	"bind":    {Argv: []string{"--bind", "{to}"}},
	"binding": {Argv: []string{"--bind", "status"}},
	"ask.on":  {Argv: []string{"--ask", "on"}},
	"ask.off": {Argv: []string{"--ask", "off"}},
	"asked":   {Argv: []string{"--ask", "status"}},

	// READING A VIEW.
	"pane":  {Argv: []string{"query", "--view", "{file}", "--pane", "{pane}"}},
	"panes": {Argv: []string{"query", "--view", "{file}", "--panes"}},
	"views": {Argv: []string{"query", "--list"}},

	// WRITING ONE. Each of these is the whole call: the caller sends one entry
	// rather than a view call with a fragment inside it.
	"pin": {
		Argv: []string{"view", "--file", "{file}", "--pane", "{pane}", "--pin", "{name}"},
		When: []whenGiven{{Given: "matching", Argv: []string{"--matching", "{matching}"}}},
	},
	"unpin":       {Argv: []string{"view", "--file", "{file}", "--pane", "{pane}", "--unpin", "{name}"}},
	"width":       {Argv: []string{"view", "--file", "{file}", "--pane", "{pane}", "--width", "{property}={px}"}},
	"order":       {Argv: []string{"view", "--file", "{file}", "--pane", "{pane}", "--order", "{columns}"}},
	"level.sort":  {Argv: []string{"view", "--file", "{file}", "--pane", "{pane}", "--sort", "{property}", "--direction", "{direction}", "--at", "{at}"}},
	"level.group": {Argv: []string{"view", "--file", "{file}", "--pane", "{pane}", "--group", "{property}", "--direction", "{direction}", "--at", "{at}"}},
	"dropLevel":   {Argv: []string{"view", "--file", "{file}", "--pane", "{pane}", "--drop", "{kind}", "--at", "{at}"}},
	"filter":      {Argv: []string{"view", "--file", "{file}", "--pane", "{pane}", "--filter", "{groups}"}},

	// STARTING THE ENGINE AND EVERY OTHER WAY A CALLER DRIVES IT.
	"start":    {Argv: []string{}},
	"rotate":   {Argv: []string{"--rotate"}},
	"project":  {Argv: []string{"--project"}},
	"copies":   {Argv: []string{"--copies", "--method", "{method}"}},
	"attach":   {Argv: []string{"--attach", "--method", "{method}"}},
	"config":   {Argv: []string{"--config", "--method", "{method}"}},
	"set":      {Argv: []string{"--set", "{key}={value}", "--method", "{method}"}},
	"burndown": {Argv: []string{"--burndown", "{day}"}},
	"doing":    {Argv: []string{"--doing"}},
	"init":     {Argv: []string{"--init", "{kind}"}},

	// THE LANGUAGE SERVER, which the editor starts and then speaks to over
	// stdio. The transport is here because the engine refuses a flag it was not
	// given, and a client that adds one of its own is a server that exits
	// before it reads a byte.
	"lsp": {Argv: []string{"lsp", "--stdio"}},
}

// TheCatalog answers the calls a caller makes, with what every one of them
// carries.
func TheCatalog() catalog {
	return catalog{Always: everyCallCarries, Calls: theCalls}
}
