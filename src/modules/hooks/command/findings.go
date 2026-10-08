// The rules over a shell command: each finding names its rule, the words it
// reads, and the road the agent takes instead.
// [[spec/tickets/cage-command-rules-port]]
package command

import (
	"regexp"
	"strconv"
	"strings"
)

// The rules the findings name. [[spec/design_output/bash#what-the-door-reads]]
const (
	ShellWrites     = "ShellWritesNothing"
	BranchCap       = "BranchNameHoldsFive"
	TestRun         = "TestRunPointsSomewhere"
	PrivateHome     = "PrivateStaysHome"
	CommitDoor      = "CommitMeetsTheDoor"
	LandingGate     = "LandingFollowsItsGate"
	CommitMessage   = "CommitCarriesItsMessage"
	GitWrite        = "GitWritesThroughAVerb"
	TicketRename    = "TicketMovesByRename"
	PullCommitStand = "PullCommitStands"
)

// The private half and its notes, which private.go owns, and the prose and code a rule reads. [[spec/design_output/private#the-second-door]]
const (
	home  = ".se"
	notes = ".se/notes"
)

// [[spec/design_output/bash#a-shell-writes-nothing]]
var (
	prose = regexp.MustCompile(`(?i)\.(md|markdown|txt)$`)
	code  = regexp.MustCompile(`(?i)\.(js|jsx|ts|tsx|json|jsonc)$`)
)

// One finding over a command: its rule, the words it reads, and its message. [[spec/design_output/bash#what-every-refusal-owes]]
type Row struct {
	Rule    string
	Said    string
	Message string
}

// What the findings read beyond the command: the cloud flag, a file's text under the root, and the subjects of the commits an undo drops. [[spec/design_output/bash#what-the-door-reads]]
type It struct {
	Cloud    bool
	Script   func(path string) string
	Subjects func(Undo) []string
}

// The verb scripts, and a verb's program, which names its verb off the file name. [[spec/tickets/cli-js-leaves]]
var (
	verbRoots   = setOf("RUNME.sh", "RUNME.ps1")
	verbProgram = regexp.MustCompile(`(^|/)src/scripts/verbs/([a-z]+)\.js$`)
)

// The verbs a command runs with no ticket named, and the reads that ride beside one. [[spec/design_output/level0#a-shell-names-its-ticket]]
var (
	ticketFree = [][2]string{{"branch", "take"}, {"branch", "list"}, {"branch", "sync"}, {"ticket", "pull"}, {"mint", "ticket"}, {"ticket", "note"}}
	besideFree = setOf("cd", "pushd", "popd", "pwd", "ls", "echo", "tail", "head", "grep", "wc", "cat", "sort")
)

// The operators running the next segment whatever the one before answers, and the reads that gate nothing. [[spec/design_output/bash#a-landing-follows-its-gate]]
var (
	gates    = setOf(";", "||", "&")
	reads    = setOf("cat", "grep", "rg", "ls", "head", "tail", "wc", "cd", "pwd", "echo", "printf", "find")
	gitReads = setOf("status", "log", "diff", "show", "branch", "rev-parse")
)

// The words a command runs past, a name's value, a flag taking a value, and the flags carrying a message over. [[spec/design_output/bash#what-the-door-reads]]
var (
	passes  = setOf("sudo", "env", "command", "nohup", "time", "exec")
	assigns = regexp.MustCompile(`^[A-Za-z_][A-Za-z0-9_]*=`)
	letters = regexp.MustCompile(`^-[A-Za-z]+$`)
	slashes = regexp.MustCompile(`[/\\]+`)
	valued  = "mFCctSu"
	carried = []string{"-C", "-c", "--reuse-message", "--reedit-message", "--no-edit", "--fixup", "--squash"}
)

