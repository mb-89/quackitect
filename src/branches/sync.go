// The sync: a work branch takes trunk in, and another hand's push on it, and a
// ticket whose front alone conflicts merges key by key, as sync, settles and
// src/engine/front-merge.js answer it.
// [[spec/design_output/work#trunk-comes-in-first]]
package branches

import (
	"encoding/json"
	"regexp"
	"slices"
	"sort"
	"strconv"
	"strings"

	"quackitect/src/yaml"
)

// The stages git lists an unmerged path at. [[spec/design_output/work#no-commit-carries-a-marker]]
const (
	stageBase   = 1
	stageOurs   = 2
	stageTheirs = 3
	recordKey   = "record"
)

var (
	unmergedRow = regexp.MustCompile(`^\d+ [0-9a-f]+ ([123])\t(.+)$`)
	markOpens   = regexp.MustCompile(`^<{7}(?: |$)`)
	markParts   = regexp.MustCompile(`^(?:={7}|\|{7}(?: .*)?)$`)
	markShuts   = regexp.MustCompile(`^>{7}(?: |$)`)
	topKey      = regexp.MustCompile(`^([^\s#\-][^:]*):(?:\s|$)`)
)

// Takes trunk into the branch HEAD stands on, and the remote's own commits first on a work branch. [[spec/design_output/work#trunk-comes-in-first]]
func (d *Doors) sync() int {
	branch := d.here()
	if branch != trunk && !strings.HasPrefix(branch, workBranch) {
		d.warn("branch sync runs on %s or a work branch, and this is %s.", trunk, branch)
		return codeRefused
	}
	if branch != trunk {
		if own := d.ownIn(branch); own != codeOK {
			return own
		}
	}
	from := trunk
	if branch == trunk {
		from = "origin/" + trunk
	}
	d.quiet("fetch", "origin", trunk)
	behind := d.quiet("rev-list", "--count", "HEAD..origin/"+trunk).Out
	if behind == "0" {
		d.say("%s already carries every commit on %s.", branch, trunk)
		return codeOK
	}
	message := branch + ": take " + from + " in"
	if !d.loud("merge", "origin/"+trunk, "--no-edit", "-m", message).OK {
		return d.settles(branch, from, behind, message)
	}
	d.say("%s took %s commit(s) from %s.", branch, behind, from)
	return codeOK
}

// Another hand's push onto the branch comes in by a plain merge, so both sides' commits stand. [[spec/design_output/work#trunk-comes-in-first]]
func (d *Doors) ownIn(branch string) int {
	from := "origin/" + branch
	d.quiet("fetch", "origin", branch)
	behind := d.quiet("rev-list", "--count", "HEAD.."+from).Out
	if behind == "" || behind == "0" {
		return codeOK
	}
	message := branch + ": take " + from + " in"
	if !d.loud("merge", from, "--no-edit", "-m", message).OK {
		return d.settles(branch, from, behind, message)
	}
	d.say("%s took %s commit(s) from %s.", branch, behind, from)
	return codeOK
}

// Each path git lists unmerged, with the stages it holds. [[spec/design_output/work#no-commit-carries-a-marker]]
func (d *Doors) unmerged() (map[string]map[int]bool, []string) {
	out := map[string]map[int]bool{}
	var order []string
	for _, row := range strings.Split(d.quiet("ls-files", "-u").Out, "\n") {
		found := unmergedRow.FindStringSubmatch(strings.TrimSpace(row))
		if found == nil {
			continue
		}
		if out[found[2]] == nil {
			out[found[2]] = map[int]bool{}
			order = append(order, found[2])
		}
		stage, _ := strconv.Atoi(found[1])
		out[found[2]][stage] = true
	}
	return out, order
}

// A conflict whose ticket fronts alone clash merges here, and commits once nothing stays for a hand. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func (d *Doors) settles(branch, from, behind, message string) int {
	stages, order := d.unmerged()
	if len(order) == 0 {
		d.warn("%s conflicts with %s. Resolve it, commit, and go on.", from, branch)
		d.warn("git status names the files. The merge belongs to you here.")
		return codeRed
	}
	var took, left, retired []string
	for _, path := range order {
		held := stages[path]
		switch {
		case !held[stageTheirs] && held[stageOurs] && strings.HasPrefix(path, ticketsFolder+"/"):
			retired = append(retired, path)
		case d.frontSettles(path, held):
			took = append(took, path)
		default:
			left = append(left, path)
		}
	}
	if len(left) == 0 && len(retired) == 0 {
		made := d.quiet("commit", "-m", message)
		if made.OK {
			d.say("%s took %s commit(s) from %s.", branch, behind, from)
			d.say("The front of %s merges on its own.", strings.Join(took, ", "))
			return codeOK
		}
		said := made.Err
		if said == "" {
			said = made.Out
		}
		d.warn("The merge commit comes back refused: %s", said)
		return codeRed
	}
	d.warn("%s conflicts with %s, and the merge stands open.", from, branch)
	if len(took) > 0 {
		d.warn("The front of %s merges on its own, and stands staged.", strings.Join(took, ", "))
	}
	if len(left) > 0 {
		d.warn("These wait for a hand:")
	}
	for _, path := range left {
		d.warn("  %s", path)
	}
	for _, path := range retired {
		d.warn("  %s: %s retires this ticket, and %s changes it. Keep the change or let it go.", path, from, branch)
	}
	d.warn("The write door lets a hand write each file until the merge commits. Write each one without its conflict markers, then land the merge with ./RUNME.sh commit.")
	return codeRed
}

