// The doors the branch verbs reach the outside through: git as typed
// operations, every other process through a runner, the disk under the work
// root and the method root, the clock, the env and the log. A test hands in
// FakeRepo, FakeRunner and FakeDisk. [[spec/design_output/doors#the-git-door-carries-writes]]
package branches

import (
	"fmt"
	"io"
	"os" // level0: OutsideInDoors - this file is the branch verbs' door onto the box's env
	"path/filepath"
	"sort"
	"strings"
	"time"

	"quackitect/src/failure"
	"quackitect/src/modules/files"
	"quackitect/src/modules/git"
	"quackitect/src/proc"
)

// .claude/skills/level0/lib/folders.js owns the runtime folder, and the package spells it again. [[spec/design_output/pull#the-hand-and-the-hold]]
const runtimeFolder = ".se/.runtime"

// What a run answers: whether it exits zero, its output and its errors, each trimmed. [[spec/design_output/doors#one-door-per-outside-thing]]
type Said struct {
	OK   bool
	Out  string
	Err  string
	Code int
}

// The doors a branch verb runs behind. Root is the work root git runs in, and Method the root the processes and notes come off. [[spec/design_output/vehicle#the-work-root-inherits]]
type Doors struct {
	Root   string
	Method string
	// Git over the work root. [[spec/design_output/doors#the-git-door-carries-writes]]
	Repo git.Repo
	// Every process past git. [[spec/design_output/doors#the-process-door]]
	Run proc.Runner
	// The disk under the work root, and the one under the method root, which the work root's stands in for where it is nil. [[spec/design_output/vehicle#the-work-root-inherits]]
	Disk    files.Disk
	Methods files.Disk
	Env     map[string]string
	Now     func() time.Time
	Out     io.Writer
	Errs    io.Writer
	// The session log, which takes a level, a kind, the line and its fields. Nil writes nothing. [[spec/design_output/log#which-kind-says-what]]
	Log func(level, kind, said string, more map[string]any)
	// A config key's value off the resolver. [[spec/design_output/config#the-resolver-holds-the-layers]]
	Config func(key string) any
	// The command the verbs run themselves through, ./RUNME.sh under the root. [[spec/tickets/the-verbs-need-no-wrapper]]
	Runme []string
	// The queue as branch list --queue prints it, off the index. [[spec/design_output/pull#the-queue-is-a-score]]
	Queue func() int
	// The last beat on each group, read once a run, and dropped at each fetch. [[spec/design_output/work#a-hold-beats-with-its-session]]
	beats map[string]beat
	// An index value by its name, decoded into the target. [[spec/design_output/work#one-reading-answers-git]]
	Value func(name string, into any) error
	// Every leaf's notes, keyed process:path, off the Go guidance module. [[spec/tickets/the-guidance-topic-lands]]
	Guidance func() (map[string][]string, error)
	// The failure nodes each refusal raises through. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
	Failures failure.Registry
	// The door every GitHub and routine request goes through. Nil sends nothing. [[spec/tickets/branch-done-opens-the-pr]]
	Send Send
}

// Prints what git said on red, as a loud git run does, and answers whether it ran green. [[spec/design_output/doors#a-door-standing-on-another]]
func (d *Doors) loudly(err error) bool {
	if err != nil {
		fmt.Fprintln(d.Errs, strings.TrimSpace(err.Error()))
	}
	return err == nil
}

// Pushes a branch to origin, printing git's refusal. [[spec/design_output/doors#a-door-standing-on-another]]
func (d *Doors) push(branch string) bool {
	pushed := d.Repo.Push(branch, false)
	if !pushed.OK && pushed.Err != "" {
		fmt.Fprintln(d.Errs, strings.TrimSpace(pushed.Err))
	}
	return pushed.OK
}

// Refreshes the refs off origin, pruning the gone ones. [[spec/design_output/work#the-listing-reads-git-once]]
func (d *Doors) fetch() {
	_ = d.Repo.FetchAll()
	d.beats = nil
}

// The branch HEAD stands on. [[spec/design_output/work#a-group-is-a-ticket]]
func (d *Doors) here() string {
	said, _ := d.Repo.Head()
	return said
}

// The commit HEAD stands on. [[spec/design_output/work#the-take-writes-the-record]]
func (d *Doors) head() string { return d.rev("HEAD") }

// The commit a ref names, or nothing. [[spec/design_output/work#the-take-writes-the-record]]
func (d *Doors) rev(ref string) string {
	said, _ := d.Repo.Resolve(ref)
	return said
}

// How many commits one ref stands ahead of another, or -1 where either stands nowhere. [[spec/design_output/work#trunk-comes-in-first]]
func (d *Doors) ahead(from, to string) int {
	count, ok := d.Repo.Count(from, to)
	if !ok {
		return -1
	}
	return count
}

// Runs a program in a folder, with the env past the box's own, and answers it trimmed. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) run(dir string, env []string, stdin string, argv ...string) Said {
	said := d.rawEnv(dir, env, stdin, argv...)
	said.Out = strings.TrimSpace(said.Out)
	said.Err = strings.TrimSpace(said.Err)
	return said
}

