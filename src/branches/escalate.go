// The escalation: a hand reaching no answer without a person puts a person
// step into its route before the leaf in hand, lands and pushes it, and the
// pull hands the next leaf.
// [[spec/design_output/pull#a-person-step-goes-in]]
package branches

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"regexp"
	"slices"
	"strconv"
	"strings"

	"quackitect/src/modules/check"
	"quackitect/src/yaml"
)

// The flags escalate reads, the schema a ticket mints under, the undo journal, the key capping person steps, and the words a hand-back answers under. [[spec/design_output/pull#a-person-step-goes-in]]
const (
	optionsFlag  = "--options"
	ticketSchema = "spec/schemas/ticket.schema.yaml"
	undoFolder   = runtimeFolder + "/undo"
	splitsKey    = "work.stepsBeforeSplit"
	refusedWord  = "refused"
	workWord     = "work"
	engineReader = "engine"
	jsonEnd      = ".json"
)

var (
	personStep = regexp.MustCompile(`^person(-\d+)?$`)
	pushNoise  = regexp.MustCompile(`^(?:error: failed to push|hint:|To )`)
)

// Puts a person step before the leaf in hand, lands and pushes it, and hands on. [[spec/design_output/pull#a-person-step-goes-in]]
func escalate(d *Doors, _ string, argv []string) int {
	rest := argv[min(1, len(argv)):]
	options := wordsIn(flagIn(rest, optionsFlag))
	question := askedIn(rest)
	if question == "" {
		d.said(refusedWord, "branch escalate takes the question a person answers, as its words.")
		return codeRefused
	}
	as := flagIn(rest, asFlag)
	hand := d.handOf()
	if as != "" {
		hand += " · " + as
	}
	held := d.holdOf(hand)
	if held == nil || held.Path == "" {
		d.said(refusedWord, "no ticket file stands in your hand, so no leaf takes a person step.", "Run ./RUNME.sh ticket pull to take a leaf, then run this again.")
		return codeRed
	}
	if !d.exists(held.Path) {
		d.said(refusedWord, held.Path+" stands nowhere, so nothing takes a person step.")
		return codeRed
	}
	one := note{Name: held.Ticket, At: held.Path, Text: d.read(held.Path), Private: strings.HasPrefix(held.Path, notesFolder)}
	text, path := d.withPersonStep(one, held.Step, question, options)
	if path == "" {
		d.said(refusedWord, fmt.Sprintf("%s takes no person step, and %s stands as it stood.", held.Step, one.Name))
		return codeRed
	}
	one.Text = text
	branch := d.here()
	if finding := d.landed(one, []string{held.Step + " waits for a person at " + path}); finding != "" {
		d.said(refusedWord, "the hook refuses the commit, so the person step lands not:", finding)
		return codeRed
	}
	d.dropHold(hand)
	if !one.Private {
		if ok, why := d.pushed(branch); !ok {
			d.said(refusedWord, append([]string{path + " stands on this box, and its push reaches no origin."}, why...)...)
			return codeRed
		}
	}
	d.said(workWord, fmt.Sprintf("%s at %s waits for a person at %s.", one.Name, held.Step, path))
	next := []string{"ticket", "pull"}
	if as != "" {
		next = append(next, asFlag, as)
	}
	ran := d.verb(d.Root, next...)
	if ran.Out != "" {
		d.say("%s", ran.Out)
	}
	if ran.Err != "" {
		d.warn("%s", ran.Err)
	}
	return ran.Code
}

// Prints a word and its rows under it, a refusal to the standard error. [[spec/design_output/pull#the-hand-out]]
func (d *Doors) said(head string, rows ...string) {
	out := []string{head}
	for _, row := range rows {
		out = append(out, "  "+row)
	}
	if head == refusedWord {
		d.warn("%s", strings.Join(out, "\n"))
		return
	}
	d.say("%s", strings.Join(out, "\n"))
}

// The question: every word the flags leave. [[spec/design_output/pull#a-person-step-goes-in]]
func askedIn(rest []string) string {
	var out []string
	for at := 0; at < len(rest); at++ {
		one := rest[at]
		if strings.HasPrefix(one, "--") {
			if one == optionsFlag || one == asFlag {
				at++
			}
			continue
		}
		out = append(out, one)
	}
	return strings.TrimSpace(strings.Join(out, " "))
}

// The options a comma list names, or none. [[spec/design_output/pull#a-person-step-goes-in]]
func wordsIn(said string) []string {
	var out []string
	for _, one := range strings.Split(said, ",") {
		if one = strings.TrimSpace(one); one != "" {
			out = append(out, one)
		}
	}
	return out
}

