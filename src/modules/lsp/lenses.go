// The buttons over a ticket: which ones stand, the press behind each, and the
// fill a save runs. The rules read a ticket's text and the holds alone, and
// the ports the wiring fills reach the store, the actions and the disk.
// [[spec/tickets/lsp-draws-the-ticket-lenses]]
package lsp

import (
	"encoding/json"
	"fmt"
	"regexp"
	"slices"
	"strings"
)

// The command each lens runs, which the client's middleware reads too. [[spec/tickets/lsp-draws-the-ticket-lenses]]
const TicketCommand = "quackitect.ticket"

// The levels window/showMessage draws at. [[spec/tickets/lsp-draws-the-ticket-lenses]]
const (
	messageWarning = 2
	messageInfo    = 3
)

// The words a press carries: the act, the ticket, the path, and the reason a fail gives. [[spec/tickets/lsp-draws-the-ticket-lenses]]
const pressArgs = 4

// One standing hold, field for field as the holds module answers holds/standing. [[spec/tickets/lsp-draws-the-ticket-lenses]]
type Hold struct {
	Ticket string `json:"ticket"`
	Path   string `json:"path"`
	Step   string `json:"step"`
	Hand   string `json:"hand"`
	Person bool   `json:"person"`
}

// A verb's action answered as a run. [[spec/tickets/lsp-draws-the-ticket-lenses]]
type Ran struct {
	Code int    `json:"code"`
	Out  string `json:"out"`
	Err  string `json:"err"`
}

// What the server reaches for the lenses: the holds, the tickets the cloud holds, a verb's action as a person posts it, a file's write, and the names whose commit moves a lens. [[spec/tickets/lsp-draws-the-ticket-lenses]]
type Tickets struct {
	Holds func() []Hold
	Cloud func() []string
	Act   func(name string, input any) Ran
	Save  func(path, text string) error
	// The drawing of a ticket's path, whose fields the marks read. [[spec/tickets/lsp-marks-the-held-fields]]
	Drawn func(path string) Drawing
	Names []string
}

// One button: its title, and the act, the ticket and the path a press runs, or none where the button only says. [[spec/tickets/lsp-draws-the-ticket-lenses]]
type lens struct {
	Title     string `json:"title"`
	Command   string `json:"command"`
	Arguments []any  `json:"arguments"`
}

// One step as the frontmatter nests it, with its by and whether a verdict field stands. [[spec/design_output/pull#the-answers]]
type step struct {
	path, by      string
	verdict, leaf bool
	above         *step
}

// What a run answers: the word the pull says, the line under it, and every line. [[spec/design_output/pull#the-answers]]
type answer struct {
	Word   string   `json:"word"`
	Detail string   `json:"detail"`
	Lines  []string `json:"lines"`
}

// The folders a ticket stands directly under, as ticketsAt in src/modules/tickets names them. [[spec/design_output/index#the-index-answers-the-tickets]]
var ticketFolders = []string{"spec/tickets/", ".se/tickets/"}

// The words the pull answers with, the hand a person's hold names, the hands that take a step here, and the acts that hand a step back. [[spec/design_output/pull#the-answers]]
var (
	answerWords = []string{"work", "refused", "wait", "spawn", "done"}
	personHand  = "person"
	takers      = map[string]bool{"": true, "anyone": true, "person": true}
	handsBack   = map[string]bool{"pass": true, "fail": true, "back": true}
)

// The marker a ticket the cloud holds carries, and the methods the buttons speak. [[spec/tickets/marked-groups-stay-cloud]]
const (
	cloudMark      = "cloud"
	codeLens       = "textDocument/codeLens"
	executeCommand = "workspace/executeCommand"
	didSave        = "textDocument/didSave"
	logMessage     = "window/logMessage"
	showMessage    = "window/showMessage"
	lensRefresh    = "workspace/codeLens/refresh"
	pullAction     = "ticket/pull"
	fillAction     = "ticket/fill"
	runme          = "./RUNME.sh"
)

// The id of a ticket at a path, its file name, where it stands directly under a ticket folder. [[spec/design_output/extension#a-ticket-carries-its-buttons]]
func ticketOf(path string) string {
	said := strings.ReplaceAll(path, "\\", "/")
	for _, folder := range ticketFolders {
		at := strings.Index(said, folder)
		if at < 0 || (at > 0 && said[at-1] != '/') {
			continue
		}
		name, ok := strings.CutSuffix(said[at+len(folder):], ".md")
		if ok && name != "" && !strings.Contains(name, "/") {
			return name
		}
	}
	return ""
}

