// The pull. One verb hands a hand the next leaf of a ticket, and the same verb
// takes the leaf back with a verdict. The engine checks the hand-back, writes
// the record, moves the step, commits, pushes, and hands out the next leaf,
// off src/scripts/pull.js, pulling in work.js and pull-tool.js.
// [[spec/design_output/pull#the-answers]]
package pull

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"

	"quackitect/src/yaml"
)

// The flags that take a value, so the value reads as no name, and the short hash a refusal names. [[spec/design_output/pull#a-hand-of-its-own]]
var takes = []string{"--as", "--fail", "--became", "--answered", "--back", "--fields"}

const (
	shortSha = 8
	toolFlag = "--tool"
)

var verdictAt = regexp.MustCompile(`^--(pass|fail|became|answered|back)(=)?(.*)$`)

// What the verdict flag says: the word, its reason, or why it reads as none. [[spec/design_output/pull#the-hand-out]]
type verdict struct{ said, reason, why string }

// The first word standing outside a flag and outside a flag's value. [[spec/design_output/pull#a-hand-of-its-own]]
func positionalOf(rest []string) string {
	for i := 0; i < len(rest); i++ {
		if strings.HasPrefix(rest[i], "--") {
			if contains(takes, rest[i]) {
				i++
			}
			continue
		}
		return rest[i]
	}
	return ""
}

// The value a flag carries, after it or after its equals sign. [[spec/design_output/pull#a-hand-of-its-own]]
func flagValue(rest []string, flag string) string {
	for i, one := range rest {
		if one == flag {
			if i+1 < len(rest) {
				return strings.TrimSpace(rest[i+1])
			}
			return ""
		}
	}
	for _, one := range rest {
		if strings.HasPrefix(one, flag+"=") {
			return strings.TrimSpace(one[len(flag)+1:])
		}
	}
	return ""
}

// [[spec/design_output/pull#the-hand-out]]
func verdictFlag(rest []string) verdict {
	at := -1
	for i, one := range rest {
		if found := verdictAt.FindStringSubmatch(one); found != nil && (found[2] != "" || found[3] == "") {
			at = i
			break
		}
	}
	if at < 0 {
		return verdict{}
	}
	found := verdictAt.FindStringSubmatch(rest[at])
	word := found[1]
	after := found[3]
	if found[2] == "" {
		after = ""
		if at+1 < len(rest) {
			after = rest[at+1]
		}
	}
	if word == "pass" {
		return verdict{said: "pass"}
	}
	if after == "" || strings.HasPrefix(after, "--") {
		needs := map[string]string{"fail": "a reason", "became": "the successor", "answered": "the ticket answering the ask", "back": "the leaf"}[word]
		return verdict{why: fmt.Sprintf("--%s takes %s: --%s \"...\"", word, needs, word)}
	}
	return verdict{said: word, reason: after}
}

// The pull tool's input, read into the argv a person types. [[spec/design_output/pull#the-hand-out]]
func PullArgvOf(argv []string) []string {
	at := -1
	for i, one := range argv {
		if one == toolFlag {
			at = i
			break
		}
	}
	if at < 0 {
		return argv
	}
	raw := "{}"
	if at+1 < len(argv) {
		raw = argv[at+1]
	}
	var said map[string]any
	_ = json.Unmarshal([]byte(raw), &said)
	out := []string{"pull"}
	text := func(key string) string {
		value, _ := said[key].(string)
		return strings.TrimSpace(value)
	}
	if ticket := text("ticket"); ticket != "" {
		out = append(out, ticket)
	}
	word := text("verdict")
	if swap, ok := map[string]string{"accept": "pass", "reject": "fail"}[word]; ok {
		word = swap
	}
	switch word {
	case "pass":
		out = append(out, "--pass")
	case "fail", "became", "answered":
		out = append(out, "--"+word, text("reason"))
	}
	if fields, ok := said["fields"].(map[string]any); ok && fields != nil {
		var ordered struct {
			Fields json.RawMessage `json:"fields"`
		}
		_ = json.Unmarshal([]byte(raw), &ordered)
		out = append(out, "--fields", compactJSON(ordered.Fields))
	}
	return out
}

