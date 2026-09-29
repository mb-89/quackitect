// The git IO module: it reads every work branch standing on origin, with the
// ticket files on its tip and trunk's copy of its group ticket, and writes them
// on its out-port tips. Its file carries the real reader and the fake.
// [[spec/tickets/the-index-reads-standing-branches]]
package git

import (
	"bytes"
	"encoding/json"
	"os/exec"
	"path"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"quackitect/src/q"
	"quackitect/src/ticket"
)

// The out-port, by its local name. [[spec/design_output/model#the-wiring-file]]
const Port = "tips"

// The folder a public ticket stands directly under, and the ending it carries, which TICKETS in src/engine/group.js names and a Go module spells again. [[spec/tickets/the-index-reads-standing-branches]]
const (
	ticketsFolder = "spec/tickets/"
	noteExt       = ".md"
)

// The refs the reader reads, as a fetch leaves them: every work branch, and trunk, which the listing in src/scripts/work-stands.js reads the same way. [[spec/design_output/work#the-listing-reads-git-once]]
const (
	workRefs  = "refs/remotes/origin/work/"
	trunkRef  = "refs/remotes/origin/main"
	refFormat = "--format=%(refname) %(objectname)"
)

// A batch header reads `<name> <kind> <size>`, and a missing object `<ask> missing`. [[spec/design_output/work#the-listing-reads-git-once]]
const (
	headerFields = 3
	sizeAt       = 2
)

// The span between two reads of the refs, so a fetch reaches the index before a person reads the queue. [[spec/tickets/the-index-reads-standing-branches]]
const span = 5 * time.Second

// [[spec/design_output/model#io-modules-and-their-fakes]]
type Git interface {
	Tips() ([]ticket.Tip, error)
}

// The refs as the last read found them, and the tips read off them, so a read over unmoved refs spawns one git. [[spec/tickets/the-index-reads-standing-branches]]
type repo struct {
	root string
	refs string
	last []ticket.Tip
}

// The real reader over the repository at root. [[spec/design_output/model#its-file-carries-its-fake]]
func New(root string) Git { return &repo{root: root} }

func (one *repo) Tips() ([]ticket.Tip, error) {
	refs, err := one.run(nil, "for-each-ref", refFormat, workRefs, trunkRef)
	if err != nil {
		return nil, err
	}
	if one.last != nil && refs == one.refs {
		return one.last, nil
	}
	trunk, heads := headsIn(refs)
	out := []ticket.Tip{}
	for _, head := range heads {
		tip, err := one.tipAt(head[0], head[1], trunk)
		if err != nil {
			return nil, err
		}
		out = append(out, tip)
	}
	one.refs, one.last = refs, out
	return out, nil
}

// Trunk's commit, and each work branch as its name and its commit, in the order git lists them. [[spec/tickets/the-index-reads-standing-branches]]
func headsIn(refs string) (string, [][2]string) {
	trunk := ""
	heads := [][2]string{}
	for _, line := range strings.Split(strings.TrimSpace(refs), "\n") {
		ref, commit, ok := strings.Cut(line, " ")
		if !ok {
			continue
		}
		if ref == trunkRef {
			trunk = commit
		} else if name, ok := strings.CutPrefix(ref, workRefs); ok {
			heads = append(heads, [2]string{name, commit})
		}
	}
	return trunk, heads
}

// One branch's ticket files and trunk's copy of its group ticket, read in one batch. [[spec/design_output/work#the-listing-reads-git-once]]
func (one *repo) tipAt(name, commit, trunk string) (ticket.Tip, error) {
	tip := ticket.Tip{Name: name, Files: []ticket.File{}}
	listing, err := one.run(nil, "ls-tree", "--name-only", commit, ticketsFolder)
	if err != nil {
		return tip, err
	}
	asks := []string{}
	for _, at := range strings.Split(strings.TrimSpace(listing), "\n") {
		if ticketPath(at) {
			tip.Files = append(tip.Files, ticket.File{Path: at})
			asks = append(asks, commit+":"+at)
		}
	}
	if trunk != "" {
		asks = append(asks, trunk+":"+ticketAt(name))
	}
	said, err := one.run([]byte(strings.Join(asks, "\n")+"\n"), "cat-file", "--batch")
	if err != nil {
		return tip, err
	}
	texts := framed([]byte(said), len(asks))
	for at := range tip.Files {
		tip.Files[at].Text = texts[at]
	}
	if trunk != "" {
		tip.Trunk = texts[len(asks)-1]
	}
	return tip, nil
}