// Both sides' front, merged key by key over the base, written and staged. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func (d *Doors) frontSettles(path string, held map[int]bool) bool {
	if !strings.HasPrefix(path, ticketsFolder+"/") || !held[stageOurs] || !held[stageTheirs] {
		return false
	}
	side := func(stage int) string {
		if !held[stage] {
			return ""
		}
		return d.textAt(":"+strconv.Itoa(stage), path)
	}
	text, ok := mergedFront(side(stageBase), side(stageOurs), side(stageTheirs))
	if !ok || text == "" || len(markersIn(text)) > 0 {
		return false
	}
	_ = d.write(path, text)
	return d.quiet("add", "--", path).OK
}

// The lines a conflict marks: an opener alone, and a split or a closer past an opener. [[spec/design_output/work#no-commit-carries-a-marker]]
func markersIn(text string) []int {
	var out []int
	open := false
	for at, line := range splitRows(text) {
		switch {
		case markOpens.MatchString(line):
			open = true
		case !open || !(markParts.MatchString(line) || markShuts.MatchString(line)):
			continue
		}
		if markShuts.MatchString(line) {
			open = false
		}
		out = append(out, at+1)
	}
	return out
}

// A front key's rows and value, and the record's entries where the key is the record. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
type frontBlock struct {
	Value   string
	Rows    []string
	Header  []string
	Entries []frontBlock
	List    bool
}

// A note cut at its keys: the order, each key's block, the rows before the first key, and the text from the closing fence on. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
type frontParts struct {
	Order  []string
	Blocks map[string]frontBlock
	Head   []string
	Body   string
}

// The merged note, or false where a key both sides change apart stays for a hand. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func mergedFront(base, ours, theirs string) (string, bool) {
	was := &frontParts{Blocks: map[string]frontBlock{}}
	if base != "" {
		was = partsOf(base)
	}
	mine, trunkSide := partsOf(ours), partsOf(theirs)
	if was == nil || mine == nil || trunkSide == nil {
		return "", false
	}
	body, ok := picked(was.Body, mine.Body, trunkSide.Body)
	if !ok {
		return "", false
	}
	rows := slices.Clone(mine.Head)
	for _, key := range orderOf(mine.Order, trunkSide.Order) {
		b, bOK := was.Blocks[key]
		o, oOK := mine.Blocks[key]
		t, tOK := trunkSide.Blocks[key]
		took, ok := keyMerged(key, blockAt(b, bOK), blockAt(o, oOK), blockAt(t, tOK))
		if !ok {
			return "", false
		}
		rows = append(rows, took...)
	}
	return strings.Join(append(rows, body), "\n"), true
}

// A block where it stands, or nil. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func blockAt(one frontBlock, ok bool) *frontBlock {
	if !ok {
		return nil
	}
	return &one
}

// A side changing a key alone takes it, and the record joins what both append. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func keyMerged(key string, b, o, t *frontBlock) ([]string, bool) {
	switch {
	case sameBlock(o, t):
		return rowsOf(o), true
	case sameBlock(o, b):
		return rowsOf(t), true
	case sameBlock(t, b):
		return rowsOf(o), true
	case key == recordKey:
		return recordMerged(b, o, t)
	}
	return nil, false
}

// A block's rows, or none where it stands nowhere. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func rowsOf(one *frontBlock) []string {
	if one == nil {
		return nil
	}
	return one.Rows
}

// The base's entries, then the branch's, then trunk's, so each side's order holds. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func recordMerged(b, o, t *frontBlock) ([]string, bool) {
	var was []frontBlock
	if b != nil {
		was = b.Entries
	}
	if o == nil || t == nil || !o.List || !t.List {
		return nil, false
	}
	kept := func(side *frontBlock) bool {
		for at, one := range was {
			if at >= len(side.Entries) || one.Value != side.Entries[at].Value {
				return false
			}
		}
		return true
	}
	if !kept(o) || !kept(t) {
		return nil, false
	}
	out := slices.Clone(o.Header)
	for _, one := range o.Entries {
		out = append(out, one.Rows...)
	}
	for _, one := range t.Entries[len(was):] {
		out = append(out, one.Rows...)
	}
	return out, true
}

