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

// The out-ports, by their local names. [[spec/design_output/model#the-wiring-file]]
const (
	Port      = "tips"
	TrunkPort = "trunk"
)

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
	Trunk() ([]ticket.File, error)
}

// The refs as the last read found them, and the tips read off them, so a read over unmoved refs spawns one git. [[spec/tickets/the-index-reads-standing-branches]]
type repo struct {
	root    string
	refs    string
	last    []ticket.Tip
	trunkAt string
	trunk   []ticket.File
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

// Trunk's ticket files, read again where trunk moves, and none where no fetch left trunk behind. [[spec/tickets/index-reads-trunk-off-origin]]
func (one *repo) Trunk() ([]ticket.File, error) {
	said, err := one.run(nil, "rev-parse", "--verify", "--quiet", trunkRef)
	if err != nil {
		return []ticket.File{}, nil
	}
	commit := strings.TrimSpace(said)
	if one.trunk != nil && commit == one.trunkAt {
		return one.trunk, nil
	}
	files, _, err := one.filesAt(commit, nil)
	if err != nil {
		return nil, err
	}
	one.trunkAt, one.trunk = commit, files
	return files, nil
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
	var more []string
	if trunk != "" {
		more = []string{trunk + ":" + ticketAt(name)}
	}
	files, extra, err := one.filesAt(commit, more)
	if err != nil {
		return ticket.Tip{}, err
	}
	tip := ticket.Tip{Name: name, Files: files}
	if trunk != "" {
		tip.Trunk = extra[0]
	}
	return tip, nil
}

// The ticket files a commit holds directly under the ticket folder, and the text of each further ask, read in one batch. [[spec/design_output/work#the-listing-reads-git-once]]
func (one *repo) filesAt(commit string, more []string) ([]ticket.File, []string, error) {
	files := []ticket.File{}
	listing, err := one.run(nil, "ls-tree", "--name-only", commit, ticketsFolder)
	if err != nil {
		return nil, nil, err
	}
	asks := []string{}
	for _, at := range strings.Split(strings.TrimSpace(listing), "\n") {
		if ticketPath(at) {
			files = append(files, ticket.File{Path: at})
			asks = append(asks, commit+":"+at)
		}
	}
	asks = append(asks, more...)
	if len(asks) == 0 {
		return files, nil, nil
	}
	said, err := one.run([]byte(strings.Join(asks, "\n")+"\n"), "cat-file", "--batch")
	if err != nil {
		return nil, nil, err
	}
	texts := framed([]byte(said), len(asks))
	for at := range files {
		files[at].Text = texts[at]
	}
	return files, texts[len(files):], nil
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
		out = append(out, ticket.Tip{Name: name, Trunk: one.trunk[ticketAt(name)], Files: ticketFiles(files)})
	}
	sort.Slice(out, func(a, b int) bool { return out[a].Name < out[b].Name })
	return out, nil
}

// [[spec/tickets/index-reads-trunk-off-origin]]
func (one *FakeGit) Trunk() ([]ticket.File, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	return ticketFiles(one.trunk), nil
}

// The ticket files among files, in path order. [[spec/tickets/index-reads-trunk-off-origin]]
func ticketFiles(files map[string]string) []ticket.File {
	out := []ticket.File{}
	for at, text := range files {
		if ticketPath(at) {
			out = append(out, ticket.File{Path: at, Text: text})
		}
	}
	sort.Slice(out, func(a, b int) bool { return out[a].Path < out[b].Path })
	return out
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
	return q.Join(
		q.OutIn(c, Port, []ticket.Tip{}, q.Doc("every work branch standing on origin, with the ticket files on its tip and trunk's copy of its group ticket"), q.IO()),
		q.OutIn(c, TrunkPort, []ticket.File{}, q.Doc("the ticket files on trunk as origin holds it"), q.IO()),
	)
}

// Commits the tips at start, and again each span where they change. A read git refuses commits no branch. [[spec/tickets/the-index-reads-standing-branches]]
func Start(from Git, every func(time.Duration, func(time.Time)) func(), commit func(values map[string]any) error) (stop func()) {
	last := map[string]string{}
	send := func() {
		tips, err := from.Tips()
		if err != nil {
			tips = []ticket.Tip{}
		}
		trunk, err := from.Trunk()
		if err != nil {
			trunk = []ticket.File{}
		}
		moved := map[string]any{}
		for port, value := range map[string]any{Port: tips, TrunkPort: trunk} {
			if key, _ := json.Marshal(value); string(key) != last[port] {
				last[port] = string(key)
				moved[port] = value
			}
		}
		if len(moved) > 0 {
			_ = commit(moved)
		}
	}
	send()
	return every(span, func(time.Time) { send() })
}
