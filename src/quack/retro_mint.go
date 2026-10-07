// The retro's tickets: one a class the check step leaves open, and one a
// promotion, minted off the route its ticket names, its ask written and the
// draft opened.
// [[spec/guidance/retro/check]]
package main

import (
	"errors"
	"fmt"
	"io"
	"io/fs"
	"maps"
	"path/filepath"
	"slices"
	"strings"

	"quackitect/src/proc"
	"quackitect/src/pull"
	"quackitect/src/yaml"
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

func init() {
	register("retro mint", retroMintVerb(quietBox, retroMintRunme))
}

// Runs a program under the root over the real process door. [[spec/design_output/vehicle#the-work-root-inherits]]
func retroMintRunme(dir string, argv []string, env map[string]string) retroMintRan {
	return retroMintRunmeOver(proc.Real)(dir, argv, env)
}

// Runs a program under the root through the process door, with ./RUNME.sh read as the root's own, and the env added over the caller's in sorted order. [[spec/tickets/quack-spawns-all-take-the-runner]]
func retroMintRunmeOver(run proc.Runner) func(dir string, argv []string, env map[string]string) retroMintRan {
	return func(dir string, argv []string, env map[string]string) retroMintRan {
		program := argv[0]
		if program == retroMintRunmeAt {
			program = filepath.Join(dir, "RUNME.sh")
		}
		pairs := make([]string, 0, len(env))
		for _, key := range slices.Sorted(maps.Keys(env)) {
			pairs = append(pairs, key+"="+env[key])
		}
		said := run(proc.Command{Argv: append([]string{program}, argv[1:]...), Dir: dir, Env: pairs})
		ran := retroMintRan{out: said.Out, errs: said.Err, code: said.Code}
		if said.Code < 0 {
			ran.code = exitFailed
		}
		return ran
	}
}

// The ask a class hands its ticket, as the chapter the mint leaves empty. [[spec/guidance/retro/check]]
func retroMintAskOf(ticket retroMintTicket) string {
	said := map[string][]string{"gain": {ticket.Gain}, "breaks": {ticket.Breaks}, "done_when": ticket.DoneWhen}
	return pull.AskFrom(retroMintAskShape(), said) + "\n"
}

// The ask fields a class's ticket carries, in the shape and order a process names them, so pull.AskFrom alone owns the layout. [[spec/tickets/verbs-mint-tickets-and-keys]]
func retroMintAskShape() []any {
	shape := []any{}
	for _, one := range [][2]string{{"gain", "text"}, {"breaks", "text"}, {"done_when", "list"}} {
		field := yaml.New()
		field.Set("name", one[0])
		field.Set("form", one[1])
		shape = append(shape, field)
	}
	return shape
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
func retroMintFaults(disk diskDoors, record retroMintRecord, root string) []string {
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
		faults = append(faults, retroMintTicketFaults(disk, one.ID+" stands open", one.Ticket, root)...)
	}
	for at, one := range record.Promotions {
		if len(one.Tickets) > 0 {
			continue
		}
		faults = append(faults, retroMintTicketFaults(disk, retroMintPromotionName(one, at)+" waits", one.Ticket, root)...)
	}
	return faults
}

// Every field a ticket to mint carries none of, each named after the thing it serves. [[spec/tickets/a-promotion-names-its-fault]]
func retroMintTicketFaults(disk diskDoors, said string, ticket *retroMintTicket, root string) []string {
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
		if why := retroMintProcessWhy(disk, root, process); why != "" {
			faults = append(faults, fmt.Sprintf("%s, and its ticket names process %s: %s", said, process, why))
		}
	}
	if len(ticket.DoneWhen) == 0 {
		faults = append(faults, said+", and its ticket carries no done_when")
	}
	return faults
}