// The side that moved, or false where both moved apart. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func picked(was, mine, theirs string) (string, bool) {
	switch {
	case mine == theirs || theirs == was:
		return mine, true
	case mine == was:
		return theirs, true
	}
	return "", false
}

// Whether two blocks hold the same value, two absent ones among them. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func sameBlock(a, b *frontBlock) bool {
	if a == nil || b == nil {
		return a == nil && b == nil
	}
	return a.Value == b.Value
}

// The branch's order, with each key trunk alone holds after the key it follows there. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func orderOf(mine, theirs []string) []string {
	out := slices.Clone(mine)
	for at, key := range theirs {
		if slices.Contains(out, key) {
			continue
		}
		place := 0
		for back := at - 1; back >= 0; back-- {
			if i := slices.Index(out, theirs[back]); i >= 0 {
				place = i + 1
				break
			}
		}
		out = slices.Insert(out, place, key)
	}
	return out
}

// The note cut at its top keys, or nil where it carries no front. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func partsOf(text string) *frontParts {
	rows := strings.Split(text, "\n")
	if strings.TrimSpace(rows[0]) != frontFence {
		return nil
	}
	close := -1
	for at := 1; at < len(rows); at++ {
		if strings.TrimSpace(rows[at]) == frontFence {
			close = at
			break
		}
	}
	if close < 0 {
		return nil
	}
	var starts []int
	var order []string
	for at := 1; at < close; at++ {
		if found := topKey.FindStringSubmatch(rows[at]); found != nil && !slices.Contains(order, strings.TrimSpace(found[1])) {
			starts = append(starts, at)
			order = append(order, strings.TrimSpace(found[1]))
		}
	}
	out := &frontParts{Order: order, Blocks: map[string]frontBlock{}, Head: rows[:close], Body: strings.Join(rows[close:], "\n")}
	if len(starts) > 0 {
		out.Head = rows[:starts[0]]
	}
	for at, key := range order {
		to := close
		if at+1 < len(starts) {
			to = starts[at+1]
		}
		block := rows[starts[at]:to]
		one := frontBlock{Value: valueOf(block), Rows: block}
		if key == recordKey {
			one.Header, one.Entries, one.List = entriesAt(block)
		}
		out.Blocks[key] = one
	}
	return out
}

// A block's value as one canonical text, so two spellings of one value read the same. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func valueOf(block []string) string {
	said, _ := json.Marshal(canonical(yaml.Read(strings.Join(block, "\n"))))
	return string(said)
}

// A parsed value with each map's keys in order, so its text compares. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func canonical(said any) any {
	switch one := said.(type) {
	case *yaml.Doc:
		keys := one.Keys()
		sort.Strings(keys)
		out := make([][2]any, 0, len(keys))
		for _, key := range keys {
			out = append(out, [2]any{key, canonical(one.Get(key))})
		}
		return out
	case []any:
		out := make([]any, 0, len(one))
		for _, each := range one {
			out = append(out, canonical(each))
		}
		return out
	}
	return said
}

// The record block cut into its header and its items, and whether it holds a list. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func entriesAt(block []string) ([]string, []frontBlock, bool) {
	indent := -1
	var starts []int
	for at := 1; at < len(block); at++ {
		trimmed := strings.TrimLeft(block[at], " ")
		if !strings.HasPrefix(trimmed, "- ") && trimmed != "-" {
			continue
		}
		pad := len(block[at]) - len(trimmed)
		if indent < 0 {
			indent = pad
		}
		if pad == indent {
			starts = append(starts, at)
		}
	}
	if len(starts) == 0 {
		return block, nil, isList(block)
	}
	var entries []frontBlock
	for at, from := range starts {
		to := len(block)
		if at+1 < len(starts) {
			to = starts[at+1]
		}
		rows := block[from:to]
		entries = append(entries, frontBlock{Value: itemValue(rows), Rows: rows})
	}
	return block[:starts[0]], entries, true
}

// Whether a record block holds a list, an empty flow list among them. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func isList(block []string) bool {
	doc := yaml.AsDoc(yaml.Read(strings.Join(block, "\n")))
	if doc == nil {
		return false
	}
	_, list := doc.Get(recordKey).([]any)
	return list
}

// One record item's value, read off its rows. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func itemValue(rows []string) string {
	said, _ := json.Marshal(canonical(yaml.Read("item:\n" + strings.Join(rows, "\n"))))
	return string(said)
}
