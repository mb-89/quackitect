package main

import (
	"encoding/json"
	"strconv"
	"strings"
	"time"
)

// THE LANE, for Level 1. The stub decides nothing. It shapes the arguments,
// hands them to the engine, and returns what the engine said.
//
// A DESCRIPTION SAYS WHAT TO DO AND STOPS. Where a reader would ask why the
// door is shaped this way, the answer is [[a-description-is-an-instruction]].
//
// EVERY TOOL NAMES ITS ARGUMENTS ONCE, AS A STRUCT. The handler decodes into it
// and schema.go reads the same type for what the door advertises. Why that is
// the shape, and what it cost when it was two lists, is written in schema.go.

// laneTool is one tool: its name, what it says it does, and the request it
// takes. takes carries a zero request, which the advertised schema is read off.
type laneTool struct {
	name  string
	says  string
	takes any
}

// theLane is every tool this door offers. main.go's switch hands each one to
// the handler that declares the same request type, and
// TestToolSchemasComeFromTheirStructs holds the two together.
var theLane = []laneTool{
	{
		name: "se_start",
		says: "START THE ENGINE, and build it first if this tree carries none. " +
			"Every other tool here asks the engine, so this is the one to call when " +
			"they answer that it is not running. Calling it twice starts nothing twice.",
		takes: startArgs{},
	},
	{
		name:  "se_test",
		says:  "TEST WHAT YOU CHANGED, naming the token: on: <id>.",
		takes: testArgs{},
	},
	{
		name: "se_claim",
		says: "TAKE A BLOCK OF WORK so no other box starts it: next: <n>, or these: [ids]. " +
			"It publishes to git by itself, and list says what is claimed.",
		takes: claimArgs{},
	},
	{
		name: "se_find",
		says: "SEARCH THE TREE THROUGH THE INDEX: words (FTS5), regex, or path " +
			"(a glob; alone it lists files).",
		takes: findArgs{},
	},
	{
		name:  "se_ask",
		says:  "ASK THE INDEX: sql, read-only; schema prints the tables.",
		takes: askArgs{},
	},
	{
		name: "se_apply",
		says: "CHANGE FILES, naming the token: on: <id>. op: left off (replace old, " +
			"exactly once, with new), create, write. undo puts back what that token wrote, " +
			"and never another agent's work.",
		takes: applyArgs{},
	},
	{
		name: "se_run",
		says: "RUN A SHELL COMMAND in the work folder, naming the token: on: <id>. " +
			"A long output pages with page and from.",
		takes: runArgs{},
	},
	{
		name: "se_work",
		says: "MINT A WORK TOKEN: title (four words at most), detail, done_when, " +
			"and tracked, which says where it is born. tracked true puts it in doc/work, " +
			"which git carries, so another agent on another box can claim it. tracked false " +
			"keeps it in .se/work, for small work you do yourself next. A note takes neither " +
			"and is always private. Or on: <id> takes that token into your hands, and " +
			"put_down: <id> sets it back without closing it. Or abort: <id> with why " +
			"ends it where it stands, and disposition became names in successors what " +
			"it became.",
		takes: workArgs{},
	},
	{
		name: "se_stop",
		says: "NAME WHY YOU ARE STOPPING, when a stop was refused. No arguments " +
			"reads the list.",
		takes: stopArgs{},
	},
	{
		name: "se_pull",
		says: "PULL FOR WORK; act on work, refused or wait. Submit with id and " +
			"disposition, the checklist answered on the note.",
		takes: pullArgs{},
	},
	{
		name: "se_status",
		// A DESCRIPTION NAMING THREE THINGS IS READ FOR THOSE THREE. This tool
		// grew the state of play, which carries what the engine returned this
		// session and how much of it was wrong, and went on saying it answered
		// the roots, the log and the rules. So the numbers arrived and nobody
		// came for them.
		says: "What the engine knows: the two roots, the log it is writing, and " +
			"the rules in force. It also answers the state of play: what is open, " +
			"what is held, and what this session returned with how much of it was wrong.",
		takes: statusArgs{},
	},
	{
		name: "se_answer",
		says: "ANSWER THE PERSON, IN THE RECORD: the whole answer, for every " +
			"prompt. Then keep working.",
		takes: answerArgs{},
	},
	{
		name: "se_said",
		// ONE RULE, SAID ONCE, IN BOTH PLACES AN AGENT READS IT.
		//
		// This said the opposite of the guidance it sits beside. Look in the
		// log first is a condition over a private log that an agent has to
		// evaluate before every recording and can forget, and the guidance
		// removed it. An agent reads both.
		//
		// The sentence in saidRule is the guidance's own, and a check in this
		// package holds the two together. What is written here around it says
		// what this layer knows and the guidance does not: which message the
		// engine has already copied.
		says: "PUT WHAT THE PERSON SAID IN THE RECORD, WORD FOR WORD, when the " +
			"engine has not already copied it. " + saidRule,
		takes: saidArgs{},
	},
}

