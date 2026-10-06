// What a hand-back writes: the record, the step it moves to, the commit and
// the push. Each one ends by handing the next leaf out, off
// src/scripts/pull-writes.js and pull-children.js.
// [[spec/design_output/pull#the-pass]]
package pull

import (
	"fmt"
	"maps"
	"regexp"
	"slices"
	"strconv"
	"strings"

	"quackitect/src/front"
	"quackitect/src/yaml"
)

// The route a finding's child follows, and the words a gate's point carries. [[spec/design_output/pull#a-finding-rides-out]]
const (
	childRoute = "trivial"
	pointField = "point"
	gatePoint  = "gate"
)

// The pairs of one record entry, in the order the record writes them. [[spec/tickets/go-writes-the-frontmatter]]
type entryPairs = []front.Pair

// One key and its value of a record entry. [[spec/tickets/go-writes-the-frontmatter]]
func pair(key string, value any) front.Pair { return front.Pair{Key: key, Value: value} }

// One item at the end of the record, through the one front writer. [[spec/tickets/go-writes-the-frontmatter]]
func withEntry(text string, pairs ...front.Pair) string {
	put, err := front.Entry(text, front.Ordered(pairs))
	if err != nil {
		return text
	}
	return put
}

// One field of the front set, through the one front writer. [[spec/tickets/go-writes-the-frontmatter]]
func withField(text, key, value string) string {
	put, err := front.Set(text, key, value)
	if err != nil {
		return text
	}
	return put
}

// One field of the front dropped, through the one front writer. [[spec/tickets/go-writes-the-frontmatter]]
func withoutField(text, key string) string {
	put, err := front.Drop(text, key)
	if err != nil {
		return text
	}
	return put
}

// A ticket closing for the reason, its tag taken off. [[spec/design_output/pull#the-pass]]
func shut(text string, front *yaml.Doc, reason string) string {
	now := withField(withField(text, "state", Closed), "reason", reason)
	if front.Has("todo") {
		now = withField(now, "todo", "false")
	}
	return now
}

// The record's entries, each a mapping. [[spec/design_output/work#held-derives-from-the-record]]
func entriesOf(front *yaml.Doc) []*yaml.Doc {
	out := []*yaml.Doc{}
	for _, one := range yaml.Flat(front.Get("record")) {
		if entry := yaml.AsDoc(one); entry != nil {
			out = append(out, entry)
		}
	}
	return out
}

// The record of a ticket's text. [[spec/design_output/work#held-derives-from-the-record]]
func recordIn(text string) []*yaml.Doc { return entriesOf(FrontOf(text)) }

// How often a leaf came back, the most the record names. [[spec/design_output/pull#the-fail]]
func returnsOf(front *yaml.Doc, path string) int {
	most := 0
	for _, one := range entriesOf(front) {
		if yaml.AsString(one.Get("step")) == path {
			if said, _ := strconv.Atoi(yaml.AsString(one.Get("returns"))); said > most {
				most = said
			}
		}
	}
	return most
}

// The leaf a fail goes back to: the leaf on_fail names, the first leaf of a phase it names, or the leaf itself. [[spec/design_output/pull#the-fail]]
func target(leaf *Leaf, said string) string {
	if said == "" {
		return leaf.Path
	}
	holder := leaf.Entry
	named, ok := EntryNamed(leaf.Walk, said, &holder)
	if !ok {
		return leaf.Path
	}
	if named.Leaf {
		return named.Path
	}
	for _, one := range leaf.Walk {
		if one.Leaf && strings.HasPrefix(one.Path, named.Path+"/") {
			return one.Path
		}
	}
	return leaf.Path
}

// What a group's children say: which stand open, which closed dropped. [[spec/design_output/pull#children-before-their-group]]
type childrenSaid struct{ open, dropped, all []string }

func childrenSay(all []*Held, name string) childrenSaid {
	out := childrenSaid{open: []string{}, dropped: []string{}, all: []string{}}
	for _, one := range all {
		if one.Private || FieldOf(one.Text, GroupField) != name {
			continue
		}
		out.all = append(out.all, one.Name)
		if FieldOf(one.Text, "state") != Closed {
			out.open = append(out.open, one.Name)
		} else if FieldOf(one.Text, "reason") == "dropped" {
			out.dropped = append(out.dropped, one.Name)
		}
	}
	return out
}