// The payload a batch answers each ask, and nothing for a missing object, the reading framed in src/scripts/work-read.js holds. [[spec/design_output/work#the-listing-reads-git-once]]
func framed(said []byte, count int) []string {
	out := make([]string, count)
	for at := 0; at < count; at++ {
		ends := bytes.IndexByte(said, '\n')
		if ends < 0 {
			break
		}
		head := strings.Fields(string(said[:ends]))
		said = said[ends+1:]
		if len(head) != headerFields {
			continue
		}
		size, err := strconv.Atoi(head[sizeAt])
		if err != nil || size > len(said) {
			break
		}
		out[at] = string(said[:size])
		said = said[min(size+1, len(said)):]
	}
	return out
}

func (one *repo) run(input []byte, args ...string) (string, error) {
	cmd := exec.Command("git", args...)
	cmd.Dir = one.root
	if input != nil {
		cmd.Stdin = bytes.NewReader(input)
	}
	said, err := cmd.Output()
	return string(said), err
}

// A remote held in memory: each work branch's files, and trunk's. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeGit struct {
	mu       sync.Mutex
	branches map[string]map[string]string
	trunk    map[string]string
}

func NewFake() *FakeGit {
	return &FakeGit{branches: map[string]map[string]string{}, trunk: map[string]string{}}
}

// Stands the branch work/<name> on the remote, its tip holding these files alone. [[spec/design_output/model#io-modules-and-their-fakes]]
func (one *FakeGit) Push(name string, files map[string]string) {
	one.mu.Lock()
	defer one.mu.Unlock()
	one.branches[name] = copied(files)
}

// Writes these files onto trunk, beside what it holds. [[spec/design_output/model#io-modules-and-their-fakes]]
func (one *FakeGit) Land(files map[string]string) {
	one.mu.Lock()
	defer one.mu.Unlock()
	for at, text := range files {
		one.trunk[at] = text
	}
}

// Deletes the branch work/<name> off the remote. [[spec/design_output/model#io-modules-and-their-fakes]]
func (one *FakeGit) Drop(name string) {
	one.mu.Lock()
	defer one.mu.Unlock()
	delete(one.branches, name)
}

func (one *FakeGit) Tips() ([]ticket.Tip, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	out := []ticket.Tip{}
	for name, files := range one.branches {
		tip := ticket.Tip{Name: name, Trunk: one.trunk[ticketAt(name)], Files: []ticket.File{}}
		for at, text := range files {
			if ticketPath(at) {
				tip.Files = append(tip.Files, ticket.File{Path: at, Text: text})
			}
		}
		sort.Slice(tip.Files, func(a, b int) bool { return tip.Files[a].Path < tip.Files[b].Path })
		out = append(out, tip)
	}
	sort.Slice(out, func(a, b int) bool { return out[a].Name < out[b].Name })
	return out, nil
}

func copied(files map[string]string) map[string]string {
	out := make(map[string]string, len(files))
	for at, text := range files {
		out[at] = text
	}
	return out
}

// The path of a group's ticket, the one ticketAt in src/engine/group.js names. [[spec/tickets/the-index-reads-standing-branches]]
func ticketAt(name string) string { return ticketsFolder + name + noteExt }

// Whether a path stands directly under the ticket folder as a note. [[spec/tickets/the-index-reads-standing-branches]]
func ticketPath(at string) bool {
	under, ok := strings.CutPrefix(at, ticketsFolder)
	return ok && !strings.Contains(under, "/") && path.Ext(under) == noteExt
}

// [[spec/design_output/model#io-modules-are-modules]]
func Registers(c *q.Catalog) q.Writer {
	return q.OutIn(c, Port, []ticket.Tip{}, q.Doc("every work branch standing on origin, with the ticket files on its tip and trunk's copy of its group ticket"), q.IO())
}

// Commits the tips at start, and again each span where they change. A read git refuses commits no branch. [[spec/tickets/the-index-reads-standing-branches]]
func Start(from Git, every func(time.Duration, func(time.Time)) func(), commit func(values map[string]any) error) (stop func()) {
	last := ""
	send := func() {
		tips, err := from.Tips()
		if err != nil {
			tips = []ticket.Tip{}
		}
		key, _ := json.Marshal(tips)
		if string(key) == last {
			return
		}
		last = string(key)
		_ = commit(map[string]any{Port: tips})
	}
	send()
	return every(span, func(time.Time) { send() })
}