func laneTools() []map[string]any {
	out := make([]map[string]any, 0, len(theLane))
	for _, t := range theLane {
		out = append(out, map[string]any{
			"name": t.name, "description": t.says, "inputSchema": schemaOf(t.takes),
		})
	}
	return out
}

// testArgs is what se_test takes.
type testArgs struct {
	On      string   `json:"on"`
	Actor   string   `json:"actor"`
	Propose []string `json:"propose" says:"tests by name, or patterns"`
	Plan    bool     `json:"plan" says:"say what would run, run nothing"`
}

// claimArgs is what se_claim takes.
type claimArgs struct {
	Actor   string   `json:"actor"`
	Next    int      `json:"next" says:"claim what the queue would hand you on this many pulls"`
	These   []string `json:"these"`
	As      string   `json:"as" says:"with next: worker or reviewer"`
	Take    bool     `json:"take" says:"with these, and one id: take that token up as well, so a refused agent needs one call and not two"`
	Release bool     `json:"release" says:"give back what you hold"`
	List    bool     `json:"list"`
	Whoami  bool     `json:"whoami"`
	Sync    bool     `json:"sync" says:"look for other boxes' claims now, rather than waiting for the engine's clock"`
	// NoPublish writes the claim here and leaves git alone, which is what an
	// offline box wants and what a test that must not push needs.
	NoPublish bool `json:"no_publish" says:"write the claim here and leave git alone"`
}

// findArgs is what se_find takes, and it is the question the engine is asked,
// so an argument nobody set is left out rather than sent empty.
type findArgs struct {
	Words string `json:"words,omitempty"`
	Regex string `json:"regex,omitempty"`
	Path  string `json:"path,omitempty"`
	Limit int    `json:"limit,omitempty"`
	// Archive searches what has been archived rather than the tree. The
	// archive is not in the index, so this goes to the verb rather than to
	// the running model's index.
	Archive bool `json:"archive,omitempty" says:"search what has been archived rather than the tree"`
}

// askArgs is what se_ask takes.
type askArgs struct {
	SQL      string `json:"sql"`
	Search   string `json:"search"`
	Links    string `json:"links"`
	Dangling bool   `json:"dangling"`
	Schema   bool   `json:"schema"`
	Limit    int    `json:"limit"`
}

// askQuery is the question the engine is asked. schema is not in it: that is
// the engine's own text and it needs no engine running, so it never travels.
type askQuery struct {
	SQL      string `json:"sql,omitempty"`
	Search   string `json:"search,omitempty"`
	Links    string `json:"links,omitempty"`
	Dangling bool   `json:"dangling,omitempty"`
	Limit    int    `json:"limit,omitempty"`
}

// applyArgs is what se_apply takes.
type applyArgs struct {
	On    string    `json:"on"`
	Edits []editArg `json:"edits"`
	Dry   bool      `json:"dry"`
	Undo  bool      `json:"undo"`
	Actor string    `json:"actor"`
}

// editArg is one edit, in the shape src/engine/apply.go's Edit reads.
type editArg struct {
	File string `json:"file" must:"true"`
	Old  string `json:"old"`
	New  string `json:"new"`
	Op   string `json:"op"`
}

