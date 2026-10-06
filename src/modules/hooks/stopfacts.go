// What the door reads off the tree for the stops fold, off the reads behind
// CHECKS in src/bridge/stop.js and holdsIn in src/scripts/ephemeral.js: the
// rules, the plan, the holds, the tickets, and the branches git names.
// [[spec/tickets/cage-stop-rules-port]]
package hooks

import (
	"encoding/json"
	"sort"
	"strings"

	"quackitect/src/modules/hooks/stop"
)

// The folders the checks read, the branches they name, and the tickets and steps the handover reads. [[spec/tickets/the-stop-reads-the-state]]
const (
	// .claude/skills/level0/lib/folders.js owns the runtime folder, and the package spells it again. [[spec/design_output/pull#the-hand-and-the-hold]]
	holdsFolder = ".se/.runtime/hold"
	// .claude/skills/level0/lib/folders.js owns the private tickets' folder, and the package spells it again. [[spec/design_output/pull#the-private-queue]]
	privateTickets = ".se/tickets"
	publicTickets  = "spec/tickets"
	heldSuffix     = ".json"
	draftMark      = "_"
	workBranch     = "work/"
	trunkBranch    = "main"
	remotePrefix   = "origin/"
	clearTicket    = "clear"
	readTicket     = "read-handover"
	retroStep      = "retro"
)

// One hold on the box, as the pull writes it. [[spec/design_output/pull#the-hand-and-the-hold]]
type heldFile struct {
	Ticket    any  `json:"ticket"`
	Path      any  `json:"path"`
	Step      any  `json:"step"`
	Hand      any  `json:"hand"`
	Ephemeral bool `json:"ephemeral"`
}

// The facts the stops fold reads off an event: the stop settings on every one, the holds where the handover reads them, and the whole tree at a Stop and at the stop call. [[spec/tickets/cage-stop-rules-port]]
func (d *Door) stoppedOf(post Post, settings Settings, root string) Stopped {
	facts := Stopped{Off: settings.StopOff, Most: settings.MostInARow, HandoverAt: settings.HandoverAt, Layer: settings.BindingLayer}
	whole := post.Event == stopEvent || (post.Event == toolEvent && textOf(post.E, "tool") == stopCall)
	measured := post.Event == measureEvent || post.Event == turnEvent || post.Fill != nil
	if root == "" || !(whole || measured) {
		return facts
	}
	tree := disk{root}
	holds := holdsIn(tree)
	facts.Holds = len(holds)
	hand := handIn(tree)
	for _, one := range holds {
		facts.Clear = facts.Clear || (one.Ephemeral && heldText(one.Ticket) == clearTicket)
		facts.Retro = facts.Retro || (isRetro(tree, one) && ownsHold(hand, one))
	}
	if !whole {
		return facts
	}
	facts.Rules = rulesIn(tree)
	facts.Working, facts.Planned = plannedIn(tree)
	branch := d.branchOf(root)
	if strings.HasPrefix(branch, workBranch) {
		facts.Group = stop.HeldGroup(ticketText(tree, strings.TrimPrefix(branch, workBranch)))
	}
	for _, text := range folderTexts(tree, privateTickets, noteSuffix) {
		facts.Private = facts.Private || stop.OpenPrivate(text)
	}
	if settings.Cloud {
		return facts
	}
	if settings.Binding == stop.QueueBinding && branch == trunkBranch {
		facts.Queue = stop.QueueHolds(d.freeTickets(tree, root))
	}
	read := func(name string) string { return ticketText(tree, name) }
	for _, one := range holds {
		facts.PersonStep = facts.PersonStep || stop.WaitsOnPerson(read(heldText(one.Ticket)), read)
	}
	return facts
}

// Every hold on the box whose ticket stands. A hold naming no path, or a path standing nowhere, stands. [[spec/design_output/pull#the-hand-and-the-hold]]
func holdsIn(tree disk) []heldFile {
	names := tree.List(holdsFolder)
	sort.Strings(names)
	var out []heldFile
	for _, name := range names {
		text, ok := tree.Read(holdsFolder + "/" + name)
		var held heldFile
		if !strings.HasSuffix(name, heldSuffix) || !ok || json.Unmarshal([]byte(text), &held) != nil {
			continue
		}
		path := strings.TrimSpace(heldText(held.Path))
		if path != "" {
			if ticket, found := tree.Read(path); found && stop.Closed(ticket) {
				continue
			}
		}
		out = append(out, held)
	}
	return out
}

