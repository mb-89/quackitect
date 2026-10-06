// The doors the branch verbs reach the outside through: git and every other
// process run in the work root, the disk, the clock, the env and the log.
// Each verb reads the box through these alone, so a test hands in a tree.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"      // level0: OutsideInDoors - this file is the branch verbs' door onto the disk
	"os/exec" // level0: OutsideInDoors - this file is the branch verbs' door onto git and every process
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// The asks one cat-file --batch carries, as BATCH_ASKS in src/doors/git.js names it. [[spec/design_output/work#the-listing-reads-git-once]]
const batchAsks = 400

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
	Env    map[string]string
	Now    func() time.Time
	Out    io.Writer
	Errs   io.Writer
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
}

// Runs git in the work root. A loud run prints what git says on red, as the git door does. [[spec/design_output/doors#a-door-standing-on-another]]
func (d *Doors) git(quiet bool, args ...string) Said {
	said := d.run(d.Root, nil, "", append([]string{"git"}, args...)...)
	if !quiet && !said.OK && said.Err != "" {
		fmt.Fprintln(d.Errs, said.Err)
	}
	return said
}

// A quiet git run, which prints nothing on red. [[spec/design_output/doors#a-door-standing-on-another]]
func (d *Doors) quiet(args ...string) Said { return d.git(true, args...) }

// A loud git run. [[spec/design_output/doors#a-door-standing-on-another]]
func (d *Doors) loud(args ...string) Said { return d.git(false, args...) }

// Refreshes the refs off origin, pruning the gone ones. [[spec/design_output/work#the-listing-reads-git-once]]
func (d *Doors) fetch() {
	d.quiet("fetch", "--prune", "origin", "+refs/heads/*:refs/remotes/origin/*", "+"+beatRefs+"*:"+beatRefs+"*")
	d.beats = nil
}

// The branch HEAD stands on. [[spec/design_output/work#a-group-is-a-ticket]]
func (d *Doors) here() string { return d.quiet("rev-parse", "--abbrev-ref", "HEAD").Out }

// The commit HEAD stands on. [[spec/design_output/work#the-take-writes-the-record]]
func (d *Doors) head() string { return d.quiet("rev-parse", "HEAD").Out }

// Every ask answered off cat-file --batch, the raw stream whole, or nothing on red. [[spec/design_output/work#the-listing-reads-git-once]]
func (d *Doors) batch(asks []string) string {
	var out strings.Builder
	for at := 0; at < len(asks); at += batchAsks {
		to := min(at+batchAsks, len(asks))
		said := d.raw(d.Root, strings.Join(asks[at:to], "\n")+"\n", "git", "cat-file", "--batch")
		if !said.OK {
			return ""
		}
		out.WriteString(said.Out)
	}
	return out.String()
}

// Runs a program in a folder, with the env past the box's own, and answers it trimmed. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) run(dir string, env []string, stdin string, argv ...string) Said {
	said := d.rawEnv(dir, env, stdin, argv...)
	said.Out = strings.TrimSpace(said.Out)
	said.Err = strings.TrimSpace(said.Err)
	return said
}

// Runs a program and answers its output as it comes, bytes and all. [[spec/design_output/doors#a-raw-run-keeps-bytes]]
func (d *Doors) raw(dir, stdin string, argv ...string) Said {
	return d.rawEnv(dir, nil, stdin, argv...)
}

// Runs a program with the env past the box's own. [[spec/design_output/doors#a-raw-run-keeps-bytes]]
func (d *Doors) rawEnv(dir string, env []string, stdin string, argv ...string) Said {
	cmd := exec.Command(argv[0], argv[1:]...)
	cmd.Dir = dir
	cmd.Env = append(d.environ(), env...)
	if stdin != "" {
		cmd.Stdin = strings.NewReader(stdin)
	}
	var out, errs bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errs
	err := cmd.Run()
	code := 0
	var exit *exec.ExitError
	if errors.As(err, &exit) {
		code = exit.ExitCode()
	} else if err != nil {
		code = -1
		errs.WriteString(err.Error())
	}
	return Said{OK: err == nil, Out: out.String(), Err: errs.String(), Code: code}
}

// The env a child process takes: the box's own, with the doors' env over it. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) environ() []string {
	out := os.Environ()
	for key, value := range d.Env {
		out = append(out, key+"="+value)
	}
	return out
}

// A path under the work root, off its slash-separated parts. [[spec/design_output/vehicle#the-work-root-inherits]]
func (d *Doors) at(rel string) string { return filepath.Join(d.Root, filepath.FromSlash(rel)) }

// Whether a path under the work root stands. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) exists(rel string) bool {
	_, err := os.Stat(d.at(rel))
	return err == nil
}

// A file under the work root, or nothing where none stands. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) read(rel string) string {
	said, err := os.ReadFile(d.at(rel))
	if err != nil {
		return ""
	}
	return string(said)
}

// Writes a file under the work root, its folder made first. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) write(rel, text string) error {
	at := d.at(rel)
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		return err
	}
	return os.WriteFile(at, []byte(text), 0o644)
}

// Removes a path under the work root, a folder whole. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) remove(rel string) { _ = os.RemoveAll(d.at(rel)) }

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

// Runs one of the tree's own verbs under the root, as a person types it. [[spec/tickets/the-verbs-need-no-wrapper]]
func (d *Doors) verb(dir string, words ...string) Said {
	runme := d.Runme
	if len(runme) == 0 {
		runme = []string{"sh", "RUNME.sh"}
	}
	return d.run(dir, nil, "", append(append([]string{}, runme...), words...)...)
}

// A path under the method root, which the work root stands in where none is named. [[spec/design_output/vehicle#the-work-root-inherits]]
func (d *Doors) methodAt(rel string) string {
	root := d.Method
	if root == "" {
		root = d.Root
	}
	return filepath.Join(root, filepath.FromSlash(rel))
}

// A file at a whole path, or nothing where none stands. [[spec/design_output/doors#one-door-per-outside-thing]]
func readFile(at string) string {
	said, err := os.ReadFile(at)
	if err != nil {
		return ""
	}
	return string(said)
}

// The names of the files standing in a folder under the work root, in name order. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) names(folder string) []string {
	entries, err := os.ReadDir(d.at(folder))
	if err != nil {
		return nil
	}
	var out []string
	for _, one := range entries {
		if !one.IsDir() {
			out = append(out, one.Name())
		}
	}
	sort.Strings(out)
	return out
}

// Every file under a folder of the work root, as slash paths from the root, in the order the walk meets them. [[spec/design_output/doors#one-door-per-outside-thing]]
func (d *Doors) filesUnder(folder string) []string {
	var out []string
	_ = filepath.WalkDir(d.at(folder), func(at string, entry fs.DirEntry, err error) error {
		if err != nil || entry.IsDir() {
			return nil
		}
		if rel, err := filepath.Rel(d.Root, at); err == nil {
			out = append(out, filepath.ToSlash(rel))
		}
		return nil
	})
	return out
}

// Links a path under the work root into another folder, its parent made first, and answers whether it stands. [[spec/design_output/review#a-worktree-runs-the-check]]
func (d *Doors) link(rel, to string) bool {
	if err := os.MkdirAll(filepath.Dir(to), 0o755); err != nil {
		return false
	}
	return os.Symlink(d.at(rel), to) == nil
}

// Removes the link at a path, leaving what it names standing. [[spec/design_output/review#a-worktree-runs-the-check]]
func unlink(at string) { _ = os.Remove(at) }