// runArgs is what se_run takes. from is a pointer because reading the end of a
// page is from: -200 and reading the start is from: 0, and a zero somebody
// asked for is not the same as one nobody sent.
type runArgs struct {
	On      string `json:"on"`
	Command string `json:"command"`
	Page    string `json:"page"`
	From    *int   `json:"from"`
	Actor   string `json:"actor"`
}

// workArgs is what se_work takes. tracked is a pointer because it has three
// answers and a bool has two: true, false, and a question nobody answered.
type workArgs struct {
	Title          string   `json:"title" must:"true"`
	Detail         string   `json:"detail"`
	Process        string   `json:"process"`
	Tracked        *bool    `json:"tracked"`
	ProposedAction string   `json:"proposed_action"`
	Approach       string   `json:"approach" says:"the shape the work will take, written before the work. A process that requires one refuses a mint without it"`
	DoneWhen       []string `json:"done_when"`
	DependsOn      []string `json:"depends_on"`
	Parent         string   `json:"parent"`
	NeedsHuman     bool     `json:"needs_human" says:"true when the answer is not yours: your best attempt, and a person reads it first"`
	On             string   `json:"on"`
	Actor          string   `json:"actor"`

	// ENDING A TOKEN FROM WHEREVER IT STANDS, which is a door of its own and
	// was the shell's alone. The engine grew an abort that can end a token as
	// became, and the lane could not say what a became names, so an agent here
	// could only record a split as work nobody wanted.
	// AND SETTING ONE DOWN, which the shell has had and the lane has not. se
	// work takes --put-down, so an agent at a prompt could set work back and an
	// agent in a lane could not. The lane is where every cloud agent lives.
	//
	// MEASURED THREE TIMES, IN SEPTEMBER 2026. Told to put work down, a session
	// reached for se claim --release, which frees the claim and leaves the hold.
	// A reviewer that finished and left kept its hold, and the next hand was
	// refused with one token has one holder while nobody held it.
	PutDown string `json:"put_down" says:"instead of minting: set a token you hold back, by id, without closing it"`

	Abort       string   `json:"abort" says:"instead of minting: end this token, by id, with why"`
	Why         string   `json:"why" says:"with abort: why it is ending. An abort with no reason is refused"`
	Disposition string   `json:"disposition" says:"with abort: how it ends, one the process declares (default: dropped)"`
	Successors  []string `json:"successors" says:"with abort and became: the ids it became"`
}

// statusArgs is what se_status takes, which is nothing.
//
// A TOOL THAT TAKES NO ARGUMENTS STILL NAMES A REQUEST. Its schema was the one
// literal left in the door, written beside the tool rather than read off what
// the handler decodes, so it was the one shape TestToolSchemasComeFromTheirStructs
// could not walk. An empty struct says the same thing and says it in the place
// every other tool says it.
type statusArgs struct{}

// answerArgs is what se_answer takes.
type answerArgs struct {
	Answer string `json:"answer" says:"what you would have said to them. The whole answer, not a summary of it." must:"true"`
}

// saidArgs is what se_said takes.
type saidArgs struct {
	Said string `json:"said" says:"what they said, copied. Their words and nothing else." must:"true"`
}

// stopArgs is what se_stop takes.
type stopArgs struct {
	Because string `json:"because"`
	Why     string `json:"why"`
	Actor   string `json:"actor"`
	List    bool   `json:"list" says:"print what is sanctioned, and claim nothing"`
}

// pullArgs is what se_pull takes: the payload the engine reads, and the two
// routing arguments that are this door's own.
type pullArgs struct {
	ID          string            `json:"id"`
	Evidence    map[string]string `json:"evidence"`
	Disposition string            `json:"disposition"`
	Successors  []string          `json:"successors"`
	Reason      string            `json:"reason"`
	Actor       string            `json:"actor"`
	Role        string            `json:"role" says:"worker, or reviewer for verdicts owed"`
}