// Every finding over a command, in the bridge's order; most caps a name's words. [[spec/design_output/bash#what-the-door-reads]]
func Findings(command string, most int, it It) []Row {
	var out []Row
	for _, one := range append(writesAPath(command), scriptWrites(command, it.Script)...) {
		out = append(out, row(ShellWrites, one.path,
			"A shell writes past every rule in this tree, so "+one.how+" into "+one.path,
			"meets none. Read "+one.path+" with Read, and write it with mcp__level0__patch",
			"or mcp__level0__replace, naming the ticket the write serves in its ticket field."))
	}
	for _, one := range branchIn(command) {
		part := overLong(one, most)
		if part == "" {
			continue
		}
		out = append(out, row(BranchCap, one,
			"A name holds at most "+strconv.Itoa(most)+" words, and "+part+" holds more. Cut it, or run",
			"./RUNME.sh branch open <group>, which pushes the branch its group names."))
	}
	for _, one := range testIn(command) {
		out = append(out, row(TestRun, one,
			"./RUNME.sh check runs the suite, the doors check and the plugin check, and",
			one+" runs the suite alone. Run ./RUNME.sh check, or name one file:",
			"node --test test/level0/log.test.js."))
	}
	for _, one := range addsIn(command) {
		out = append(out, row(PrivateHome, one,
			home+" is the private half, and git ignores it. "+one+" carries a raw note,",
			"a log line or a key, and a tracked file carries what an author writes for a",
			"reader outside this box. Write that, and leave "+notes+" where it stands."))
	}
	if it.Cloud && SkipsTheHook(command) {
		out = append(out, row(CommitDoor, "--no-verify",
			"The pre-commit hook holds the privacy check, and this flag steps past it.",
			"A cloud box carries no person, so the flag stays home here: drop it, and",
			"commit through the door."))
	}
	for _, one := range landingsAfterGates(command) {
		out = append(out, row(LandingGate, one,
			one+" runs whatever the command before it answers, so it lands over a",
			"failing gate. Join the two with &&, or run the landing alone once the gate",
			"answers green."))
	}
	out = append(out, pullCommitsIn(command, it)...)
	if said, ok := CommitIn(command); ok && said.Form == FormNone {
		out = append(out, row(CommitMessage, "git commit",
			"A commit through an editor is no thing an agent does, and a message no",
			`rule reads is prose nobody holds. Pass it: git commit -m "...", or -F`,
			"<file>."))
	}
	return append(out, gitWriteRows(command)...)
}

// Whether every verb the command runs is one that names no ticket, the reads beside them aside. [[spec/design_output/level0#a-shell-names-its-ticket]]
func FreeOfTicket(command string) bool {
	segments, _ := partsOf(command)
	found := 0
	for _, one := range segments {
		words := wordsIn(one)
		if besideFree[BaseName(first(words))] {
			continue
		}
		found++
		if !freeVerbIn(words) {
			return false
		}
	}
	return found > 0
}

// [[spec/design_output/level0#a-shell-names-its-ticket]]
func freeVerbIn(words []string) bool {
	said, ok := verbWordsIn(words)
	if !ok || len(said) < 2 {
		return false
	}
	for _, one := range ticketFree {
		if one[0] == said[0] && one[1] == said[1] {
			return true
		}
	}
	return false
}