// Runs a program with the env past the box's own, its output as it comes. [[spec/design_output/doors#a-raw-run-keeps-bytes]]
func (d *Doors) rawEnv(dir string, env []string, stdin string, argv ...string) Said {
	said := d.Run(proc.Command{Argv: argv, Dir: dir, Env: append(d.environ(), env...), Stdin: stdin})
	return Said{OK: said.Code == 0, Out: said.Out, Err: said.Err, Code: said.Code}
}

// The pairs the doors' env lays over the box's own, in name order. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) environ() []string {
	out := []string{}
	for key, value := range d.Env {
		out = append(out, key+"="+value)
	}
	sort.Strings(out)
	return out
}

// A path under the work root as a whole path, for a process run in it. [[spec/design_output/vehicle#the-work-root-inherits]]
func (d *Doors) at(rel string) string { return filepath.Join(d.Root, filepath.FromSlash(rel)) }

// Whether a file or a folder stands under the work root. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) exists(rel string) bool {
	if _, ok, _ := d.Disk.Read(rel); ok {
		return true
	}
	under, _ := d.Disk.List(rel)
	return len(under) > 0
}

// A file under the work root, or nothing where none stands. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) read(rel string) string {
	said, _, _ := d.Disk.Read(rel)
	return said
}

// Writes a file under the work root, its folder made first. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) write(rel, text string) error { return d.Disk.Write(rel, text) }

// Removes a path under the work root, a folder whole. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) remove(rel string) {
	under, _ := d.Disk.List(rel)
	for _, one := range under {
		_ = d.Disk.Remove(one)
	}
	_ = d.Disk.Remove(rel)
}

// The value of a box variable, the doors' env over the process's own. [[spec/design_output/pull#the-hand-rule]]
func (d *Doors) env(key string) string {
	if said, ok := d.Env[key]; ok {
		return said
	}
	return os.Getenv(key)
}

// The clock's now, or the zero time where the doors carry none. [[spec/design_output/work#a-stale-group-is-yours]]
func (d *Doors) now() time.Time {
	if d.Now == nil {
		return time.Time{}
	}
	return d.Now()
}

// A config key's value as text, or nothing where the resolver answers none. [[spec/design_output/config#the-resolver-holds-the-layers]]
func (d *Doors) config(key string) string {
	if d.Config == nil {
		return ""
	}
	said := d.Config(key)
	if said == nil {
		return ""
	}
	return fmt.Sprint(said)
}

// Prints a line to the standard output. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) say(format string, args ...any) { fmt.Fprintf(d.Out, format+"\n", args...) }

// Prints a line to the standard error. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) warn(format string, args ...any) { fmt.Fprintf(d.Errs, format+"\n", args...) }

// A refusal through the failure door: the message the site builds, its detail rows, the id and each remedy, and the row the log takes. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
func (d *Doors) raises(raised failure.Raised) {
	for _, line := range raised.Lines() {
		fmt.Fprintln(d.Errs, line)
	}
	if d.Log != nil {
		said, _ := raised.Row("")["said"].(string)
		d.Log(raised.Level, failure.RowKind, said, map[string]any{failure.IDField: raised.ID})
	}
}

// Runs one of the tree's own verbs under the root, as a person types it. [[spec/tickets/the-verbs-need-no-wrapper]]
func (d *Doors) verb(dir string, words ...string) Said {
	runme := d.Runme
	if len(runme) == 0 {
		runme = []string{"sh", "RUNME.sh"}
	}
	return d.run(dir, nil, "", append(append([]string{}, runme...), words...)...)
}

// A file under the method root, which the work root stands in for where no disk of its own is named. [[spec/design_output/vehicle#the-work-root-inherits]]
func (d *Doors) methodRead(rel string) string {
	disk := d.Methods
	if disk == nil {
		disk = d.Disk
	}
	said, _, _ := disk.Read(rel)
	return said
}

// The names of the files standing in a folder under the work root, in name order. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) names(folder string) []string {
	under, _ := d.Disk.List(folder)
	var out []string
	for _, one := range under {
		if name := strings.TrimPrefix(one, folder+"/"); !strings.Contains(name, "/") {
			out = append(out, name)
		}
	}
	return out
}

// Every file under a folder of the work root, as slash paths from the root, in name order. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) filesUnder(folder string) []string {
	under, _ := d.Disk.List(folder)
	if len(under) == 0 {
		return nil
	}
	return under
}

// Links a path under the work root at another, and answers whether it stands. [[spec/design_output/review#a-worktree-runs-the-check]]
func (d *Doors) link(rel, to string) bool { return d.Disk.Link(rel, to) == nil }

// Removes the link at a path, leaving what it names standing. [[spec/design_output/review#a-worktree-runs-the-check]]
func (d *Doors) unlink(at string) { _ = d.Disk.Remove(at) }