// pullPayload is what a pull carries to the engine.
//
// EVERY FIELD THE ENGINE'S PAYLOAD CARRIES, AND NO MORE, held field for field
// against src/engine/pull.go's Payload by
// TestThePullDoorCarriesEveryFieldThePayloadHas. A door that invites an agent
// to fill in something nothing reads is worse than one that does not offer it,
// and a field the engine reads that this cannot send is a verdict a reviewer
// cannot deliver.
type pullPayload struct {
	ID          string            `json:"id,omitempty"`
	Evidence    map[string]string `json:"evidence,omitempty"`
	Disposition string            `json:"disposition,omitempty"`
	Successors  []string          `json:"successors,omitempty"`
	Reason      string            `json:"reason,omitempty"`
}

// errAnswer is a refusal the lane itself writes, in the shape every caller
// already parses.
type errAnswer struct {
	Error string `json:"error"`
}

func fail(why string) string {
	b, err := json.Marshal(errAnswer{Error: why})
	if err != nil {
		return `{"error":"the refusal will not encode"}` // only a string can fail here, and it cannot
	}
	return string(b)
}

func mintWork(r roots, a workArgs) string {
	// NAMING A TOKEN IS WHAT OPENS IT, so it goes through the same verb the
	// agent already has rather than becoming a second thing to remember.
	if a.On != "" {
		return engineCall(r, []string{"work", "--on", a.On, "--by", orMain(a.Actor)}, nil)
	}
	// AND SETTING ONE DOWN GOES THROUGH IT TOO, for the same reason.
	if a.PutDown != "" {
		return engineCall(r, putDownArgv(a), nil)
	}
	// AND ENDING ONE GOES THROUGH IT TOO, for the same reason.
	if a.Abort != "" {
		return engineCall(r, abortArgv(a), nil)
	}
	return engineCall(r, workArgv(a), nil)
}

// putDownArgv is the verb call se_work makes to set a token back.
//
// IT IS ITS OWN FUNCTION SO A TEST CAN READ THE CALL, the way abortArgv is. A
// door that offers a field the call behind it drops is the half with no output.
func putDownArgv(a workArgs) []string {
	return []string{"work", "--put-down", a.PutDown, "--by", orMain(a.Actor)}
}

// abortArgv is the verb call se_work makes to end a token.
//
// IT IS ITS OWN FUNCTION SO A TEST CAN READ THE CALL, the way workArgv is. A
// door that offers a field the call behind it drops is the half with no output,
// and successors is the field where that costs the record: an abort that
// silently dropped them would write became with nothing to follow.
func abortArgv(a workArgs) []string {
	argv := []string{"work", "--abort", a.Abort, "--by", orMain(a.Actor)}
	for _, pair := range [][2]string{{"--why", a.Why}, {"--disposition", a.Disposition}} {
		if pair[1] != "" {
			argv = append(argv, pair[0], pair[1])
		}
	}
	if said := saidOnly(a.Successors); len(said) > 0 {
		argv = append(argv, "--successors", strings.Join(said, ","))
	}
	return argv
}