// What rides a pass commit beside the ticket: the changes its subject names, the files it wrote, and whether the step stays on the leaf. [[spec/design_output/pull#a-finding-rides-out]]
type more struct {
	changes, wrote []string
	stays          bool
}

// [[spec/design_output/pull#the-pass]]
func (it *It) passed(who *Who, one *Held, leaf *Leaf, held Hold, answered []Answered, also more) int {
	tip := ""
	if !one.Private {
		tip = it.tipOf()
	}
	text := withEntry(one.Text, pair("step", leaf.Path), pair("hand", RoleOf(who.Hand)), pair("hash_before", held.Hash), pair("hash_after", tip),
		pair("answered", answeredRows(answered)), pair("inputs", it.inputsOf(one.Text, leaf)), pair("def", defOf(leaf)))
	changes := append([]string{"passes " + leaf.Path}, also.changes...)
	one.Text = it.stepOn(one, leaf, text, &changes, also.stays)
	if finding := it.landed(one, changes, also.wrote); finding != "" {
		for _, at := range also.wrote {
			it.remove(at)
		}
		return it.unlanded(one, leaf, finding)
	}
	it.dropHold(who.Hand)
	ok, why := it.sentOut(one, who.Branch)
	if !ok {
		return it.refusedPush(why)
	}
	return it.onward(who, append([]string{fmt.Sprintf("%s %s.", one.Name, strings.Join(changes, ", "))}, why...))
}

// The step past a leaf: the next leaf whose condition holds, a waiting child, or done. [[spec/design_output/pull#the-pass]]
func (it *It) stepOn(one *Held, leaf *Leaf, before string, changes *[]string, stays bool) string {
	text := before
	if stays {
		*changes = append(*changes, "waits at "+leaf.Path)
	}
	var next *Entry
	if stays {
		next = &leaf.Entry
	} else if leaf.At+1 < len(leaf.Leaves) {
		next = &leaf.Leaves[leaf.At+1]
	}
	for next != nil && !stays {
		holds, why := it.holdsHere(yaml.AsString(next.Said.Get("when")), text)
		var entry []front.Pair
		if holds {
			entry = it.keptRed(text, LeafOf(FrontOf(text), next.Path), one.Name)
		} else {
			entry = []front.Pair{pair("step", next.Path), pair("skipped", true), pair("why", why)}
		}
		if entry == nil {
			break
		}
		text = withEntry(text, entry...)
		word := "skips"
		if holds {
			word = "keeps"
		}
		*changes = append(*changes, word+" "+next.Path)
		at := -1
		for i, each := range leaf.Leaves {
			if each.Path == next.Path {
				at = i
			}
		}
		next = nil
		if at+1 < len(leaf.Leaves) {
			next = &leaf.Leaves[at+1]
		}
	}
	if next != nil {
		return withField(withField(text, "step", next.Path), "state", Open)
	}
	if path, why := it.childrenWaiting(one, FrontOf(text)); path != "" {
		*changes = append(*changes, fmt.Sprintf("returns to %s, because %s", path, why))
		return withField(withField(text, "step", path), "state", Open)
	}
	*changes = append(*changes, "closes "+Done)
	return shut(text, FrontOf(text), Done)
}

