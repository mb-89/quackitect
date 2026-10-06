// The commit guards' IO, in the bridge's order after the command rules: the
// private delta, the tested delta, the todo tag on a push, the desk guard and
// the trunk guard. Each reads git through Outside.Git and the tree through disk.
// [[spec/tickets/cage-commit-guards-port]]
package hooks

import (
	"strings"

	"quackitect/src/failure"
	"quackitect/src/modules/hooks/command"
)

// The raw notes the private delta reads. lib/private.js owns them, and the module spells them again. [[spec/tickets/cage-commit-guards-port]]
const (
	rawNotes   = ".se/notes"
	noteSuffix = ".md"
)

// .claude/skills/level0/lib/folders.js owns the runtime folder and runs.js the check's stamp the trunk guard reads, and the module spells them again. [[spec/tickets/cage-commit-guards-port]]
const checkStamp = ".se/.runtime/check.json"

// The first refusal of the commit guards, or nothing. [[spec/tickets/cage-commit-guards-port]]
func (d *Door) commitGuards(line, root string, settings Settings, tree disk) string {
	for _, guard := range []func() string{
		func() string { return d.privateDelta(line, root, settings, tree) },
		func() string { return d.testedDelta(line, root, tree) },
		func() string { return d.todoOnPush(line, root) },
		func() string { return d.deskGuard(line, root, settings) },
		func() string { return d.trunkGuard(line, root, settings, tree) },
	} {
		if said := guard(); said != "" {
			return said
		}
	}
	return ""
}

// The findings the voice refuses over the message a commit carries, read off the command or the file it names. A door with no Voice reads none. [[spec/tickets/cage-commit-guards-port]]
func (d *Door) commitVoice(line, root string, tree disk) []command.Row {
	said, ok := command.CommitIn(line)
	if !ok || d.from.Voice == nil {
		return nil
	}
	message := said.Text
	if said.Form == command.FormFile {
		message = tree.text(said.File)
	}
	text := command.WithoutTrailers(message)
	if strings.TrimSpace(text) == "" {
		return nil
	}
	return command.RefusesIn(d.from.Voice(root, text))
}

// A commit's delta carries no private shape, no name the box answers, and no text out of a raw note. [[spec/design_output/private#both-doors-one-check]]
func (d *Door) privateDelta(line, root string, settings Settings, tree disk) string {
	if _, ok := command.CommitIn(line); !ok {
		return ""
	}
	added := command.AddedIn(d.git(root, "diff", "--cached", "--unified=0"))
	if len(added) == 0 {
		return ""
	}
	box := command.Box{
		User: settings.User, Home: settings.Home,
		Name:  d.git(root, "config", "--get", "user.name"),
		Email: d.git(root, "config", "--get", "user.email"),
	}
	var notes []command.Note
	for _, name := range tree.List(rawNotes) {
		if !strings.HasSuffix(name, noteSuffix) {
			continue
		}
		if text, held := tree.Read(rawNotes + "/" + name); held {
			notes = append(notes, command.Note{Name: rawNotes + "/" + name, Text: text})
		}
	}
	if found := command.PrivateIn(added, box, notes); len(found) > 0 {
		return command.RefusedDelta(found)
	}
	return ""
}

// A change and the test proving it land together, and a merge in progress passes whole. [[spec/design_output/tree#the-rules-over-two-files]]
func (d *Door) testedDelta(line, root string, tree disk) string {
	if _, ok := command.CommitIn(line); !ok {
		return ""
	}
	merging := d.git(root, "rev-parse", "-q", "--verify", "MERGE_HEAD") != ""
	found := command.UntestedIn(d.git(root, "diff", "--cached", "--unified=0"), tree.text, merging, command.HeldTests(tree))
	if len(found) > 0 {
		return command.RefusedTest(found)
	}
	return ""
}

// A push carries no note holding the todo tag. [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
func (d *Door) todoOnPush(line, root string) string {
	if _, pushes := command.TouchesGit(line); !pushes {
		return ""
	}
	var carried []command.Note
	for _, name := range command.NotesIn(d.git(root, "log", "--format=", "--name-only", "HEAD", "--not", "--remotes")) {
		if text := d.git(root, "show", "HEAD:"+name); text != "" {
			carried = append(carried, command.Note{Name: name, Text: text})
		}
	}
	if found := command.TaggedIn(carried); len(found) > 0 {
		return command.RefusedTodo(found)
	}
	return ""
}

// A desk lands nothing on a work branch, and the refusal raises its node through the failure door. The bridge writes the row, since this door decides in its shadow. [[spec/design_output/work#a-desk-works-on-trunk]] [[spec/design_output/failures#the-refusals-move-onto-nodes]]
func (d *Door) deskGuard(line, root string, settings Settings) string {
	commits, pushes := command.TouchesGit(line)
	if !commits && !pushes {
		return ""
	}
	branch := d.git(root, "rev-parse", "--abbrev-ref", "HEAD")
	if settings.Cloud || !strings.HasPrefix(branch, command.WorkBranch) {
		return ""
	}
	how := command.HowPush
	if commits {
		how = command.HowCommit
	}
	said := command.DeskSaid("this " + how + " lands nowhere on " + branch)
	return strings.Join(failure.Raise(failure.Load(failure.Dir{Root: root}), "desk-works-on-trunk", said).Lines(), "\n")
}

// A landing on the trunk takes a green battery and the verb, and a cloud box holding a work branch hands it back. [[spec/design_output/work#a-box-writes-its-branch]]
func (d *Door) trunkGuard(line, root string, settings Settings, tree disk) string {
	commits, pushes := command.TouchesGit(line)
	if !commits && !pushes {
		return ""
	}
	branch := d.git(root, "rev-parse", "--abbrev-ref", "HEAD")
	how := command.LandsOnTrunk(line, branch)
	if how == "" {
		return ""
	}
	if how == command.HowPush {
		stamp, stands := tree.Read(checkStamp)
		sha := ""
		if stands {
			sha = d.git(root, "rev-parse", "HEAD")
		}
		if green, says := command.Battery(stamp, stands, sha); !green {
			return command.RedBattery(says)
		}
	}
	if !settings.Cloud || !strings.HasPrefix(branch, command.WorkBranch) {
		return command.ThroughTheVerb(how)
	}
	return command.HandsItBack(how)
}

// A git read under the root, or nothing where the door reaches no git. [[spec/tickets/cage-commit-guards-port]]
func (d *Door) git(root string, args ...string) string {
	if d.from.Git == nil {
		return ""
	}
	return d.from.Git(root, args...)
}
