// The retro's tickets: one a class the check step leaves open, and one a
// promotion, minted off the route its ticket names, its ask written and the
// draft opened.
// [[spec/guidance/retro/check]]
package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"maps"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
)

// The folder tickets stand in, the record of a retro's classes, the processes a ticket mints onto, the tree's own command line, and the status a class stands open at. [[spec/guidance/retro/check]]
const (
	retroMintTickets   = "spec/tickets"
	retroMintRecordAt  = "classes.json"
	retroMintProcesses = "spec/processes"
	retroMintRunmeAt   = "./RUNME.sh"
	retroMintOpen      = "open"
)

// A class the check step closes opens on one of these, and where or why follows. [[spec/guidance/retro/check]]
var retroMintClosed = []string{"fixed:", "past:"}

// What a child program answers: its output, its errors and its exit code. [[spec/design_output/vehicle#the-work-root-inherits]]
type retroMintRan struct {
	out, errs string
	code      int
}

// Runs a program in a folder with the env added, where ./RUNME.sh names the tree's own command line. [[spec/design_output/vehicle#the-work-root-inherits]]
type retroMintRun func(dir string, argv []string, env map[string]string) retroMintRan

// The ticket a class or a promotion carries to the mint. [[spec/guidance/retro/check]]
type retroMintTicket struct {
	Name     string   `json:"name"`
	Process  string   `json:"process"`
	Gain     string   `json:"gain"`
	Breaks   string   `json:"breaks"`
	DoneWhen []string `json:"done_when"`
}

// A class of the record, as the mint reads it. [[spec/guidance/retro/check]]
type retroMintClass struct {
	ID      string           `json:"id"`
	Status  string           `json:"status"`
	Tickets []string         `json:"tickets"`
	Ticket  *retroMintTicket `json:"ticket"`
}

// A promotion of the record, as the mint reads it. [[spec/tickets/a-promotion-names-its-fault]]
type retroMintPromotion struct {
	What    string           `json:"what"`
	Tickets []string         `json:"tickets"`
	Ticket  *retroMintTicket `json:"ticket"`
}

// The classes and promotions of a retro's record. [[spec/guidance/retro/check]]
type retroMintRecord struct {
	Classes    []retroMintClass     `json:"classes"`
	Promotions []retroMintPromotion `json:"promotions"`
}

func init() { register("retro mint", retroMintVerb(retroRoot, retroMintRunme)) }

// Runs a program under the root, with ./RUNME.sh read as the root's own, and the env added over the caller's. [[spec/design_output/vehicle#the-work-root-inherits]]
func retroMintRunme(dir string, argv []string, env map[string]string) retroMintRan {
	program := argv[0]
	if program == retroMintRunmeAt {
		program = filepath.Join(dir, "RUNME.sh")
	}
	cmd := exec.Command(program, argv[1:]...)
	cmd.Dir = dir
	cmd.Env = os.Environ()
	for _, key := range slices.Sorted(maps.Keys(env)) {
		cmd.Env = append(cmd.Env, key+"="+env[key])
	}
	var out, errs bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errs
	err := cmd.Run()
	ran := retroMintRan{out: out.String(), errs: errs.String()}
	var exit *exec.ExitError
	switch {
	case errors.As(err, &exit):
		ran.code = exit.ExitCode()
	case err != nil:
		ran.code, ran.errs = exitFailed, ran.errs+err.Error()
	}
	return ran
}

// The ask a class hands its ticket, as the chapter the mint leaves empty. [[spec/guidance/retro/check]]
func retroMintAskOf(ticket retroMintTicket) string {
	lines := []string{strings.TrimSpace(ticket.Gain), "", strings.TrimSpace(ticket.Breaks), ""}
	for _, one := range ticket.DoneWhen {
		lines = append(lines, "- "+strings.TrimSpace(one))
	}
	return strings.Join(lines, "\n") + "\n"
}

// The ask chapter, written where the mint leaves its placeholders. [[spec/guidance/retro/check]]
func retroMintWithAsk(text, ask string) string {
	rows := strings.Split(text, "\n")
	head := slices.IndexFunc(rows, func(one string) bool { return strings.TrimSpace(one) == "# Ask" })
	if head < 0 {
		return text
	}
	end := head + 1
	for end < len(rows) && !strings.HasPrefix(rows[end], "# ") {
		end++
	}
	out := append(slices.Clone(rows[:head+1]), "", ask)
	return strings.Join(append(out, rows[end:]...), "\n")
}

