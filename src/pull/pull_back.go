// The hand back: a verdict the agent hands in, the refusals it meets, and
// the signs a person step takes, off src/scripts/pull.js.
// [[spec/design_output/pull#the-hand-back]]
package pull

import (
	"fmt"
	"strings"

	"quackitect/src/failure"
	"quackitect/src/modules/check"
	"quackitect/src/yaml"
)

// [[spec/design_output/pull#the-hand-back]]
func (it *It) handBack(who *Who, name string, said verdict) int {
	held := who.Held
	if held == nil {
		it.Refuse(failure.Raise(it.Failures, "pull-hand-empty", fmt.Sprintf("nothing stands in your hand. Call %s to take a leaf.", CallOf("ticket", "pull"))))
		return 1
	}
	if name != "" && name != held.Ticket {
		it.Refuse(failure.Raise(it.Failures, "pull-hand-other-ticket", fmt.Sprintf("%s stands in your hand, and %s is another ticket.", held.Ticket, name)))
		return 1
	}
	if !strings.HasPrefix(held.Path, Notes) && !it.fetched(who.Branch) {
		return 1
	}
	text, ok := it.Disk.Read(held.Path)
	if !ok {
		it.Refuse(failure.Raise(it.Failures, "pull-hold-path-gone", held.Path+" stands nowhere, so nothing hands back."))
		it.dropHold(who.Hand)
		return 1
	}
	one := &Held{Name: held.Ticket, Path: held.Path, Text: text, Front: FrontOf(text), Private: strings.HasPrefix(held.Path, Notes)}
	// The record holds this hand-back already, so the pull pushes it again. [[spec/design_output/pull#the-rejected-push]]
	for _, entry := range recordIn(one.Text) {
		if yaml.AsString(entry.Get("step")) == held.Step && !truthy(yaml.AsString(entry.Get("skipped"))) && yaml.AsString(entry.Get("hash_after")) != "" && yaml.AsString(entry.Get("hash_before")) == held.Hash {
			ok, why := it.sentOut(one, who.Branch)
			if !ok {
				it.Refuse(failure.Raise(it.Failures, "pull-push-refused", append([]string{fmt.Sprintf("%s at %s answered, and the record holds this hand-back already. Its push reaches no origin.", held.Ticket, held.Step)}, why...)...))
				return 1
			}
			return it.onward(who, append([]string{fmt.Sprintf("%s at %s answered already, and the record holds it.", held.Ticket, held.Step)}, why...))
		}
	}
	step := FieldOf(one.Text, "step")
	if step == "" {
		if leaves := LeavesOf(one.Front); len(leaves) > 0 {
			step = leaves[0].Path
		}
	}
	if step != held.Step {
		it.dropHold(who.Hand)
		shown := FieldOf(one.Text, "step")
		if shown == "" {
			shown = "no step"
		}
		it.Refuse(failure.Raise(it.Failures, "pull-hold-stale", fmt.Sprintf("%s stands at %s now, and the hold names %s.", held.Ticket, shown, held.Step), "The take is stale, so the hold drops. Pull again."))
		return 1
	}
	if held.Hash != "" && !it.Git.IsAncestor(held.Hash, "HEAD") {
		it.dropHold(who.Hand)
		it.Refuse(failure.Raise(it.Failures, "pull-hold-stale", fmt.Sprintf("the take hash %s trails %s, so the hold drops. Pull again.", held.Hash[:min(shortSha, len(held.Hash))], who.Branch)))
		return 1
	}
	leaf := LeafOf(one.Front, held.Step)
	if leaf == nil {
		it.Refuse(failure.Raise(it.Failures, "pull-leaf-unknown", fmt.Sprintf("%s names no leaf of %s.", held.Step, held.Ticket)))
		return 1
	}
	verdictField := leaf.holdsForm("verdict")
	// A bare name on a leaf the verdict field decides nowhere shows the leaf, and lands nothing. [[spec/design_output/pull#bare-pulls-show-the-leaf]]
	if said.said == "" && verdictField == nil {
		it.Println(it.workAnswer(one, leaf))
		return 0
	}
	// A payload rides the hold until the checks pass, so a refused word reaches no disk. [[spec/design_output/pull#the-fields-ride-the-payload]]
	payload := flagValue(it.Argv, "--fields")
	if payload == "" {
		payload = held.Payload
	}
	if payload != "" {
		put, why := withPayload(one.Text, held.Step, payload)
		if why != "" {
			it.Refuse(failure.Raise(it.Failures, "pull-fields-refused", why))
			return 1
		}
		one.Stood, one.Payload = one.Text, payload
		one.Text = blessKept(put)
		one.Front = FrontOf(one.Text)
	}
	if verdictField != nil && said.said != "" {
		it.Refuse(failure.Raise(it.Failures, "pull-verdict-field-decides", fmt.Sprintf("%s holds the verdict field %s, so the field decides and the flag stays off.", leaf.Path, fieldWord(verdictField, "name"))))
		return 1
	}
	// [[spec/design_output/pull#the-checks]]
	faults := []string{}
	if schema := it.ticketSchema(); schema != nil {
		for _, fault := range check.CheckNote(one.Text, schema, held.Path) {
			faults = append(faults, fmt.Sprintf("%s:%d %s", held.Path, fault.Line, fault.Message))
		}
	}
	chapter := ChapterOf(one.Text, leaf.Path)
	// A became leaves the leaf's fields to the successor, and an answered to the answerer, so the hold and the hand alone decide. [[spec/design_output/pull#became]]
	becomes := said.said == "became" || said.said == "answered"
	warned := []string{}
	if !becomes {
		faults = append(faults, it.formFaults(one, leaf, chapter, *held)...)
		if len(faults) == 0 {
			faults = append(faults, it.voiceFaults(one, leaf, &warned)...)
		}
	}
	// A fail runs its commands for the record, and none of them refuses it. [[spec/design_output/pull#the-fail]]
	fails := said.said == "fail"
	sink := &faults
	if fails {
		sink = &[]string{}
	}
	answered := []Answered{}
	if len(faults) == 0 && !becomes {
		answered = it.commandsRun(leaf.Path, leaf.Evidence, chapter, sink)
	}
	// A final gate runs every command field of the leaves before it, and the record keeps each answer. [[spec/design_output/pull#the-final-acceptance]]
	if leaf.Final && !becomes && len(faults) == 0 {
		answered = append(answered, it.routeRun(one, leaf, sink)...)
	}
	faults = append(faults, it.handFaults(one, leaf, who.Hand, *held)...)
	if len(faults) > 0 {
		return it.refused(who, one, leaf, *held, faults)
	}
	it.warnsOf(warned)
	decided := Verdict{Said: said.said, Reason: said.reason}
	if decided.Said == "" {
		decided.Said = "pass"
	}
	if verdictField != nil {
		decided = VerdictIn(chapter.Fields[fieldWord(verdictField, "name")])
	}
	switch {
	case decided.Said == "became":
		return it.became(who, one, leaf, *held, decided.Reason, answered, more{})
	case decided.Said == "answered":
		return it.answeredBy(who, one, leaf, *held, decided.Reason, answered)
	case decided.Said == "fail" && leaf.Gate != "":
		return it.rejected(who, one, leaf, *held, decided.Reason, answered)
	case decided.Said == "fail":
		return it.failed(who, one, leaf, *held, decided.Reason, answered)
	case decided.Findings != nil:
		return it.minted(who, one, leaf, *held, decided.Findings, answered)
	}
	return it.passed(who, one, leaf, *held, answered, more{stays: asksBless(leaf)})
}