// workArgv is the verb call se_work makes.
//
// IT IS ITS OWN FUNCTION SO A TEST CAN READ THE CALL, the shape claimArgv has
// and for the same reason. A door that offers a field while the call behind it
// drops it is the half with no output of its own, and needs_human is the field
// where that costs a person: the refusal over a box full of notes singles it
// out as the answer for a note nobody here can decide.
func workArgv(a workArgs) []string {
	// EVERY FLAG HERE IS ONE se work DEFINES.
	//
	// MEASURED, AND IT MEANT NOTHING COULD MINT THROUGH THIS DOOR. It sent
	// --assignee, --backlog, --guidance, --guidance-ref, --evidence-script,
	// --parent and --evidence, and the verb defines none of them, so the engine
	// printed its usage and minted nothing on every call. The extension's
	// builders are driven against the real binary by util/checks/engine-args.mjs
	// and these were not, which is why it was quiet.
	//
	// The agent minting is the actor it pulls as, so the engine is told rather
	// than left to guess.
	argv := []string{"work", "--title", a.Title, "--by", orMain(a.Actor)}
	// A fixed order, because a command line a person reads in the log should
	// look the same every time.
	for _, pair := range [][2]string{
		{"--detail", a.Detail}, {"--process", a.Process},
		{"--proposed-action", a.ProposedAction}, {"--approach", a.Approach},
		{"--parent", a.Parent},
	} {
		if pair[1] != "" {
			argv = append(argv, pair[0], pair[1])
		}
	}
	// TRACKED HAS THREE ANSWERS AND A BOOL HAS TWO, so it arrives as a pointer
	// and a question nobody answered stays unanswered rather than reading false.
	if a.Tracked != nil {
		argv = append(argv, "--tracked", strconv.FormatBool(*a.Tracked))
	}
	// THE FLAG A HELD AGENT IS TOLD TO SET. The refusal over a box full of notes
	// names needs_human as the answer for a note nobody here can decide, and
	// this door carried no way to say it, so the one answer it singled out was
	// the one an agent under it could not give.
	if a.NeedsHuman {
		argv = append(argv, "--needs-human")
	}
	if said := saidOnly(a.DependsOn); len(said) > 0 {
		argv = append(argv, "--depends-on", strings.Join(said, ","))
	}
	for _, says := range saidOnly(a.DoneWhen) {
		argv = append(argv, "--done-when", says)
	}
	return argv
}

// testTheDelta hands the engine a token's delta and a proposal, as the verb.
func testTheDelta(r roots, a testArgs) string {
	argv := []string{"test"}
	if a.On != "" {
		argv = append(argv, "--on", a.On)
	}
	for _, p := range saidOnly(a.Propose) {
		argv = append(argv, "--propose", p)
	}
	if a.Actor != "" {
		argv = append(argv, "--by", a.Actor)
	}
	if a.Plan {
		argv = append(argv, "--plan")
	}
	return engineCall(r, argv, nil)
}

// findInTree puts one search to the engine that lives, over its socket.
func findInTree(r roots, a findArgs) string {
	if a.Words == "" && a.Regex == "" && a.Path == "" {
		return "Say what to find: words, regex, or path."
	}
	if a.Limit < 0 {
		a.Limit = 0
	}
	// THE ARCHIVE IS NOT IN THE INDEX, so that search is the verb's and not the
	// model's. The flags are the verb's own, which mcp-tools.mjs drives.
	if a.Archive {
		argv := []string{"find", "--archive"}
		if a.Words != "" {
			argv = append(argv, "--words", a.Words)
		}
		if a.Regex != "" {
			argv = append(argv, "--regex", a.Regex)
		}
		if a.Path != "" {
			argv = append(argv, "--path", a.Path)
		}
		if a.Limit > 0 {
			argv = append(argv, "--limit", strconv.Itoa(a.Limit))
		}
		return engineCall(r, argv, nil)
	}
	raw, err := askModel(r, "find", a)
	if err != nil {
		return fail(err.Error())
	}
	return string(raw)
}

// askIndex puts one question to the index. One question per call, and the
// order is the verb's own, so the command a person reads in the log is the one
// they would type.
func askIndex(r roots, a askArgs) string {
	// THE SCHEMA IS THE ENGINE'S TEXT, and needs no engine running.
	if a.Schema {
		return engineCall(r, []string{"ask", "--schema"}, nil)
	}
	if a.SQL == "" && a.Search == "" && a.Links == "" && !a.Dangling {
		return "Say what to ask: sql, search, links, dangling or schema."
	}
	if a.Limit < 0 {
		a.Limit = 0
	}
	// THE QUESTION GOES TO THE ENGINE THAT LIVES, over its socket, and
	// nothing is started for it.
	raw, err := askModel(r, "ask", askQuery{SQL: a.SQL, Search: a.Search, Links: a.Links,
		Dangling: a.Dangling, Limit: a.Limit})
	if err != nil {
		return fail(err.Error())
	}
	return string(raw)
}