// A promotion carries no id, so its fault names its what, or its place where the what stands empty. [[spec/tickets/a-promotion-names-its-fault]]
func retroMintPromotionName(one retroMintPromotion, at int) string {
	if what := strings.TrimSpace(one.What); what != "" {
		return `promotion "` + what + `"`
	}
	return fmt.Sprintf("promotion %d", at+1)
}

// Every fault standing between the classes and promotions and their tickets; an empty root checks no process. [[spec/guidance/retro/check]]
func retroMintFaults(record retroMintRecord, root string) []string {
	faults := []string{}
	for _, one := range record.Classes {
		closed := slices.ContainsFunc(retroMintClosed, func(word string) bool {
			return strings.HasPrefix(one.Status, word) && strings.TrimSpace(one.Status[len(word):]) != ""
		})
		if one.Status != retroMintOpen && !closed {
			faults = append(faults, fmt.Sprintf("%s carries no status of open, %s with its reason", one.ID, strings.Join(retroMintClosed, " or ")))
			continue
		}
		if one.Status != retroMintOpen || len(one.Tickets) > 0 {
			continue
		}
		faults = append(faults, retroMintTicketFaults(one.ID+" stands open", one.Ticket, root)...)
	}
	for at, one := range record.Promotions {
		if len(one.Tickets) > 0 {
			continue
		}
		faults = append(faults, retroMintTicketFaults(retroMintPromotionName(one, at)+" waits", one.Ticket, root)...)
	}
	return faults
}

// Every field a ticket to mint carries none of, each named after the thing it serves. [[spec/tickets/a-promotion-names-its-fault]]
func retroMintTicketFaults(said string, ticket *retroMintTicket, root string) []string {
	if ticket == nil {
		ticket = &retroMintTicket{}
	}
	faults := []string{}
	for _, field := range []struct{ name, value string }{{"name", ticket.Name}, {"gain", ticket.Gain}, {"breaks", ticket.Breaks}} {
		if strings.TrimSpace(field.value) == "" {
			faults = append(faults, fmt.Sprintf("%s, and its ticket carries no %s", said, field.name))
		}
	}
	process := strings.TrimSpace(ticket.Process)
	if process == "" {
		faults = append(faults, said+", and its ticket carries no process")
	} else if root != "" {
		if why := retroMintProcessWhy(root, process); why != "" {
			faults = append(faults, fmt.Sprintf("%s, and its ticket names process %s: %s", said, process, why))
		}
	}
	if len(ticket.DoneWhen) == 0 {
		faults = append(faults, said+", and its ticket carries no done_when")
	}
	return faults
}

// Why a process stands nowhere under the root, as processAt in src/scripts/process.js says it, or nothing where it stands. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func retroMintProcessWhy(root, said string) string {
	name := strings.TrimSpace(said)
	name = strings.TrimSuffix(strings.TrimPrefix(name, "[["), "]]")
	name = strings.TrimPrefix(name, retroMintProcesses+"/")
	name = strings.TrimSpace(strings.TrimSuffix(name, ".yaml"))
	standing := []string{}
	if entries, err := os.ReadDir(filepath.Join(root, filepath.FromSlash(retroMintProcesses))); err == nil {
		for _, one := range entries {
			if one.Type().IsRegular() && strings.HasSuffix(one.Name(), ".yaml") {
				standing = append(standing, strings.TrimSuffix(one.Name(), ".yaml"))
			}
		}
	}
	slices.Sort(standing)
	if name == "" {
		return fmt.Sprintf("Name a process. %s holds %s.", retroMintProcesses, strings.Join(standing, ", "))
	}
	if _, err := os.Stat(filepath.Join(root, filepath.FromSlash(retroMintProcesses), name+".yaml")); err != nil {
		return fmt.Sprintf("%s holds no %s. It holds %s.", retroMintProcesses, name, strings.Join(standing, ", "))
	}
	return ""
}