// A design review passing with findings mints a draft child a row on the trivial route, and every child is built before any is written. A gate's points stand open at the front of the queue. [[spec/design_output/pull#a-finding-rides-out]]
func (it *It) minted(who *Who, one *Held, leaf *Leaf, held Hold, findings []Finding, answered []Answered) int {
	standsAs := map[string]any{"state": Draft}
	if leaf.Gate != "" {
		standsAs = map[string]any{"state": Open, "todo": true, pointField: gatePoint}
	}
	route, why := ProcessAt(it.methodDisk(), childRoute)
	if why != "" {
		return it.unminted(one, leaf, why)
	}
	folder := Tickets
	if one.Private {
		folder = Notes
	}
	group := FieldOf(one.Text, GroupField)
	if IsGroup(one.Text) {
		group = one.Name
	}
	type child struct{ at, text string }
	built := []child{}
	names := []string{}
	for _, finding := range findings {
		path := folder + "/" + finding.Name + ".md"
		fields := map[string]any{"parent": one.Name}
		for key, value := range standsAs {
			fields[key] = value
		}
		if group != "" {
			fields[GroupField] = group
		}
		text, why := it.RoutedTicket(path, route, FromHold(route.Route, one.Name, leaf.Path), finding.Line, fields)
		if why != "" {
			return it.unminted(one, leaf, finding.Name+" mints nothing: "+why)
		}
		built = append(built, child{at: path, text: text})
		names = append(names, finding.Name)
	}
	wrote := []string{}
	for _, one := range built {
		_ = it.Disk.Write(one.at, one.text)
		wrote = append(wrote, one.at)
	}
	return it.passed(who, one, leaf, held, answered, more{changes: []string{"mints " + strings.Join(names, ", ")}, wrote: wrote, stays: leaf.Final || asksBless(leaf)})
}

// A child that mints nothing lands nothing, so the hold stands. [[spec/design_output/pull#a-finding-rides-out]]
func (it *It) unminted(one *Held, leaf *Leaf, why string) int {
	it.Say(Refused, why, "", fmt.Sprintf("Fix it, and %s stays in hand at %s.", one.Name, leaf.Path))
	return 1
}

// The children step a closing group goes back to, while a child stands open. [[spec/design_output/pull#children-before-their-group]]
func (it *It) childrenWaiting(one *Held, front *yaml.Doc) (string, string) {
	for _, step := range WalkOf(front) {
		if yaml.AsString(step.Said.Get("by")) != "children" {
			continue
		}
		said := childrenSay(it.ticketsHere(), one.Name)
		if len(said.open) == 0 {
			return "", ""
		}
		return step.Path, strings.Join(said.open, ", ") + " stand open"
	}
	return "", ""
}

// [[spec/design_output/pull#the-fail]]
func (it *It) failed(who *Who, one *Held, leaf *Leaf, held Hold, reason string, answered []Answered) int {
	back := target(leaf, leaf.OnFail)
	returns := returnsOf(one.Front, leaf.Path) + 1
	after := ""
	if !one.Private {
		after = it.tipOf()
	}
	text := withEntry(one.Text, pair("step", leaf.Path), pair("hand", RoleOf(who.Hand)), pair("hash_before", held.Hash), pair("hash_after", after),
		pair("returns", returns), pair("why", reason), pair("answered", answeredRows(answered)))
	changes := []string{fmt.Sprintf("fails %s back to %s", leaf.Path, back)}
	one.Text = withField(withField(text, "step", back), "state", Open)
	// At the cap a person step goes in before the target, asking the reason, so it rides the fail commit. [[spec/design_output/pull#the-fail]]
	capped := it.Fails > 0 && returns >= it.Fails
	person := ""
	if capped {
		person = it.withPersonStep(one, back, fmt.Sprintf("%s fails back %d times: %s", leaf.Path, returns, reason), nil)
	}
	if person != "" {
		changes = append(changes, "asks "+person)
	}
	if finding := it.landed(one, changes, nil); finding != "" {
		return it.unlanded(one, leaf, finding)
	}
	it.dropHold(who.Hand)
	ok, why := it.sentOut(one, who.Branch)
	if !ok {
		return it.refusedPush(why)
	}
	if capped && person == "" {
		it.Say(Wait, append([]string{
			fmt.Sprintf("%s %s, and %s fails back %d times.", one.Name, strings.Join(changes, ", "), leaf.Path, returns),
			fmt.Sprintf("The hold drops here, so %s stands open for the hand that takes it next.", back),
		}, why...)...)
		return 0
	}
	return it.onward(who, append([]string{fmt.Sprintf("%s %s.", one.Name, strings.Join(changes, ", "))}, why...))
}