func stopClaim(r roots, a stopArgs) string {
	if a.List || a.Because == "" {
		return engineCall(r, []string{"stop", "--list"}, nil)
	}
	return engineCall(r, []string{"stop", "--actor", orMain(a.Actor),
		"--because", a.Because, "--why", a.Why}, nil)
}

func pull(r roots, a pullArgs) string {
	// Everything but the routing arguments is the payload, which the engine
	// reads. The stub does not know what a payload means.
	body, err := json.Marshal(pullPayload{ID: a.ID, Evidence: a.Evidence,
		Disposition: a.Disposition, Successors: a.Successors, Reason: a.Reason})
	if err != nil {
		return fail("the payload will not encode: " + err.Error())
	}
	// NO --as. se pull defines no such flag, so a call that named a role was
	// refused by the engine before it read a byte of the payload.
	argv := []string{"pull", "--actor", orMain(a.Actor)}
	if a.Role != "" {
		argv = append(argv, "--role", a.Role)
	}
	return engineCall(r, argv, body)
}

// verbCall is one verb, its flags and its standard input, as the engine that
// lives is asked for them.
type verbCall struct {
	Verb  string   `json:"verb"`
	Args  []string `json:"args"`
	Stdin string   `json:"stdin"`
	// Door names this client, so the engine can answer a lane and a shell
	// differently where the two want different answers.
	Door string `json:"door"`
}

// engineCall runs a subcommand with an optional payload on standard input. A
// subcommand answers JSON whether it worked or not, so the output is handed
// back whole rather than judged here.
//
// The evidence script runs inside the engine, and a test suite is a long
// thing, so the wait is longer than a question deserves and shorter than a
// hang.
func engineCall(r roots, args []string, stdin []byte) string {
	// THE VERB RUNS IN THE ENGINE THAT LIVES. The lane sends the verb, its
	// flags and the payload over the socket, and prints what the engine
	// wrote. Nothing is started for a call. With no engine over the folder
	// the answer says so, and how to start one.
	raw, err := askModelWithin(r, "verb",
		verbCall{Verb: args[0], Args: args[1:], Stdin: string(stdin), Door: "lane"}, 6*time.Minute)
	if err != nil {
		return fail(err.Error())
	}
	var a struct {
		Out  string `json:"out"`
		Err  string `json:"err"`
		Code int    `json:"code"`
	}
	if json.Unmarshal(raw, &a) != nil {
		return string(raw)
	}
	return strings.TrimRight(a.Out+a.Err, "\n")
}

// applyEdits hands the manifest to the engine, whole, on standard input.
//
// THE MANIFEST IS NOT FLATTENED INTO FLAGS. It is a list of edits carrying
// content with newlines and quotes in it, and a command line is the wrong shape
// for that: it has a length limit, and every layer between here and the engine
// would have to agree about quoting. The stub passes the bytes through.
func applyEdits(r roots, a applyArgs) string {
	// AN UNDO CARRIES ITS TOKEN LIKE ANY OTHER WRITE, and this dropped it.
	//
	// The stub took on: and actor: for an apply and threw both away for an undo,
	// so the engine was asked to put back the newest apply on the tree by anybody.
	// With several agents writing at once that is somebody else's change, and it
	// was: an undo named on one token restored a file belonging to another actor's.
	if a.Undo {
		if a.On == "" {
			return fail("say which token to undo, with on: <id>. An undo puts back what that token wrote")
		}
		return engineCall(r, []string{"apply", "--undo", "--on", a.On,
			"--by", orMain(a.Actor)}, nil)
	}
	if a.On == "" {
		return fail("say which token this change is, with on: <id>")
	}
	if len(a.Edits) == 0 {
		return fail("an apply with no edits: say what to change")
	}
	body, err := json.Marshal(a.Edits)
	if err != nil {
		return fail("the manifest will not encode: " + err.Error())
	}
	argv := []string{"apply", "--on", a.On, "--by", orMain(a.Actor)}
	if a.Dry {
		argv = append(argv, "--dry")
	}
	return engineCall(r, argv, body)
}