func frontLines(text string) []string {
	lines := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
	if strings.TrimSpace(lines[0]) != "---" {
		return nil
	}
	for at := 1; at < len(lines); at++ {
		if lines[at] == "---" {
			return lines[1:at]
		}
	}
	return nil
}

func fieldOf(text, key string) string {
	for _, line := range frontLines(text) {
		if value, ok := strings.CutPrefix(line, key+":"); ok {
			return bare(value)
		}
	}
	return ""
}

func bare(said string) string {
	said = strings.TrimSpace(said)
	said = strings.TrimPrefix(strings.TrimPrefix(said, `"`), "'")
	return strings.TrimSuffix(strings.TrimSuffix(said, `"`), "'")
}

var keyLine = regexp.MustCompile(`^(\s*)(- )?([A-Za-z_][\w-]*):\s*(.*)$`)

// An item of the frontmatter: a step, an evidence field under one, or another. [[spec/tickets/a-count-meets-the-lint]]
type item struct {
	at       int
	kind     string
	step     *step
	evidence bool
}

type opener struct {
	at    int
	key   string
	owner *item
}

// Every step the route nests, in order, as the pull reads them. [[spec/design_output/pull#the-answers]]
func stepsIn(text string) []*step {
	var steps []*step
	var openers []opener
	var items []*item
	for _, line := range frontLines(text) {
		found := keyLine.FindStringSubmatch(line)
		if found == nil {
			continue
		}
		at, dash, key, value := len(found[1]), found[2] != "", found[3], found[4]
		if dash {
			openers = keptOpeners(openers, func(one opener) bool { return one.at <= at })
			items = keptItems(items, func(one *item) bool { return one.at < at })
			var above *opener
			if len(openers) > 0 {
				above = &openers[len(openers)-1]
			}
			one := itemUnder(above, at, &steps)
			items = append(items, one)
			keyOn(one, key, value)
			continue
		}
		openers = keptOpeners(openers, func(one opener) bool { return one.at < at })
		items = keptItems(items, func(one *item) bool { return one.at+2 <= at })
		var owner *item
		if len(items) > 0 {
			owner = items[len(items)-1]
		}
		if value == "" {
			openers = append(openers, opener{at: at, key: key, owner: owner})
		} else {
			keyOn(owner, key, value)
		}
	}
	return steps
}

func keptOpeners(all []opener, keep func(opener) bool) []opener {
	out := all[:0:0]
	for _, one := range all {
		if keep(one) {
			out = append(out, one)
		}
	}
	return out
}

func keptItems(all []*item, keep func(*item) bool) []*item {
	out := all[:0:0]
	for _, one := range all {
		if keep(one) {
			out = append(out, one)
		}
	}
	return out
}

// An item under a route's steps is a step whatever key opens it, and its name arrives on any of its lines. [[spec/tickets/a-count-meets-the-lint]]
func itemUnder(above *opener, at int, steps *[]*step) *item {
	if above != nil && above.key == "evidence" && above.owner != nil && above.owner.kind == "step" {
		return &item{at: at, kind: "evidence", step: above.owner.step}
	}
	if above == nil || above.key != "steps" {
		return &item{at: at, kind: "other"}
	}
	var parent *step
	if above.owner != nil && above.owner.kind == "step" {
		parent = above.owner.step
		parent.leaf = false
	}
	one := &step{leaf: true, above: parent}
	*steps = append(*steps, one)
	return &item{at: at, kind: "step", step: one}
}

func keyOn(one *item, key, value string) {
	if one == nil {
		return
	}
	switch {
	case one.kind == "step" && key == "name":
		one.step.path = bare(value)
		if one.step.above != nil {
			one.step.path = one.step.above.path + "/" + bare(value)
		}
	case one.kind == "step" && key == "by":
		one.step.by = bare(value)
	case one.kind == "evidence" && key == "form" && bare(value) == "verdict":
		one.step.verdict = true
	}
}

// The nearest by up the chain, the way the pull reads it. [[spec/design_output/pull#the-hand-rule]]
func byOf(one *step) string {
	for ; one != nil; one = one.above {
		if one.by != "" {
			return one.by
		}
	}
	return "anyone"
}

func leafAt(text, path string) *step {
	wanted := path
	if wanted == "" {
		wanted = fieldOf(text, "step")
	}
	for _, one := range stepsIn(text) {
		if one.leaf && (wanted == "" || one.path == wanted) {
			return one
		}
	}
	return nil
}

// A hold whose hand reads person is this desk's own. [[spec/design_output/pull#the-hand-and-the-hold]]
func personHolds(hold Hold) bool {
	hand := strings.TrimSpace(hold.Hand)
	return hand == personHand || strings.HasPrefix(hand, personHand+" ")
}