// [[spec/design_output/pull#became]]
func (it *It) became(who *Who, one *Held, leaf *Leaf, held Hold, successor string, answered []Answered, also more) int {
	stands := false
	for _, each := range TicketsHere(it.Disk) {
		stands = stands || each.Name == successor
	}
	if !stands {
		it.Say(Refused, fmt.Sprintf("%s stands nowhere yet. Mint it, then hand back --became %s.", successor, successor))
		return 1
	}
	after := ""
	if !one.Private {
		after = it.tipOf()
	}
	text := withEntry(one.Text, pair("step", leaf.Path), pair("hand", RoleOf(who.Hand)), pair("hash_before", held.Hash), pair("hash_after", after), pair("answered", answeredRows(answered)))
	one.Text = withField(shut(text, FrontOf(text), "became"), "successors", "["+successor+"]")
	if finding := it.landed(one, append([]string{"closes became " + successor}, also.changes...), also.wrote); finding != "" {
		for _, at := range also.wrote {
			it.remove(at)
		}
		return it.unlanded(one, leaf, finding)
	}
	it.dropHold(who.Hand)
	ok, why := it.sentOut(one, who.Branch)
	if !ok {
		return it.refusedPush(why)
	}
	return it.onward(who, append([]string{fmt.Sprintf("%s closes became %s.", one.Name, successor)}, why...))
}

// [[spec/design_output/pull#answered]]
func (it *It) answeredBy(who *Who, one *Held, leaf *Leaf, held Hold, answerer string, answered []Answered) int {
	if answerer == one.Name {
		it.Say(Refused, one.Name+" answers no ask of its own. Name the ticket answering it.")
		return 1
	}
	stands := false
	for _, each := range TicketsHere(it.Disk) {
		stands = stands || each.Name == answerer
	}
	if !stands {
		it.Say(Refused, fmt.Sprintf("%s stands nowhere. Name the ticket answering this ask, then hand back --answered %s.", answerer, answerer))
		return 1
	}
	after := ""
	if !one.Private {
		after = it.tipOf()
	}
	text := withEntry(one.Text, pair("step", leaf.Path), pair("hand", RoleOf(who.Hand)), pair("hash_before", held.Hash), pair("hash_after", after),
		pair("why", answerer+" answers this ask"), pair("answered", answeredRows(answered)))
	one.Text = shut(text, FrontOf(text), "answered")
	if finding := it.landed(one, []string{"closes answered by " + answerer}, nil); finding != "" {
		return it.unlanded(one, leaf, finding)
	}
	it.dropHold(who.Hand)
	ok, why := it.sentOut(one, who.Branch)
	if !ok {
		return it.refusedPush(why)
	}
	return it.onward(who, append([]string{fmt.Sprintf("%s closes answered by %s.", one.Name, answerer)}, why...))
}

// The hand-back done, the next leaf goes out, or a hand of its own stops at its one step. [[spec/design_output/pull#a-hand-of-its-own]]
func (it *It) onward(who *Who, rows []string) int {
	it.dropHold(who.Hand)
	it.Say(Work, rows...)
	if who.PlainHand != "" {
		who.Hand = who.PlainHand
	}
	it.OwnerSays = false
	if !who.OneStep {
		return it.handOut(who)
	}
	it.Say(Done, who.Hand+" works one step, and it is done. Stop here.")
	return 0
}

// [[spec/design_output/pull#the-refused-commit]]
func (it *It) unlanded(one *Held, leaf *Leaf, finding string) int {
	it.Say(Refused, unlandedRows(one, leaf, finding)...)
	return 1
}

func unlandedRows(one *Held, leaf *Leaf, finding string) []string {
	rows := []string{"the hook refuses the commit, so nothing lands:"}
	for _, row := range strings.Split(finding, "\n") {
		if row != "" {
			rows = append(rows, row)
		}
	}
	return append(rows, "", fmt.Sprintf("Fix it, and %s stays in hand at %s.", one.Name, leaf.Path))
}

// [[spec/design_output/pull#the-rejected-push]]
func (it *It) refusedPush(why []string) int {
	it.Say(Refused, append([]string{"The hand-back stands on this box, and its push reaches no origin."}, why...)...)
	return 1
}