// The ticket with a person step before the leaf, and the step's path, or no path where none goes in. [[spec/design_output/pull#a-person-step-goes-in]]
func (d *Doors) withPersonStep(one note, before, asks string, options []string) (string, string) {
	standing := 0
	for _, step := range walkOf(frontOf(one.Text)) {
		if personStep.MatchString(step.Name) {
			standing++
		}
	}
	if most, _ := strconv.Atoi(d.config(splitsKey)); most > 0 && standing >= most {
		d.warn("%s carries %d person steps already, so split it: hand back --became <ticket>.", one.Name, standing)
		return one.Text, ""
	}
	by := byPerson
	if d.cloud() {
		by = byAnyone
	}
	form := "text"
	if len(options) > 0 {
		form = "choice"
	}
	evidence := yaml.New()
	evidence.Set("name", "answer")
	evidence.Set("form", form)
	evidence.Set("says", "the answer, which the step behind this one reads")
	if len(options) > 0 {
		list := make([]any, 0, len(options))
		for _, option := range options {
			list = append(list, option)
		}
		evidence.Set("options", list)
	}
	step := yaml.New()
	step.Set("name", fmt.Sprintf("person-%d", standing+1))
	step.Set("does", "answers the question the engine asks")
	step.Set("by", by)
	step.Set("to", engineReader)
	step.Set("asks", asks)
	step.Set("evidence", []any{evidence})
	return d.inserted(one, before, step)
}

// The ticket with a step inserted before the one a path names, re-routed, and the new step's path. [[spec/design_output/pull#a-person-step-goes-in]]
func (d *Doors) inserted(one note, before string, step *yaml.Doc) (string, string) {
	steps := cloneValue(frontOf(one.Text).Get("steps"))
	parts := strings.Split(before, "/")
	root := yaml.New()
	root.Set("steps", steps)
	holder := root
	for _, part := range parts[:len(parts)-1] {
		var phase *yaml.Doc
		for _, each := range yaml.AsList(holder.Get("steps")) {
			if held := yaml.AsDoc(each); held != nil && asText(held.Get("name")) == part {
				phase = held
				break
			}
		}
		if phase == nil {
			return one.Text, ""
		}
		phase.Set("steps", yaml.AsList(phase.Get("steps")))
		holder = phase
	}
	list := yaml.AsList(holder.Get("steps"))
	at := slices.IndexFunc(list, func(each any) bool {
		held := yaml.AsDoc(each)
		return held != nil && asText(held.Get("name")) == parts[len(parts)-1]
	})
	if at < 0 {
		return one.Text, ""
	}
	holder.Set("steps", slices.Insert(slices.Clone(list), at, any(step)))
	path := strings.Join(append(slices.Clone(parts[:len(parts)-1]), asText(step.Get("name"))), "/")
	text := one.Text
	if schema := yaml.AsDoc(yaml.Read(d.methodRead(ticketSchema))); schema != nil {
		text = check.ReRouted(one.Text, schema, yaml.AsList(root.Get("steps")), "")
	}
	return withField(withField(text, "step", path), "state", openState), path
}

// A parsed value copied whole, so an insert leaves the read it came off as it stood. [[spec/design_output/pull#a-person-step-goes-in]]
func cloneValue(said any) any {
	switch one := said.(type) {
	case *yaml.Doc:
		out := yaml.New()
		for _, key := range one.Keys() {
			out.Set(key, cloneValue(one.Get(key)))
		}
		return out
	case []any:
		out := make([]any, 0, len(one))
		for _, each := range one {
			out = append(out, cloneValue(each))
		}
		return out
	}
	return said
}

// Lands the ticket with the files the hand's undo journals name since its hold took it, or every staged change past the other hands'. [[spec/design_output/pull#the-refused-commit]]
func (d *Doors) landed(one note, changes []string) string {
	mine, theirs := d.journaled(one.Name)
	if len(mine) == 0 {
		return d.landedAll(one, changes, theirs)
	}
	var paths []string
	for _, path := range append([]string{one.At}, mine...) {
		if !slices.Contains(paths, path) {
			paths = append(paths, path)
		}
	}
	ignored := map[string]bool{}
	for _, path := range d.Repo.Ignored(paths) {
		ignored[path] = true
	}
	var kept []string
	for _, path := range paths {
		if ignored[path] {
			continue
		}
		if d.exists(path) || d.Repo.Tracked(path) {
			kept = append(kept, path)
		}
	}
	var also []string
	for _, path := range kept {
		if path != one.At {
			also = append(also, path)
		}
	}
	return d.landedAlone(one, changes, also...)
}

