// The dispatcher's writes: a fix group holding the loose agent tickets, and a
// branch for each ready group on main standing with none. Every write rides one
// commit on claude/dispatch-<commit>, made off main's tree with no work tree,
// so no push names main and the box's checkout moves nowhere.
// [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
package branches

import (
	"encoding/json"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"quackitect/src/modules/check"
	"quackitect/src/modules/git"
	"quackitect/src/yaml"
)

// The branch prefix the writes ride, and a commit's short name as git prints it. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
const (
	writesPrefix = "claude/dispatch-"
	writeShort   = 7
	writeFree    = "free"
	fixField     = "fix"
	fixPrefix    = "loose-fixes"
	namesWords   = "names.words"
	processEnd   = ".yaml"
	ticketKind   = "ticket"
)

// The ask the dispatch writes into a fix group. [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
const fixAsk = `The loose agent tickets on main land in this fix group, per [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]].

A fix group closes every ticket it holds. Work a person alone can do leaves it on the person route, loose on main.

- every ticket naming this group closes through the command it names
- ` + "`./RUNME.sh check`" + ` exits 0

The view: none.

The source: none.`

// The groups on main that open: open, marked for no cloud, with no branch, holding no group, and waiting on nothing up the parent chain. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func opensOf(read workRead, standing, trunkTickets map[string]string) []string {
	branched := map[string]bool{}
	texts := []string{}
	for _, one := range read.Stand {
		branched[one.Name] = true
		texts = append(texts, one.Ticket)
	}
	for _, one := range read.Loose {
		texts = append(texts, one.Text)
	}
	parents := parentsIn(texts)
	out := []string{}
	for _, one := range read.Loose {
		if isGroup(one.Text) && fieldOf(one.Text, "state") != closedState && fieldOf(one.Text, cloudMark) != "true" &&
			!branched[one.Name] && !parents[one.Name] && len(waitsIn(one.Text, standing, trunkTickets)) == 0 {
			out = append(out, one.Name)
		}
	}
	sort.Strings(out)
	return out
}

// Where the writes stand: blind with no main, standing where this main's branch stands, waiting on an unmerged one, or free. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
type writeAt struct {
	Branch, State, Main string
}

// What stops the writes: a write branch of this main already standing, or an earlier one still unmerged. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
func (d *Doors) writeState() writeAt {
	main := d.rev("origin/" + trunk)
	if main == "" {
		return writeAt{State: "blind"}
	}
	branch := writesPrefix + shortWrite(main)
	stood, _ := d.Repo.Refs(remoteRefs + writesPrefix)
	standing := remoteRows(stood)
	inside, _ := d.Repo.Merged(remoteRefs, "origin/"+trunk)
	merged := map[string]bool{}
	for _, one := range remoteRows(inside) {
		merged[one] = true
	}
	for _, one := range standing {
		if one == branch {
			return writeAt{Branch: branch, State: "standing", Main: main}
		}
	}
	for _, one := range standing {
		if !merged[one] {
			return writeAt{Branch: one, State: "waits", Main: main}
		}
	}
	return writeAt{Branch: branch, State: writeFree, Main: main}
}

// The remote branches a git branch listing names, origin/ cut off. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
func remoteRows(refs []git.Ref) []string {
	var out []string
	for _, one := range refs {
		out = append(out, strings.TrimPrefix(one.Name, remoteRefs))
	}
	return out
}

// A commit's short name, as git prints it. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
func shortWrite(sha string) string {
	return sha[:min(writeShort, len(sha))]
}

// The fix group's name, cut to the words a name holds. A parent's name rides last, so the cut keeps the commit. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func fixName(words int, main, parent string) string {
	parts := []string{fixPrefix, shortWrite(main)}
	if parent != "" {
		parts = append(parts, parent)
	}
	return cutTo(strings.Join(parts, "-"), words)
}

var nameJoins = regexp.MustCompile(`[-_.]+`)

// A name past the words it may hold keeps its first ones, as cutTo in src/scripts/ticket.js does. [[spec/tickets/prose-verbs-land-first-try]]
func cutTo(name string, most int) string {
	if most <= 0 || check.OverLong(name, most) == "" {
		return name
	}
	var kept []string
	for _, part := range nameJoins.Split(name, -1) {
		if part != "" && len(kept) < most {
			kept = append(kept, part)
		}
	}
	return strings.Join(kept, "-")
}

// The words a name holds at most, off the config. [[spec/tickets/prose-verbs-land-first-try]]
func (d *Doors) nameWords() int {
	said, _ := strconv.Atoi(d.config(namesWords))
	return said
}