// The verb and the words past it, off a verb root or a verb's program. [[spec/tickets/cli-js-leaves]]
func verbWordsIn(words []string) ([]string, bool) {
	for at, one := range words {
		if verbRoots[BaseName(one)] {
			return words[at+1:], true
		}
		if program := verbProgram.FindStringSubmatch(strings.ReplaceAll(one, `\`, "/")); program != nil {
			return append([]string{program[2]}, words[at+1:]...), true
		}
	}
	return nil, false
}

// A landing after a gate that runs it whatever the gate answers. The heredocs come out first, so a body's newline reads as no gate. [[spec/design_output/bash#a-landing-follows-its-gate]]
func landingsAfterGates(command string) []string {
	text, _ := withoutHeredocs(command)
	var segment []Token
	var found []string
	var pipeline, before [][]Token
	beforeOp := ""
	settle := func() {
		if landing := landingOf(segment); landing != "" && gatesLoosely(before, beforeOp) {
			found = append(found, landing)
		}
	}
	for _, one := range TokensOf(text) {
		if !(one.Op && breaks[one.Text]) {
			segment = append(segment, one)
			continue
		}
		settle()
		if len(segment) > 0 {
			pipeline = append(pipeline, segment)
		}
		if one.Text != "|" && len(pipeline) > 0 {
			before, beforeOp = pipeline, one.Text
			pipeline = nil
		}
		segment = nil
	}
	settle()
	return found
}

// A read gates nothing. A gate before a loose operator runs the landing whatever it answers, and so does a gate piped into a read. [[spec/tickets/doors-read-what-commands-do]]
func gatesLoosely(pipeline [][]Token, op string) bool {
	if len(pipeline) == 0 {
		return false
	}
	allRead := true
	for _, one := range pipeline {
		if !isRead(one) {
			allRead = false
		}
	}
	if allRead {
		return false
	}
	return gates[op] || (op == "&&" && len(pipeline) > 1)
}

// [[spec/tickets/doors-read-what-commands-do]]
func isRead(segment []Token) bool {
	words := wordsIn(segment)
	name := BaseName(first(words))
	if name == "git" {
		return gitReads[first(afterGit(words))]
	}
	return reads[name]
}

// What a segment lands: a ticket pull, a ticket open, a git commit or the commit verb. [[spec/design_output/bash#a-landing-follows-its-gate]]
func landingOf(segment []Token) string {
	words := wordsIn(segment)
	if BaseName(first(words)) == "git" {
		if first(afterGit(words)) == "commit" {
			return "git commit"
		}
		return ""
	}
	said, ok := verbWordsIn(words)
	if !ok || len(said) == 0 {
		return ""
	}
	if said[0] == "commit" {
		return "./RUNME.sh commit"
	}
	if said[0] == "ticket" && len(said) > 1 && (said[1] == "pull" || said[1] == "open") {
		return "./RUNME.sh ticket " + said[1]
	}
	return ""
}

// The segments of a command, split at every break, and the heredoc bodies by their word. [[spec/design_output/bash#what-the-door-reads]]
func partsOf(command string) ([][]Token, map[string]string) {
	text, bodies := withoutHeredocs(command)
	segments := [][]Token{nil}
	for _, one := range TokensOf(text) {
		if one.Op && breaks[one.Text] {
			segments = append(segments, nil)
			continue
		}
		segments[len(segments)-1] = append(segments[len(segments)-1], one)
	}
	var out [][]Token
	for _, one := range segments {
		if len(one) > 0 {
			out = append(out, one)
		}
	}
	return out, bodies
}

// A heredoc's opening word, which the bridge also reads quoted alike. [[spec/design_output/bash#what-the-door-reads]]
var heredoc = regexp.MustCompile(`<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)`)

// The command with every heredoc body out, and each body by its word. [[spec/design_output/bash#what-the-door-reads]]
func withoutHeredocs(text string) (string, map[string]string) {
	bodies := map[string]string{}
	var kept, body []string
	word, waiting := "", false
	for _, line := range strings.Split(text, "\n") {
		if waiting {
			if strings.TrimSpace(line) == word {
				bodies[word] = strings.Join(body, "\n")
				waiting = false
				continue
			}
			body = append(body, line)
			continue
		}
		kept = append(kept, line)
		if found := heredocIn(line); found != "" {
			word, waiting, body = found, true, nil
		}
	}
	if waiting {
		bodies[word] = strings.Join(body, "\n")
	}
	return strings.Join(kept, "\n"), bodies
}

// The first heredoc word a line opens, where no third < stands before it and a quote closes as it opens. [[spec/design_output/bash#what-the-door-reads]]
func heredocIn(line string) string {
	for _, at := range heredoc.FindAllStringSubmatchIndex(line, -1) {
		quote := line[at[2]:at[3]]
		if quote != "" && !strings.HasPrefix(line[at[5]:], quote) {
			continue
		}
		if at[0] > 0 && line[at[0]-1] == '<' {
			continue
		}
		return line[at[4]:at[5]]
	}
	return ""
}

// The words of a segment past its assignments and the words a command runs through. [[spec/design_output/bash#what-the-door-reads]]
func wordsIn(segment []Token) []string {
	var said []string
	for _, one := range segment {
		if !one.Op {
			said = append(said, one.Text)
		}
	}
	at := 0
	for at < len(said) && (assigns.MatchString(said[at]) || passes[BaseName(said[at])]) {
		at++
	}
	return said[at:]
}

// The words after git and its own leading flags. [[spec/design_output/bash#what-the-door-reads]]
func afterGit(words []string) []string {
	var out []string
	for i := 1; i < len(words); i++ {
		one := words[i]
		if len(out) == 0 && strings.HasPrefix(one, "-") {
			if one == "-C" || one == "-c" {
				i++
			}
			continue
		}
		out = append(out, one)
	}
	return out
}

// A flag's value, off the flag alone, its = form, or a run of short flags. [[spec/design_output/bash#what-the-door-reads]]
type flagged struct {
	found bool
	value string
	took  bool
}

// [[spec/design_output/bash#what-the-door-reads]]
func flagValue(arg string, args []string, at int, flags ...string) flagged {
	next := ""
	if at+1 < len(args) {
		next = args[at+1]
	}
	for _, flag := range flags {
		if arg == flag {
			return flagged{true, next, true}
		}
		if strings.HasPrefix(arg, flag+"=") {
			return flagged{true, arg[len(flag)+1:], false}
		}
		if len(flag) == 2 && letters.MatchString(arg) && arg != flag {
			letter := flag[1:]
			if !strings.Contains(arg, letter) {
				continue
			}
			if strings.HasSuffix(arg, letter) {
				return flagged{true, next, true}
			}
			return flagged{true, arg[strings.Index(arg, letter)+1:], false}
		}
	}
	return flagged{}
}

// Whether a commit's flags step past the hook. [[spec/design_output/private#the-escape]]
func steps(args []string) bool {
	for _, arg := range args {
		if arg == "--no-verify" {
			return true
		}
		if !letters.MatchString(arg) {
			continue
		}
		for _, letter := range arg[1:] {
			if letter == 'n' {
				return true
			}
			if strings.ContainsRune(valued, letter) {
				break
			}
		}
	}
	return false
}

// The part of a path holding more words than the cap, which src/modules/check/names.go also reads. [[spec/design_output/level0#a-name-meets-the-cap]]
func overLong(path string, most int) string {
	if most == 0 {
		return ""
	}
	for _, part := range slashes.Split(path, -1) {
		if part != "" && nameWords(part) > most {
			return part
		}
	}
	return ""
}

// The words a name holds, its last suffix off. [[spec/design_output/level0#a-name-meets-the-cap]]
func nameWords(name string) int {
	if at := strings.LastIndex(name, "."); at >= 0 {
		name = name[:at]
	}
	return len(strings.FieldsFunc(name, func(r rune) bool { return r == '-' || r == '_' || r == '.' }))
}

// A finding, its message lines joined and its spaces flattened. [[spec/design_output/bash#what-every-refusal-owes]]
func row(rule, said string, message ...string) Row {
	return Row{Rule: rule, Said: said, Message: flat(strings.Join(message, " "))}
}

// [[spec/design_output/bash#what-every-refusal-owes]]
func flat(text string) string { return strings.Join(strings.Fields(text), " ") }

// [[spec/tickets/cage-command-rules-port]]
func first(words []string) string {
	if len(words) == 0 {
		return ""
	}
	return words[0]
}