// Why a process stands nowhere under the root, as processAt in src/scripts/process.js says it, or nothing where it stands. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func retroMintProcessWhy(disk diskDoors, root, said string) string {
	name := strings.TrimSpace(said)
	name = strings.TrimSuffix(strings.TrimPrefix(name, "[["), "]]")
	name = strings.TrimPrefix(name, retroMintProcesses+"/")
	name = strings.TrimSpace(strings.TrimSuffix(name, ".yaml"))
	standing := []string{}
	if entries, err := disk.list(filepath.Join(root, filepath.FromSlash(retroMintProcesses))); err == nil {
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
	if !disk.stands(filepath.Join(root, filepath.FromSlash(retroMintProcesses), name+".yaml")) {
		return fmt.Sprintf("%s holds no %s. It holds %s.", retroMintProcesses, name, strings.Join(standing, ", "))
	}
	return ""
}

// The verb: mints one ticket a class standing open and a promotion waiting, writes its ask and opens the draft. [[spec/guidance/retro/check]]
func retroMintVerb(box func() boxDoors, run retroMintRun) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		d := box()
		disk := d.disk
		at, home := "", retroRootOf(d)
		if len(argv) > 2 && argv[2] != "" {
			at = filepath.Join(retroHome(home, argv[2]), retroMintRecordAt)
		}
		text, err := disk.read(at)
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
		if faults := retroMintFaults(disk, record, home); len(faults) > 0 {
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
			if !retroMintOne(disk, home, run, one.ticket, one.label, out, errs) {
				return exitFailed
			}
			one.node.set("tickets", &retroMintNode{kind: 'a', items: []*retroMintNode{{kind: 's', text: one.ticket.Name}}})
			made++
			if !retroMintWrites(disk, at, kept, errs) {
				return exitFailed
			}
		}
		if !retroMintWrites(disk, at, kept, errs) || !retroMintKeeps(disk, home, argv[2], errs) {
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
func retroMintOne(disk diskDoors, root string, run retroMintRun, ticket *retroMintTicket, label string, out, errs io.Writer) bool {
	path := retroMintTickets + "/" + ticket.Name + ".md"
	env := map[string]string{workRoot: root}
	ran := run(root, []string{retroMintRunmeAt, "mint", "ticket", path, "--process=" + strings.TrimSpace(ticket.Process)}, env)
	if ran.code != 0 {
		fmt.Fprintf(errs, "%s mints no ticket: %s\n", label, strings.TrimSpace(ran.errs))
		return false
	}
	file := filepath.Join(root, filepath.FromSlash(path))
	text, err := disk.read(file)
	if err == nil {
		err = disk.write(file, []byte(retroMintWithAsk(string(text), retroMintAskOf(*ticket))), 0o644)
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
func retroMintWrites(disk diskDoors, at string, kept *retroMintNode, errs io.Writer) bool {
	var text strings.Builder
	kept.write(&text, "")
	text.WriteString("\n")
	if err := disk.write(at, []byte(text.String()), 0o644); err != nil {
		fmt.Fprintln(errs, err)
		return false
	}
	return true
}

// Copies the classes, the rates and the collect time into the tracked folder, so a fresh box's effect measures against them; the collect time keeps its time alone, and a missing file stays missing. [[spec/tickets/retro-read-reads-every-record]]
func retroMintKeeps(disk diskDoors, root, name string, errs io.Writer) bool {
	home, into := retroHome(root, name), filepath.Join(root, filepath.FromSlash(retroKept), name)
	if err := disk.makeAll(into, 0o777); err != nil {
		fmt.Fprintln(errs, err)
		return false
	}
	for _, file := range []string{retroClassesFile, retroRatesFile} {
		text, err := disk.read(filepath.Join(home, file))
		if errors.Is(err, fs.ErrNotExist) {
			continue
		}
		if err == nil {
			err = disk.write(filepath.Join(into, file), text, 0o644)
		}
		if err != nil {
			fmt.Fprintln(errs, err)
			return false
		}
	}
	read, ok := retroJSParse(disk.text(filepath.Join(home, retroEffectCollected)))
	if !ok {
		return true
	}
	if err := retroJSWrite(disk, filepath.Join(into, retroEffectCollected), retroJSObject("at", retroJSField(read, "at"))); err != nil {
		fmt.Fprintln(errs, err)
		return false
	}
	return true
}

// The record classes writes: its five keys in their order, each list a list and the dispositions an object. [[spec/guidance/retro/classify]]
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