// The pull tool's answer: the text the lead reads, and the prompt of the hand it spawns apart. [[spec/tickets/level0-hooks-forward-to-go]]
type ToolAnswer struct {
	Result string `json:"result"`
	Spawn  string `json:"spawn,omitempty"`
}

// The tool's answer off the pull's text. [[spec/tickets/level0-hooks-forward-to-go]]
func ToolAnswerOf(_ string) ToolAnswer {
	return ToolAnswer{}
}

// The spec the pull tool registers. [[spec/tickets/level0-hooks-forward-to-go]]
func PullSpec() map[string]any {
	return nil
}

// JSON as JSON.stringify writes it: no space between the parts. [[spec/design_output/pull#the-hand-out]]
func compactJSON(raw json.RawMessage) string {
	var out strings.Builder
	in := false
	escaped := false
	for _, r := range string(raw) {
		switch {
		case escaped:
			escaped = false
		case r == '\\' && in:
			escaped = true
		case r == '"':
			in = !in
		case !in && (r == ' ' || r == '\n' || r == '\t' || r == '\r'):
			continue
		}
		out.WriteRune(r)
	}
	return out.String()
}

// The pull a ticket verb answers: the next leaf of the group, or a hand back, and a log row saying what it answered. [[spec/design_output/pull#the-hand-out]]
func (it *It) Pulling(argv []string) int {
	code := it.Pull(PullArgvOf(argv))
	if it.Log != nil {
		level := "warn"
		if code == 0 {
			level = "debug"
		}
		it.Log(level, "work", fmt.Sprintf("pull answered %d", code), map[string]any{"branch": it.branch()})
	}
	return code
}

// The branch HEAD stands on, and nothing before the first commit. [[spec/design_output/pull#the-answers]]
func (it *It) branch() string {
	head, _ := it.Git.Head()
	return head
}