// A refused hand-back keeps the hold and counts the refusal, and the cap sends the leaf back with the findings. [[spec/design_output/pull#the-hand-back-refused]]
func (it *It) refused(who *Who, one *Held, leaf *Leaf, held Hold, faults []string) int {
	count := held.Refused + 1
	if it.Refusals > 0 && count >= it.Refusals {
		if one.Stood != "" {
			one.Text = one.Stood
		}
		it.Refuse(failure.Raise(it.Failures, "pull-refusals-in-a-row", append(append([]string{}, faults...), "", fmt.Sprintf("%d refusals in a row, so %s goes back.", count, leaf.Path))...))
		return it.failed(who, one, leaf, held, fmt.Sprintf("the hand-back met refused %d times: %s", count, faults[0]), nil)
	}
	held.Refused = count
	if one.Payload != "" {
		held.Payload = one.Payload
	}
	it.writeHold(who.Hand, held)
	it.Refuse(failure.Raise(it.Failures, "pull-evidence-refused", append(append([]string{}, faults...), "", fmt.Sprintf("Fix it, and %s stays in hand at %s.", one.Name, leaf.Path))...))
	return 1
}

// What signs a good signature, and one git trusts no key for. [[spec/design_output/pull#the-hand-rule]]
var signed = []string{"G", "U"}

// [[spec/design_output/pull#the-hand-rule]]
func (it *It) handFaults(one *Held, leaf *Leaf, hand string, held Hold) []string {
	out := []string{}
	if writes, _, person := writesHere(leaf, it.handRule(one.Front, nil, "", false)); !writes && person {
		out = append(out, leaf.Path+" is a person's step, and this hand is an agent.")
	}
	if it.PersonSigns && !one.Private && RoleOf(hand) == Person {
		tip := it.tipOf()
		said := it.Git.Signature("HEAD")
		if !contains(signed, said) {
			if said == "" {
				said = "no signature"
			}
			out = append(out, fmt.Sprintf("a person's hand-back meets a signed tip, and %s answers %s.", tip[:min(shortSha, len(tip))], said))
		}
	}
	if other := excludes(one.Front, leaf, hand); other != "" {
		out = append(out, leaf.Path+" "+other+".")
	}
	// A gate's reviewer fixes within its own diff, as its own commit, so the guard stands down there. [[spec/design_output/pull#the-gate]]
	if leaf.holdsForm("verdict") != nil && !one.Private && leaf.Gate == "" {
		tip := it.tipOf()
		if held.Hash != "" && tip != held.Hash {
			if read, own, _ := it.commitsFor(one.Name, held.Hash); !read || len(own) > 0 {
				out = append(out, fmt.Sprintf("a verdict comes from a hand that leaves the tip where it stands, and %s moved to %s.", held.Hash[:min(shortSha, len(held.Hash))], tip[:min(shortSha, len(tip))]))
			}
		}
	}
	return out
}