// The files the run writes, by path under the tree, or a reason nothing is written. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
func (d *Doors) writesOf(plan *dispatchPlan, read workRead, main string) (map[string]string, string) {
	out := map[string]string{}
	texts := trunkOf(read.Loose)
	// Each bundle becomes a fix group under its parent. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
	for _, one := range plan.Bundles {
		name := fixName(d.nameWords(), main, one.Parent)
		text, why := d.fixGroup(name, one.Parent)
		if why != "" {
			return nil, why
		}
		out[ticketAt(name)] = text
		for _, ticket := range one.Tickets {
			out[ticketAt(ticket)] = withField(texts[ticket], groupField, name)
		}
	}
	// A parent's close rides the same commit, so a second run over this main writes it no more. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
	for _, name := range plan.Closes {
		out[ticketAt(name)] = withField(texts[name], "state", closedState)
	}
	// The cloud marker rides this commit in place of marksTrunk and openGroup, because both of those push main. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
	for _, name := range plan.Opens {
		out[ticketAt(name)] = withField(texts[name], cloudMark, "true")
	}
	return out, ""
}

// A fix group minted off the group route, marked fix and filed under its parent. The ask is this file's constant, and the check on the write branch's pull request lints every ticket it lands. [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
func (d *Doors) fixGroup(name, parent string) (string, string) {
	path := ticketAt(name)
	route, why := d.processAt(groupRoute)
	if why != "" {
		return "", why
	}
	fields := map[string]any{
		"process":      route.Link,
		"process_hash": route.Hash,
		"steps":        route.Steps,
		"Ask":          fixAsk,
	}
	text, why := check.Minted(d.schemas(), ticketKind, path, fields)
	if why != "" {
		return "", why
	}
	text = withField(text, fixField, "true")
	if parent != "" {
		text = withField(text, groupField, parent)
	}
	return text, ""
}

// The ticket schema under the method root, the one kind governing spec/tickets, which the mint reads. [[spec/design_output/schema#mint-writes-a-valid-note]]
func (d *Doors) schemas() *check.Kinds {
	files := check.Texts{ticketSchema: d.methodRead(ticketSchema)}
	return check.SchemasIn(check.TreeOver(d.Method, files))
}

// A process route as a mint copies it in: its link, its hash, its ask and its steps. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
type processRoute struct {
	Link, Hash string
	Ask, Steps []any
}

// The route a process file holds, as ProcessAt in src/pull/process.go reads it. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func (d *Doors) processAt(name string) (processRoute, string) {
	text := d.methodRead(processFolder + "/" + name + processEnd)
	if text == "" {
		return processRoute{}, processFolder + " holds no " + name + "."
	}
	held := yaml.AsDoc(yaml.Read(text))
	route := processRoute{Link: processFolder + "/" + name, Ask: yaml.Flat(held.Get("ask")), Steps: yaml.Flat(held.Get("steps"))}
	route.Hash = processHash(route.Ask, route.Steps)
	return route, ""
}

// The hash over a route's ask and steps, as processHash in lib/schema-route.js writes it: keys sorted, every scalar a string. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func processHash(ask, steps []any) string {
	said, _ := json.Marshal(map[string]any{"ask": canonicalOf(ask), "steps": canonicalOf(steps)})
	return hashText(string(said))
}

// A value as canonicalOf in lib/schema-route.js holds it. Go's encoder sorts a map's keys, as the JavaScript sorts them. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func canonicalOf(said any) any {
	switch one := said.(type) {
	case []any:
		out := make([]any, 0, len(one))
		for _, each := range one {
			out = append(out, canonicalOf(each))
		}
		return out
	case *yaml.Doc:
		out := map[string]any{}
		for _, key := range one.Keys() {
			out[key] = canonicalOf(one.Get(key))
		}
		return out
	case nil:
		return ""
	}
	return yaml.AsString(said)
}

// One commit off main carrying the writes, pushed to the write branch, which touches no work tree. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
func (d *Doors) land(branch string, files map[string]string, main string) string {
	made, err := d.Repo.CommitFiles("origin/"+trunk, files, branch+": the dispatch over "+trunk+" at "+shortWrite(main))
	if err != nil {
		return "The writes would not commit, so nothing is pushed."
	}
	if !d.Repo.PushTo(made, branch).OK {
		return "The push of " + branch + " came back refused."
	}
	return ""
}

// A ready group's branch opens on a commit of its own off main, as branch open makes it, and main takes no push. [[spec/design_output/work#a-merged-branch-closes]]
func (d *Doors) opens(names []string) []string {
	var refused []string
	for _, name := range names {
		branch := workBranch + name
		mark := d.markOff(branch)
		if mark == "" || !d.Repo.PushTo(mark, branch).OK {
			refused = append(refused, branch)
		}
	}
	return refused
}