// The words past the verb: pull, a name, the flags. [[spec/design_output/pull#the-answers]]
func (it *It) Pull(argv []string) int {
	rest := []string{}
	if len(argv) > 0 {
		rest = argv[1:]
	}
	name := positionalOf(rest)
	as := flagValue(rest, "--as")
	said := verdictFlag(rest)
	if said.why != "" {
		it.Errorln(said.why)
		return 2
	}
	branch := it.branch()
	onTrunk := branch == Trunk
	// A desk works on trunk alone, so its pull on a work branch reads nothing further. [[spec/design_output/work#a-desk-works-on-trunk]]
	if !it.Cloud && strings.HasPrefix(branch, WorkBranch) {
		return it.deskRefused("the pull hands nothing out on "+branch, "")
	}
	if !onTrunk && !strings.HasPrefix(branch, WorkBranch) {
		it.Errorln(fmt.Sprintf("ticket pull runs on %s or a work branch, and this is %s.", Trunk, branch))
		it.Errorln(fmt.Sprintf("Call %s from %s, which hands out work there.", CallOf("ticket", "pull"), Trunk))
		return 2
	}
	group := ""
	if !onTrunk {
		group = strings.TrimPrefix(branch, WorkBranch)
	}
	// The owner sends a hand into a person's step, and the record names both. [[spec/design_output/pull#the-hand-rule]]
	it.OwnerSays = contains(rest, "--owner-says")
	took := it.HandOf()
	if as != "" {
		took += " · " + as
	}
	hand := took
	if it.OwnerSays {
		hand = took + " · " + Says
	}
	it.dropsClosedHolds()
	held := it.HoldOf(hand)
	who := &Who{Hand: hand, PlainHand: took, Branch: branch, Group: group, Held: held, OneStep: as != ""}
	it.Argv = rest
	if contains(rest, "--drop") {
		return it.dropped(who)
	}
	// An ephemeral ticket stands in the hold alone, so its hand-back reads no file. [[spec/design_input/the-clear-hands-ephemeral-tickets#an-ephemeral-ticket-stands-held]]
	if held != nil && held.Ephemeral {
		return it.ephemeralPull(who, said.said)
	}
	if said.said == "back" {
		return it.takeBack(who, name, said.reason)
	}
	// A working todo holds the hand as a ticket does, so the pull answers it ahead of every road that hands work out. [[spec/tickets/the-todo-road-stands-first]]
	working := it.workingTodo()
	todo := working
	if held != nil || said.said != "" {
		todo = ""
	}
	wanted := name
	if wanted == "" && as != "" && held == nil && said.said == "" {
		wanted = working
	}
	if todo != "" && todo != name && as == "" {
		it.Say(Wait, fmt.Sprintf("the todo %s stands in hand, so the pull hands nothing else out.", todo), "Finish it, and take it off the plan, then pull again.")
		return 0
	}
	// A name on trunk that is a group takes its branch on a cloud box, and a desk refuses it. [[spec/design_output/pull#the-engine-takes-the-branch]]
	named := ""
	if onTrunk && name != "" && said.said == "" {
		named = it.namedGroup(name)
	}
	asking := wanted != "" && named == "" && said.said == "" && held == nil
	helps := as != "" && wanted == working
	if asking && it.Binding == bindQueue && wanted != it.Minted && !helps && !it.byPerson(took) {
		it.Errorln(wanted + " stands behind the queue, because this session binds to it.")
		it.Errorln(fmt.Sprintf("Call %s with no name, and take what it hands you.", CallOf("ticket", "pull")))
		return 2
	}
	if asking {
		who.Wanted = wanted
	}
	if named == "" && (said.said != "" || (name != "" && held != nil)) {
		return it.handBack(who, name, said)
	}
	if held != nil {
		return it.stillHeld(*held)
	}
	// The plain pull hands out at the queue alone, and a group a person names passes it. [[spec/design_output/config#the-engine-controls]]
	if !asking && named == "" && !HandsOut(it.Binding) {
		it.Say(Wait, fmt.Sprintf("this session binds to %s, so the pull hands nothing out.", it.Binding), "Name a ticket to take one, or set engine.binding to "+bindQueue+".")
		return 0
	}
	// A hand asking for one ticket takes no branch, because the queue answers neither. [[spec/design_output/pull#the-engine-takes-the-branch]]
	if onTrunk && it.Take != nil && !asking {
		if took := it.branchTaken(named); took >= 0 {
			return took
		}
	}
	if !it.fetched(branch) {
		return 1
	}
	if group != "" && GroupClosed(it.Disk, group) {
		it.Say(Done, fmt.Sprintf("%s stands closed, so work/%s takes no more work.", group, group),
			fmt.Sprintf("Call %s, then %s from %s.", CallOf("branch", "done"), CallOf("ticket", "pull"), Trunk))
		return 0
	}
	return it.handOut(who)
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
func (it *It) dropped(who *Who) int {
	if who.Held == nil {
		it.Say(Wait, "nothing stands in your hand, so nothing drops.")
		return 0
	}
	it.dropHold(who.Hand)
	it.Say(Work, fmt.Sprintf("the hold drops, and %s stays at %s for the next pull.", who.Held.Ticket, who.Held.Step))
	return 0
}

// [[spec/design_output/pull#the-pull-fetches-first]]
func (it *It) fetched(branch string) bool {
	_ = it.Git.Fetch(branch)
	behind, ok := it.Git.Count("HEAD", "origin/"+branch)
	if !ok || behind == 0 {
		return true
	}
	if it.Git.FastForward("origin/"+branch) == nil {
		return true
	}
	it.Say(Refused, fmt.Sprintf("origin/%s holds %d commit(s) this box lacks, and the two diverge.", branch, behind),
		fmt.Sprintf("Run git pull --rebase origin %s, then pull again.", branch))
	return false
}

// A second hand-out at one step hands the notes again on a refusal, a compaction or a moved hash alone. [[spec/design_output/pull#the-hand-and-the-hold]]
func (it *It) stillHeld(held Hold) int {
	// A hand-out past the cap prints its next part, and the step stays whole. [[spec/design_input/level-two#the-size-cap]]
	if held.Rest != "" {
		return it.printPart(held, held.Rest)
	}
	now := it.readsOf(it.stepReads(held))
	why := handsAgain(held, now)
	if why != "" {
		held.Reads = now
		it.writeHold(held.Hand, held)
	}
	as := []string{}
	if named := it.asOf(held); named != "" {
		as = []string{"--as", named}
	}
	again := "  Read them whole with " + CallOf("branch", "guidance", as...) + "."
	rows := []string{
		fmt.Sprintf("%s stands in your hand at %s, and one hand holds one ticket.", held.Ticket, held.Step),
		fmt.Sprintf("Hand it back: %s, or --fail \"why\" in place of --pass.", CallOf("ticket", "pull", append(append([]string{held.Ticket}, as...), "--pass")...)),
	}
	if why != "" {
		names := []string{}
		for _, one := range now {
			names = append(names, one.Name)
		}
		rows = append(rows, it.notesSaid(names)...)
	} else {
		rows = append(rows, "", "Read them again with "+CallOf("branch", "guidance", as...)+".")
	}
	lines := []string{Refused}
	for _, row := range rows {
		lines = append(lines, "  "+row)
	}
	it.Errorln(it.cutRefusal(strings.Join(lines, "\n"), again))
	return 1
}

// The step's notes, off the guidance topic, or the ones the hold names where its ticket stands nowhere. [[spec/tickets/readers-take-the-go-topics]]
func (it *It) stepReads(held Hold) []string {
	text, ok := it.Disk.Read(held.Path)
	if held.Path == "" || !ok {
		out := []string{}
		for _, one := range held.Reads {
			out = append(out, one.Name)
		}
		return out
	}
	leaf := LeafOf(FrontOf(text), held.Step)
	if leaf == nil {
		leaf = &Leaf{Entry: Entry{Path: held.Step}}
	}
	return it.notesOf(text, leaf)
}

// A hand takes back a leaf it handed back, so the step stands there again. [[spec/design_output/pull#what-a-hand-out-reads]]
func (it *It) takeBack(who *Who, name, path string) int {
	if who.Held != nil {
		it.Say(Refused, fmt.Sprintf("%s stands in your hand at %s. Hand it back first.", who.Held.Ticket, who.Held.Step))
		return 1
	}
	if name == "" {
		it.Say(Refused, "--back names the ticket and the leaf: ticket pull <ticket> --back <leaf>")
		return 1
	}
	if !it.fetched(who.Branch) {
		return 1
	}
	var one *Held
	for _, each := range it.ticketsHere() {
		if each.Name == name {
			one = each
			break
		}
	}
	if one == nil {
		it.Say(Refused, fmt.Sprintf("%s stands nowhere under %s or %s.", name, Tickets, Notes))
		return 1
	}
	if LeafOf(one.Front, path) == nil {
		it.Say(Refused, fmt.Sprintf("%s names no leaf of %s.", path, name))
		return 1
	}
	var wrote *yaml.Doc
	for _, entry := range entriesOf(one.Front) {
		if yaml.AsString(entry.Get("step")) == path && !truthy(yaml.AsString(entry.Get("skipped"))) {
			wrote = entry
		}
	}
	role := RoleOf(who.Hand)
	if wrote == nil || yaml.AsString(wrote.Get("hand")) != role {
		it.Say(Refused, fmt.Sprintf("%s carries no hand-back by %s, so it is another hand's or nobody's.", path, role))
		return 1
	}
	tip := ""
	if !one.Private {
		tip = it.tipOf()
	}
	text := withEntry(one.Text, pair("step", path), pair("hand", role), pair("hash_before", tip), pair("hash_after", tip),
		pair("returns", returnsOf(one.Front, path)+1), pair("why", "the hand takes it back"))
	one.Text = withField(withField(text, "step", path), "state", Open)
	it.landed(one, []string{role + " takes " + path + " back"}, nil)
	if !one.Private {
		if ok, why := it.pushed(who.Branch); !ok {
			it.Say(Refused, append([]string{"The take-back stands on this box, and its push reaches no origin."}, why...)...)
			return 1
		}
	}
	it.Say(Work, fmt.Sprintf("%s stands at %s again, and the next pull hands it out.", name, path))
	return it.handOut(who)
}