// A journal's path under the work root, slash-separated. [[spec/design_output/pull#the-refused-commit]]
func (d *Doors) inTree(file string) string {
	if filepath.IsAbs(file) {
		if rel, err := filepath.Rel(d.Root, file); err == nil {
			return filepath.ToSlash(rel)
		}
	}
	return filepath.ToSlash(file)
}

// Lands every change the tree stands with, past the files the other hands' journals name. [[spec/design_output/pull#the-refused-commit]]
func (d *Doors) landedAll(one note, changes, theirs []string) string {
	if !one.Private {
		if fault := d.unmergedFault(); fault != "" {
			return fault
		}
	}
	stood := d.read(one.At)
	_ = d.write(one.At, one.Text)
	if one.Private {
		return ""
	}
	_ = d.Repo.AddAll()
	if len(theirs) > 0 {
		_ = d.Repo.Reset(theirs)
	}
	fault := d.stagedFault(nil)
	if fault == "" {
		fault = d.committed(one.Name+": "+strings.Join(changes, ", "), nil)
	}
	if fault == "" {
		return ""
	}
	_ = d.Repo.Reset(nil)
	_ = d.write(one.At, stood)
	return fault
}

// The files the undo journals name since the hold took the ticket: the ticket's own, and every other ticket's. [[spec/design_output/pull#the-refused-commit]]
func (d *Doors) journaled(name string) ([]string, []string) {
	taken := d.takenOf(name)
	var mine, theirs []string
	for _, row := range d.names(undoFolder) {
		if !strings.HasSuffix(row, jsonEnd) {
			continue
		}
		var entry struct {
			Ticket string `json:"ticket"`
			At     string `json:"at"`
			Landed *bool  `json:"landed"`
			Files  []struct {
				File string `json:"file"`
			} `json:"files"`
		}
		if json.Unmarshal([]byte(d.read(undoFolder+"/"+row)), &entry) != nil || entry.Ticket == "" || entry.At < taken {
			continue
		}
		if entry.Landed != nil && !*entry.Landed {
			continue
		}
		for _, one := range entry.Files {
			if entry.Ticket == name {
				mine = appendNew(mine, d.inTree(one.File))
			} else {
				theirs = appendNew(theirs, d.inTree(one.File))
			}
		}
	}
	var others []string
	for _, one := range theirs {
		if !slices.Contains(mine, one) {
			others = append(others, one)
		}
	}
	return mine, others
}

// When the hold on a ticket took it, or nothing where no hold names it. [[spec/design_output/pull#the-refused-commit]]
func (d *Doors) takenOf(name string) string {
	for _, row := range d.names(holdsFolder) {
		if !strings.HasSuffix(row, jsonEnd) {
			continue
		}
		var held struct {
			Ticket string `json:"ticket"`
			Path   string `json:"path"`
			Taken  string `json:"taken"`
		}
		if json.Unmarshal([]byte(d.read(holdsFolder+"/"+row)), &held) != nil || held.Ticket != name {
			continue
		}
		if held.Path != "" && d.exists(held.Path) && fieldOf(d.read(held.Path), "state") == closedState {
			continue
		}
		return held.Taken
	}
	return ""
}

// Pushes the work branch from a cloud box, one rebase over a moved origin, and answers why it fell short. A desk lands it on this box. [[spec/design_output/pull#the-rejected-push]]
func (d *Doors) pushed(branch string) (bool, []string) {
	if !d.cloud() {
		return true, nil
	}
	ok, moved, why := d.tried(branch)
	if ok || !moved {
		return ok, why
	}
	_ = d.Repo.Fetch(branch)
	if d.Repo.Rebase("origin/"+branch) != nil {
		return false, []string{branch + " moves on origin, and one rebase falls short. Push " + branch + ", then pull again."}
	}
	ok, _, why = d.tried(branch)
	return ok, why
}

// One push, whether origin moved under it, and the push door's own cause. [[spec/design_output/pull#the-rejected-push]]
func (d *Doors) tried(branch string) (bool, bool, []string) {
	ran := d.Repo.Push(branch, false)
	if ran.OK {
		return true, false, nil
	}
	var lines []string
	for _, row := range strings.Split(ran.Err, "\n") {
		if row = strings.TrimSpace(row); row != "" && !pushNoise.MatchString(row) {
			lines = append(lines, row)
		}
	}
	if len(lines) == 0 {
		lines = []string{"it names no cause"}
	}
	return false, ran.Moved, append([]string{"The push door refuses " + branch + ":"}, lines...)
}