// The verb: mints one ticket a class standing open and a promotion waiting, writes its ask and opens the draft. [[spec/guidance/retro/check]]
func retroMintVerb(root func() string, run retroMintRun) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		at, home := "", root()
		if len(argv) > 2 && argv[2] != "" {
			at = filepath.Join(retroHome(home, argv[2]), retroMintRecordAt)
		}
		text, err := os.ReadFile(at)
		if at == "" || err != nil {
			fmt.Fprintf(errs, "retro mint reads %s of a retro, and none stands.\n", retroMintRecordAt)
			return exitUsage
		}
		read, err := retroMintParse(string(text))
		if err != nil {
			fmt.Fprintf(errs, "%s reads as no JSON\n", retroMintRecordAt)
			return exitFailed
		}
		kept := retroMintKept(read)
		record := retroMintRecordOf(kept)
		if faults := retroMintFaults(record, home); len(faults) > 0 {
			for _, one := range faults {
				fmt.Fprintln(errs, one)
			}
			return exitFailed
		}
		type waits struct {
			node   *retroMintNode
			ticket *retroMintTicket
			label  string
		}
		waiting := []waits{}
		classes := kept.get("classes").items
		for place, one := range record.Classes {
			if classes[place].get("status").isText(retroMintOpen) && len(one.Tickets) == 0 {
				waiting = append(waiting, waits{classes[place], one.Ticket, one.ID})
			}
		}
		promotions := kept.get("promotions").items
		for place, one := range record.Promotions {
			if len(one.Tickets) == 0 {
				waiting = append(waiting, waits{promotions[place], one.Ticket, retroMintPromotionName(one, place)})
			}
		}
		made := 0
		for _, one := range waiting {
			if !retroMintOne(home, run, one.ticket, one.label, out, errs) {
				return exitFailed
			}
			one.node.set("tickets", &retroMintNode{kind: 'a', items: []*retroMintNode{{kind: 's', text: one.ticket.Name}}})
			made++
			if !retroMintWrites(at, kept, errs) {
				return exitFailed
			}
		}
		if !retroMintWrites(at, kept, errs) {
			return exitFailed
		}
		closed := 0
		for _, one := range classes {
			if !one.get("status").isText(retroMintOpen) {
				closed++
			}
		}
		fmt.Fprintf(out, "%d ticket(s) mint, and %d class(es) stand closed already.\n", made, closed)
		return 0
	}
}

// Mints the ticket a class or a promotion carries, writes its ask, opens the draft and names it back. [[spec/tickets/the-retro-finishes-its-asks]]
func retroMintOne(root string, run retroMintRun, ticket *retroMintTicket, label string, out, errs io.Writer) bool {
	path := retroMintTickets + "/" + ticket.Name + ".md"
	env := map[string]string{workRoot: root}
	ran := run(root, []string{retroMintRunmeAt, "mint", "ticket", path, "--process=" + strings.TrimSpace(ticket.Process)}, env)
	if ran.code != 0 {
		fmt.Fprintf(errs, "%s mints no ticket: %s\n", label, strings.TrimSpace(ran.errs))
		return false
	}
	file := filepath.Join(root, filepath.FromSlash(path))
	text, err := os.ReadFile(file)
	if err == nil {
		err = os.WriteFile(file, []byte(retroMintWithAsk(string(text), retroMintAskOf(*ticket))), 0o644)
	}
	if err != nil {
		fmt.Fprintln(errs, err)
		return false
	}
	opened := run(root, []string{retroMintRunmeAt, "ticket", "open", ticket.Name}, env)
	if opened.code != 0 {
		fmt.Fprintf(errs, "%s opens not: %s %s\n", ticket.Name, strings.TrimSpace(opened.out), strings.TrimSpace(opened.errs))
		return false
	}
	fmt.Fprintf(out, "%s  %s\n", label, path)
	return true
}

// Writes the record as JSON.stringify with two spaces writes it, and a closing line. [[spec/guidance/retro/check]]
func retroMintWrites(at string, kept *retroMintNode, errs io.Writer) bool {
	var text strings.Builder
	kept.write(&text, "")
	text.WriteString("\n")
	if err := os.WriteFile(at, []byte(text.String()), 0o644); err != nil {
		fmt.Fprintln(errs, err)
		return false
	}
	return true
}

// The record recordOf in src/engine/retro/classes.js keeps: its five keys in their order, each list a list and the dispositions an object. [[spec/guidance/retro/classify]]
func retroMintKept(read *retroMintNode) *retroMintNode {
	list := func(key string) *retroMintNode {
		if one := read.get(key); one != nil && one.kind == 'a' {
			return one
		}
		return &retroMintNode{kind: 'a'}
	}
	dispositions := read.get("dispositions")
	if dispositions == nil || (dispositions.kind != 'o' && dispositions.kind != 'a') {
		dispositions = &retroMintNode{kind: 'o', vals: map[string]*retroMintNode{}}
	}
	kept := &retroMintNode{kind: 'o', vals: map[string]*retroMintNode{}}
	kept.set("classes", list("classes"))
	kept.set("dispositions", dispositions)
	kept.set("promotions", list("promotions"))
	kept.set("limits", list("limits"))
	kept.set("checklist", list("checklist"))
	return kept
}