func lensOf(title, act, ticket, path string) lens {
	if act == "" {
		return lens{Title: title, Arguments: []any{}}
	}
	return lens{Title: title, Command: TicketCommand, Arguments: []any{act, ticket, path}}
}

// The buttons a ticket carries, off its text, the standing holds, and whether the cloud holds it. [[spec/design_output/extension#a-ticket-carries-its-buttons]]
func lensesOf(path, text string, holds []Hold, cloud bool) []lens {
	ticket := ticketOf(path)
	// A ticket the cloud holds, by its own marker or its group's, takes no hand here, and a ticket past open draws no button. [[spec/tickets/the-lens-reads-v1]]
	if ticket == "" || cloud || fieldOf(text, cloudMark) == "true" || fieldOf(text, "state") != "open" {
		return []lens{}
	}
	var naming []Hold
	for _, one := range holds {
		if one.Ticket == ticket {
			if personHolds(one) {
				return handBackOf(ticket, path, text, one)
			}
			naming = append(naming, one)
		}
	}
	if len(naming) > 0 {
		return []lens{lensOf("held by "+naming[0].Hand+" at "+naming[0].Step, "", ticket, path)}
	}
	leaf := leafAt(text, "")
	at, by := fieldOf(text, "step"), "anyone"
	if leaf != nil {
		at, by = leaf.path, byOf(leaf)
	}
	if !takers[by] {
		return []lens{lensOf(at+" stands for "+by, "", ticket, path)}
	}
	return []lens{lensOf("Take this ticket at "+at, "take", ticket, path)}
}

func handBackOf(ticket, path, text string, hold Hold) []lens {
	drop := lensOf("Drop", "drop", ticket, path)
	if leaf := leafAt(text, hold.Step); leaf != nil && leaf.verdict {
		return []lens{lensOf("Hand back "+hold.Step+": the verdict decides", "back", ticket, path), drop}
	}
	return []lens{
		lensOf("Hand back "+hold.Step+": pass", "pass", ticket, path),
		lensOf("Hand back: fail…", "fail", ticket, path),
		drop,
	}
}

// The words past ticket pull an act posts. [[spec/design_output/pull#the-answers]]
func argvOf(act, ticket, reason string) []string {
	switch act {
	case "take", "back":
		return []string{ticket}
	case "pass":
		return []string{ticket, "--pass"}
	case "fail":
		return []string{ticket, "--fail", reason}
	case "drop":
		return []string{"--drop"}
	}
	return nil
}

// A save over a ticket naming a process and carrying no route runs the fill, which writes what the mint writes. [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
func fillsOver(path, text string) bool {
	return ticketOf(path) != "" && fieldOf(text, "process") != "" && len(stepsIn(text)) == 0
}

func linesOf(ran Ran) []string {
	out := []string{}
	for _, one := range strings.Split(ran.Out+"\n"+ran.Err, "\n") {
		if one = strings.TrimSpace(one); one != "" {
			out = append(out, one)
		}
	}
	return out
}

// The word a run answers, off either stream, and the line under it. [[spec/design_output/pull#the-answers]]
func answerOf(ran Ran) answer {
	lines := linesOf(ran)
	for at, one := range lines {
		if slices.Contains(answerWords, one) {
			detail := ""
			if at+1 < len(lines) {
				detail = lines[at+1]
			}
			return answer{Word: one, Detail: detail, Lines: lines}
		}
	}
	word, detail := "work", ""
	if ran.Code != 0 {
		word = "refused"
	}
	if len(lines) > 0 {
		detail = lines[0]
	}
	return answer{Word: word, Detail: detail, Lines: lines}
}

// The text an editor holds for a path, else the file's. The caller holds the lock. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func (s *Server) textOf(at string) string {
	if text, ok := s.open[at]; ok {
		return text
	}
	if s.from.Files != nil {
		return s.from.Files()[at]
	}
	return ""
}

// The lenses over the document a request names, at its first line. The caller holds the lock. [[spec/design_output/extension#a-ticket-carries-its-buttons]]
func (s *Server) lenses(params json.RawMessage) any {
	var said struct {
		TextDocument document `json:"textDocument"`
	}
	out := []any{}
	at, ok := "", false
	if json.Unmarshal(params, &said) == nil {
		at, ok = s.pathOf(said.TextDocument.URI)
	}
	if !ok || ticketOf(at) == "" {
		return out
	}
	var holds []Hold
	cloud := false
	if ports := s.from.Tickets; ports.Holds != nil {
		holds = ports.Holds()
	}
	if ports := s.from.Tickets; ports.Cloud != nil {
		cloud = slices.Contains(ports.Cloud(), ticketOf(at))
	}
	top := map[string]any{"start": position{}, "end": position{}}
	for _, one := range lensesOf(at, s.textOf(at), holds, cloud) {
		out = append(out, map[string]any{"range": top, "command": one})
	}
	return out
}

