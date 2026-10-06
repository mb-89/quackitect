// The rescue a takeover takes in: a dead box's red commit stands on origin
// under rescue/<group>, and the box taking the hold over merges it, or leaves
// it standing where it conflicts.
// [[spec/design_output/work#a-red-commit-reaches-a-rescue-branch]]
package branches

// The branch a red commit on work/<group> reaches. src/quack spells it again, since the two packages share no module. [[spec/design_output/work#a-red-commit-reaches-a-rescue-branch]]
const rescueBranch = "rescue/"

// Takes the rescue on origin into the branch this box now holds, pushes it, and drops the rescue. A conflict aborts the merge, leaves the rescue standing, and names the command. [[spec/design_output/work#a-red-commit-reaches-a-rescue-branch]]
func (d *Doors) takesRescue(one stand) {
	rescue := rescueBranch + one.Name
	at := "origin/" + rescue
	if !d.quiet("rev-parse", "--verify", "-q", at).OK {
		return
	}
	if !d.quiet("merge-base", "--is-ancestor", at, "HEAD").OK {
		if !d.quiet("merge", "--no-edit", "-m", one.Branch+": takes in "+rescue, at).OK {
			d.quiet("merge", "--abort")
			d.warn("%s conflicts with %s, so it stands on origin. Run git merge %s, resolve it, and land it.", rescue, one.Branch, at)
			return
		}
		if !d.loud("push", "origin", one.Branch).OK {
			d.warn("%s took in %s, and its push came back refused, so the rescue stands on origin.", one.Branch, rescue)
			return
		}
	}
	d.quiet("push", "-q", "origin", "--delete", rescue)
	d.say("%s takes in %s, the work the box before left there.", one.Branch, rescue)
}
