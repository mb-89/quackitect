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
	if _, ok := d.Repo.Resolve(at); !ok {
		return
	}
	if !d.Repo.IsAncestor(at, "HEAD") {
		if _, err := d.Repo.Merge(at, one.Branch+": takes in "+rescue, false); err != nil {
			_ = d.Repo.ResetTo("HEAD", true)
			d.warn("%s conflicts with %s, so it stands on origin. Run git merge %s, resolve it, and land it.", rescue, one.Branch, at)
			return
		}
		if pushed := d.Repo.Push(one.Branch, false); !pushed.OK {
			d.warn("%s took in %s, and its push came back refused, so the rescue stands on origin.", one.Branch, rescue)
			return
		}
	}
	_ = d.Repo.DeleteRemote(rescue)
	d.say("%s takes in %s, the work the box before left there.", one.Branch, rescue)
}