// The commit the work root stands on. [[spec/design_output/pull#the-pass]]
func (it *It) tipOf() string { return it.Git.Run("rev-parse", "HEAD").Out }

// The commits between a tip and the branch tip, split by the ticket each names. A log the door fails to read answers read false, which every caller takes as a move. [[spec/tickets/the-verdict-guard-reads-tips]]
func (it *It) commitsFor(name, since string) (read bool, own, other []string) {
	if since == "" {
		return false, nil, nil
	}
	said := it.Git.Run("log", "--format=%H%x00%s", since+"..HEAD")
	if !said.OK {
		return false, nil, nil
	}
	for _, row := range strings.Split(said.Out, "\n") {
		if strings.TrimSpace(row) == "" {
			continue
		}
		sha, subject, _ := strings.Cut(row, "\x00")
		ticket := ""
		if at := strings.Index(subject, ":"); at >= 0 {
			ticket = strings.TrimSpace(subject[:at])
		}
		if ticket == name {
			own = append(own, strings.TrimSpace(sha))
		} else {
			other = append(other, strings.TrimSpace(sha))
		}
	}
	return true, own, other
}

// The files the ticket's own commits change since its first take, and the working tree while the tip stands where the hold left it. [[spec/design_output/pull#the-test-verb]]
func (it *It) changedSince(one *Held, held Hold) []string {
	first := held.Hash
	for _, entry := range recordIn(one.Text) {
		if before := yaml.AsString(entry.Get("hash_before")); before != "" {
			first = before
			break
		}
	}
	read, own, _ := it.commitsFor(one.Name, first)
	if !read {
		return it.changedFiles(first)
	}
	out := map[string]bool{}
	for _, sha := range own {
		if said := it.Git.Run("show", "--format=", "--name-only", sha); said.OK {
			for _, row := range strings.Split(said.Out, "\n") {
				if row = strings.TrimSpace(row); row != "" {
					out[row] = true
				}
			}
		}
	}
	if held.Hash == "" || it.tipOf() == held.Hash {
		for _, path := range it.treeFiles() {
			out[path] = true
		}
	}
	return sortedKeys(out)
}

// A deleted file runs no test, and an untracked folder names each file under it. [[spec/design_output/pull#the-test-verb]]
func (it *It) treeFiles() []string {
	out := []string{}
	for _, row := range strings.Split(it.Git.Run("status", "--porcelain", "-uall").Out, "\n") {
		if strings.TrimSpace(row) == "" {
			continue
		}
		if status := statusAt.FindStringSubmatch(row); status != nil && strings.Contains(status[1], "D") {
			continue
		}
		out = append(out, changedIn(row))
	}
	return out
}

// The path a porcelain row names, past the arrow of a rename. [[spec/design_output/pull#the-test-verb]]
func changedIn(row string) string {
	path := strings.TrimSpace(row)
	if found := porcelainAt.FindStringSubmatch(row); found != nil {
		path = strings.TrimSpace(found[1])
	}
	moved := strings.Split(path, " -> ")
	return strings.TrimSuffix(strings.TrimPrefix(moved[len(moved)-1], `"`), `"`)
}

// A porcelain row's status letters, and the path after them. [[spec/design_output/pull#the-test-verb]]
var (
	statusAt    = regexp.MustCompile(`^\s*(\S{1,2})\s`)
	porcelainAt = regexp.MustCompile(`^\s*\S{1,2}\s+(.*)$`)
)

// The files changed since the commit, and the working tree's. [[spec/design_output/pull#the-test-verb]]
func (it *It) changedFiles(since string) []string {
	out := map[string]bool{}
	if since != "" {
		for _, path := range strings.Split(it.Git.Run("diff", "--name-only", "--diff-filter=d", since+"..HEAD").Out, "\n") {
			if path = strings.TrimSpace(path); path != "" {
				out[path] = true
			}
		}
	}
	for _, path := range it.treeFiles() {
		out[path] = true
	}
	return sortedKeys(out)
}

func sortedKeys(said map[string]bool) []string {
	return slices.Sorted(maps.Keys(said))
}