// The classes and promotions the mint reads, each field read as String in JavaScript reads it. [[spec/guidance/retro/check]]
func retroMintRecordOf(kept *retroMintNode) retroMintRecord {
	record := retroMintRecord{}
	for _, one := range kept.get("classes").items {
		record.Classes = append(record.Classes, retroMintClass{
			ID:      one.get("id").template(),
			Status:  one.get("status").str(),
			Tickets: one.get("tickets").listed(),
			Ticket:  retroMintTicketOf(one.get("ticket")),
		})
	}
	for _, one := range kept.get("promotions").items {
		record.Promotions = append(record.Promotions, retroMintPromotion{
			What:    one.get("what").str(),
			Tickets: one.get("tickets").listed(),
			Ticket:  retroMintTicketOf(one.get("ticket")),
		})
	}
	return record
}

// The ticket a class or a promotion carries, or none where it holds no object. [[spec/guidance/retro/check]]
func retroMintTicketOf(one *retroMintNode) *retroMintTicket {
	if one == nil || one.kind != 'o' {
		return nil
	}
	return &retroMintTicket{
		Name:     one.get("name").str(),
		Process:  one.get("process").str(),
		Gain:     one.get("gain").str(),
		Breaks:   one.get("breaks").str(),
		DoneWhen: one.get("done_when").listed(),
	}
}

// A JSON value with its keys in the order the text holds them, as JSON.parse keeps them. [[spec/guidance/retro/check]]
type retroMintNode struct {
	kind  byte
	keys  []string
	vals  map[string]*retroMintNode
	items []*retroMintNode
	text  string
}

// Reads one JSON text, and refuses anything past its value. [[spec/guidance/retro/check]]
func retroMintParse(text string) (*retroMintNode, error) {
	dec := json.NewDecoder(strings.NewReader(text))
	dec.UseNumber()
	node, err := retroMintValue(dec)
	if err != nil {
		return nil, err
	}
	if _, err := dec.Token(); !errors.Is(err, io.EOF) {
		return nil, errors.New("the text runs past its value")
	}
	return node, nil
}

// Reads the next JSON value off the decoder. [[spec/guidance/retro/check]]
func retroMintValue(dec *json.Decoder) (*retroMintNode, error) {
	token, err := dec.Token()
	if err != nil {
		return nil, err
	}
	switch held := token.(type) {
	case json.Delim:
		node := &retroMintNode{kind: 'a'}
		if held == '{' {
			node = &retroMintNode{kind: 'o', vals: map[string]*retroMintNode{}}
		}
		for dec.More() {
			key := ""
			if node.kind == 'o' {
				word, err := dec.Token()
				if err != nil {
					return nil, err
				}
				key, _ = word.(string)
			}
			value, err := retroMintValue(dec)
			if err != nil {
				return nil, err
			}
			if node.kind == 'o' {
				node.set(key, value)
			} else {
				node.items = append(node.items, value)
			}
		}
		_, err := dec.Token()
		return node, err
	case string:
		return &retroMintNode{kind: 's', text: held}, nil
	case json.Number:
		return &retroMintNode{kind: 'n', text: held.String()}, nil
	case bool:
		return &retroMintNode{kind: 'b', text: strconv.FormatBool(held)}, nil
	}
	return &retroMintNode{kind: 'z'}, nil
}

// The value under a key of an object, or none. [[spec/guidance/retro/check]]
func (n *retroMintNode) get(key string) *retroMintNode {
	if n == nil || n.kind != 'o' {
		return nil
	}
	return n.vals[key]
}

// Sets a key of an object: a key it holds keeps its place, and a new one goes last. [[spec/guidance/retro/check]]
func (n *retroMintNode) set(key string, value *retroMintNode) {
	if n == nil || n.kind != 'o' {
		return
	}
	if _, held := n.vals[key]; !held {
		n.keys = append(n.keys, key)
	}
	n.vals[key] = value
}