// A retro hold: its step opens on retro, or its ticket runs the retro route. [[spec/tickets/the-retro-holds-the-clear]]
func isRetro(tree disk, held heldFile) bool {
	if strings.Split(heldText(held.Step), "/")[0] == retroStep {
		return true
	}
	text, _ := tree.Read(heldText(held.Path))
	for _, line := range strings.Split(text, "\n") {
		if said, found := strings.CutPrefix(strings.TrimSpace(line), "process:"); found {
			return strings.HasSuffix(strings.TrimSuffix(strings.TrimSpace(said), "]]"), "/"+retroStep)
		}
	}
	return false
}

// The rules under spec/config/stop, a draft aside, in file order. [[spec/design_output/stop#where-the-rules-live]]
func rulesIn(tree disk) []stop.Rule {
	names := tree.List(stop.Rules)
	sort.Strings(names)
	var files []stop.File
	for _, name := range names {
		if text, ok := tree.Read(stop.Rules + "/" + name); ok && strings.HasSuffix(name, stop.RuleEnd) && !strings.HasPrefix(name, draftMark) {
			files = append(files, stop.File{Name: name, Text: text})
		}
	}
	rules, _ := stop.Pool(files)
	return rules
}

// The plan's work in hand, and the title of each todo it holds. [[spec/design_output/stop#the-plan]]
func plannedIn(tree disk) (string, []string) {
	text, ok := tree.Read(planFile)
	var plan map[string]any
	if !ok || json.Unmarshal([]byte(text), &plan) != nil {
		return "", nil
	}
	todos, _ := plan[planTodos].([]any)
	titles := make([]string, 0, len(todos))
	for _, one := range todos {
		row, _ := one.(map[string]any)
		titles = append(titles, textOf(row, "title"))
	}
	return textOf(plan, planWorking), titles
}

// The branch git stands on under the root, or nothing where the door reaches no git. [[spec/design_output/pull#the-hand-and-the-hold]]
func (d *Door) branchOf(root string) string {
	if d.from.Git == nil {
		return ""
	}
	return strings.TrimSpace(d.from.Git(root, "rev-parse", "--abbrev-ref", "HEAD"))
}

// The texts of the public tickets whose group no work branch takes. [[spec/tickets/the-stop-reads-the-state]]
func (d *Door) freeTickets(tree disk, root string) []string {
	taken := map[string]bool{}
	if d.from.Git != nil {
		branch := strings.TrimSuffix(workBranch, "/")
		for _, one := range strings.Split(d.from.Git(root, "for-each-ref", "--format=%(refname:short)", "refs/heads/"+branch, "refs/remotes/origin/"+branch), "\n") {
			if name := strings.TrimPrefix(strings.TrimSpace(one), remotePrefix); strings.HasPrefix(name, workBranch) {
				taken[strings.TrimPrefix(name, workBranch)] = true
			}
		}
	}
	var out []string
	for _, name := range sortedList(tree, publicTickets) {
		if strings.HasSuffix(name, noteSuffix) && !strings.HasPrefix(name, draftMark) && !taken[strings.TrimSuffix(name, noteSuffix)] {
			out = append(out, tree.text(publicTickets+"/"+name))
		}
	}
	return out
}

// The texts of the notes a folder holds, one a name with the suffix. [[spec/design_output/pull#the-private-queue]]
func folderTexts(tree disk, folder, suffix string) []string {
	var out []string
	for _, name := range sortedList(tree, folder) {
		if text, ok := tree.Read(folder + "/" + name); ok && strings.HasSuffix(name, suffix) {
			out = append(out, text)
		}
	}
	return out
}

func sortedList(tree disk, folder string) []string {
	names := tree.List(folder)
	sort.Strings(names)
	return names
}

// A public ticket's text by its name, or nothing. [[spec/design_output/work#a-group-is-a-ticket]]
func ticketText(tree disk, name string) string {
	if name == "" {
		return ""
	}
	return tree.text(publicTickets + "/" + name + noteSuffix)
}

// A hold's field as the bridge's String reads it. [[spec/tickets/cage-stop-rules-port]]
func heldText(said any) string {
	return textOf(map[string]any{"said": said}, "said")
}