// runCommand hands the command to the engine on standard input, whole.
//
// NOT AS A FLAG. A command line holds quotes, newlines, dollar signs and pipes,
// and passing it as an argument makes every layer between the agent and the
// engine agree about quoting. They do not.
func runCommand(r roots, a runArgs) string {
	// READING A PAGE NAMES NO TOKEN, because looking is not writing.
	if a.Page != "" {
		argv := []string{"run", "--page", a.Page}
		if a.From != nil {
			argv = append(argv, "--from", strconv.Itoa(*a.From))
		}
		return engineCall(r, argv, nil)
	}
	if a.On == "" {
		return fail("say which token this command is, with on: <id>")
	}
	if strings.TrimSpace(a.Command) == "" {
		return fail("say what to run")
	}
	return engineCall(r, []string{"run", "--on", a.On, "--by", orMain(a.Actor)},
		[]byte(a.Command))
}

// claimWork is se claim through the lane. Every flag here is one the verb
// defines, which is what mcp-tools.mjs drives against the real engine.
func claimWork(r roots, a claimArgs) string {
	argv, refusal := claimArgv(a)
	if refusal != "" {
		return refusal
	}
	return engineCall(r, argv, nil)
}

// claimArgv is the verb call se_claim makes, or the sentence that refuses it
// before the engine is asked.
//
// IT IS ITS OWN FUNCTION SO A TEST CAN READ THE CALL. The flags here are the
// verb's, and the one an agent is sent to by a refusal is take: the engine
// refuses an unclaimed tracked token with "se claim --these <id> --take", and a
// lane that cannot spell that sends the reader to a door it does not have.
func claimArgv(a claimArgs) (argv []string, refusal string) {
	argv = []string{"claim", "--actor", orMain(a.Actor)}
	if a.Sync {
		argv = append(argv, "--sync")
	}
	if a.NoPublish {
		argv = append(argv, "--no-publish")
	}
	if a.Whoami {
		return append(argv, "--whoami"), ""
	}
	if a.List {
		return append(argv, "--list"), ""
	}
	ids := saidOnly(a.These)
	if len(ids) > 0 {
		argv = append(argv, "--these", strings.Join(ids, ","))
	}
	if a.Release {
		return append(argv, "--release"), ""
	}
	if a.Next > 0 {
		argv = append(argv, "--next", strconv.Itoa(a.Next))
		if a.As != "" {
			argv = append(argv, "--as", a.As)
		}
	}
	if len(ids) == 0 && a.Next <= 0 {
		return nil, "Say what to claim: these, or next."
	}
	// TAKE RIDES WITH THESE. The verb takes one token up at a time and says so
	// itself when more are named, so the flag is passed on rather than judged
	// here, and one place decides what take means.
	if a.Take && len(ids) > 0 {
		argv = append(argv, "--take")
	}
	return argv, ""
}

// showStatus is se_status through the lane. It takes no arguments and says so
// in its request, so the handler has the shape every other one here has and the
// guard can hold the two together.
func showStatus(r roots, _ statusArgs) string {
	return status(r)
}

func recordAnswer(r roots, a answerArgs) string {
	if a.Answer == "" {
		return "Say what you would have said to them."
	}
	if err := answered(r, a.Answer); err != nil {
		return "It could not be recorded: " + err.Error()
	}
	return "recorded"
}

func recordSaid(r roots, a saidArgs) string {
	if a.Said == "" {
		return "Say what they said."
	}
	if err := said(r, a.Said); err != nil {
		return "It could not be recorded: " + err.Error()
	}
	return "recorded"
}

// orMain is who is acting, and it is main where nobody said.
func orMain(actor string) string {
	if actor == "" {
		return "main"
	}
	return actor
}

// saidOnly drops the entries nobody filled in, because an empty flag value is
// an argument the engine has to refuse rather than one it can ignore.
func saidOnly(in []string) []string {
	var out []string
	for _, s := range in {
		if s != "" {
			out = append(out, s)
		}
	}
	return out
}