// Whether the value is this very string, as === reads it. [[spec/guidance/retro/check]]
func (n *retroMintNode) isText(word string) bool {
	return n != nil && n.kind == 's' && n.text == word
}

// The value as String(value ?? "") reads it. [[spec/guidance/retro/check]]
func (n *retroMintNode) str() string {
	if n == nil {
		return ""
	}
	switch n.kind {
	case 's', 'b':
		return n.text
	case 'n':
		return retroMintNumber(n.text)
	case 'a':
		parts := make([]string, len(n.items))
		for place, one := range n.items {
			parts[place] = one.str()
		}
		return strings.Join(parts, ",")
	case 'o':
		return "[object Object]"
	}
	return ""
}

// The value as a template literal reads it, where a missing value reads undefined. [[spec/guidance/retro/check]]
func (n *retroMintNode) template() string {
	switch {
	case n == nil:
		return "undefined"
	case n.kind == 'z':
		return "null"
	}
	return n.str()
}

// The items of a list, each as String reads it; a string stands as its characters, as for...of walks it. [[spec/guidance/retro/check]]
func (n *retroMintNode) listed() []string {
	if n == nil {
		return nil
	}
	out := []string{}
	switch n.kind {
	case 'a':
		for _, one := range n.items {
			out = append(out, one.str())
		}
	case 's':
		for _, one := range n.text {
			out = append(out, string(one))
		}
	}
	return out
}

// Writes the value as JSON.stringify with two spaces writes it. [[spec/guidance/retro/check]]
func (n *retroMintNode) write(b *strings.Builder, indent string) {
	inner := indent + "  "
	switch n.kind {
	case 'o':
		if len(n.keys) == 0 {
			b.WriteString("{}")
			return
		}
		b.WriteString("{\n")
		for place, key := range n.keys {
			b.WriteString(inner + retroMintQuote(key) + ": ")
			n.vals[key].write(b, inner)
			if place < len(n.keys)-1 {
				b.WriteString(",")
			}
			b.WriteString("\n")
		}
		b.WriteString(indent + "}")
	case 'a':
		if len(n.items) == 0 {
			b.WriteString("[]")
			return
		}
		b.WriteString("[\n")
		for place, one := range n.items {
			b.WriteString(inner)
			one.write(b, inner)
			if place < len(n.items)-1 {
				b.WriteString(",")
			}
			b.WriteString("\n")
		}
		b.WriteString(indent + "]")
	case 's':
		b.WriteString(retroMintQuote(n.text))
	case 'n':
		if number, err := strconv.ParseFloat(n.text, 64); err != nil || math.IsInf(number, 0) {
			b.WriteString("null")
			return
		}
		b.WriteString(retroMintNumber(n.text))
	case 'b':
		b.WriteString(n.text)
	default:
		b.WriteString("null")
	}
}

// A string as JSON.stringify quotes it. [[spec/guidance/retro/check]]
func retroMintQuote(text string) string {
	var b strings.Builder
	b.WriteByte('"')
	for _, one := range text {
		switch one {
		case '"':
			b.WriteString(`\"`)
		case '\\':
			b.WriteString(`\\`)
		case '\b':
			b.WriteString(`\b`)
		case '\f':
			b.WriteString(`\f`)
		case '\n':
			b.WriteString(`\n`)
		case '\r':
			b.WriteString(`\r`)
		case '\t':
			b.WriteString(`\t`)
		default:
			if one < 0x20 {
				fmt.Fprintf(&b, `\u%04x`, one)
			} else {
				b.WriteRune(one)
			}
		}
	}
	b.WriteByte('"')
	return b.String()
}

// A JSON number as JavaScript prints it: no trailing zero, and an exponent past 1e21 or under 1e-6. [[spec/guidance/retro/check]]
func retroMintNumber(text string) string {
	number, err := strconv.ParseFloat(text, 64)
	switch {
	case err != nil && math.IsInf(number, 1):
		return "Infinity"
	case err != nil && math.IsInf(number, -1):
		return "-Infinity"
	case number == 0:
		return "0"
	}
	if size := math.Abs(number); size < 1e21 && size >= 1e-6 {
		return strconv.FormatFloat(number, 'f', -1, 64)
	}
	mantissa, exponent, _ := strings.Cut(strconv.FormatFloat(number, 'e', -1, 64), "e")
	sign, digits := exponent[:1], strings.TrimLeft(exponent[1:], "0")
	return mantissa + "e" + sign + digits
}