func notice(method string, kind int, message string) []byte {
	params := map[string]any{"type": kind, "message": message}
	return marshal(map[string]any{"jsonrpc": rpcVersion, "method": method, "params": params})
}

// The log line of a run: the command line, a blank, and what it said. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func logged(words []string, lines []string) []byte {
	return notice(logMessage, messageInfo, strings.Join(append([]string{strings.Join(append([]string{runme}, words...), " "), ""}, lines...), "\n"))
}

// Runs an action as a person, with the lock let go, since the call's commit republishes under it. The caller holds the lock. [[spec/tickets/reaches-keeps-the-post-fault]]
func (s *Server) acts(name string, words []string) Ran {
	if s.from.Tickets.Act == nil {
		return Ran{Code: 1, Err: "no index answers this server's presses"}
	}
	s.mu.Unlock()
	defer s.mu.Lock()
	return s.from.Tickets.Act(name, map[string]any{"args": words, "person": true})
}

// The press behind a button: a hand-back writes the buffer first, the pull runs as a person, and the answer goes to the log, the message and the reply. The caller holds the lock. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func (s *Server) presses(id, params json.RawMessage) [][]byte {
	var said struct {
		Command   string `json:"command"`
		Arguments []any  `json:"arguments"`
	}
	if json.Unmarshal(params, &said) != nil || said.Command != TicketCommand {
		return [][]byte{marshal(map[string]any{"jsonrpc": rpcVersion, "id": id, "error": map[string]any{"code": noMethod, "message": said.Command + " names no command this server runs"}})}
	}
	args := make([]string, pressArgs)
	for at := range min(len(said.Arguments), pressArgs) {
		args[at], _ = said.Arguments[at].(string)
	}
	act, ticket, path, reason := args[0], args[1], args[2], args[3]
	if act == "fail" && strings.TrimSpace(reason) == "" {
		line := fmt.Sprintf("%s ticket pull %s --fail \"<why>\"", runme, ticket)
		return [][]byte{notice(showMessage, messageWarning, ticket+" fails back with a reason. Run "+line), answers(id, nil)}
	}
	words := argvOf(act, ticket, reason)
	if words == nil {
		return [][]byte{answers(id, nil)}
	}
	if text, open := s.open[path]; open && handsBack[act] && s.from.Tickets.Save != nil {
		s.from.Tickets.Save(path, text)
	}
	words = append([]string{"ticket", "pull"}, words...)
	got := answerOf(s.acts(pullAction, words[2:]))
	kind := messageInfo
	if got.Word == "refused" {
		kind = messageWarning
	}
	shown := ticket + ": " + got.Word
	if got.Detail != "" {
		shown += ". " + got.Detail
	}
	return [][]byte{logged(words, got.Lines), notice(showMessage, kind, shown), s.Refresh(), answers(id, got)}
}

// The fill a save runs over a ticket naming a process and carrying no route. The caller holds the lock. [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
func (s *Server) fills(params json.RawMessage) [][]byte {
	var said struct {
		TextDocument document `json:"textDocument"`
		Text         *string  `json:"text"`
	}
	if json.Unmarshal(params, &said) != nil {
		return nil
	}
	at, ok := s.pathOf(said.TextDocument.URI)
	if !ok {
		return nil
	}
	text := s.textOf(at)
	if said.Text != nil {
		text = *said.Text
	}
	if !fillsOver(at, text) {
		return nil
	}
	ran := s.acts(fillAction, []string{at})
	lines := linesOf(ran)
	out := [][]byte{logged([]string{"ticket", "fill", at}, lines)}
	if ran.Code != 0 {
		first := ""
		if len(lines) > 0 {
			first = ". " + lines[0]
		}
		out = append(out, notice(showMessage, messageWarning, ticketOf(at)+": the fill refused"+first))
	}
	return append(out, s.Refresh())
}

// Whether a commit's values name one the lenses read. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func (s *Server) MovesLenses(values map[string]any) bool {
	for _, name := range s.from.Tickets.Names {
		if _, ok := values[name]; ok {
			return true
		}
	}
	return false
}

// The request that asks the client for the lenses again, under an id of its own. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func (s *Server) Refresh() []byte {
	id := fmt.Sprintf("refresh-%d", s.asked.Add(1))
	return marshal(map[string]any{"jsonrpc": rpcVersion, "id": id, "method": lensRefresh})
}
