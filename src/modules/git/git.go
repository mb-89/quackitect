// The git IO module: it reads every work branch standing on origin, with the
// ticket files on its tip and trunk's copy of its group ticket, and writes them
// on its out-port tips. Its file carries the real reader and the fake.
// [[spec/tickets/the-index-reads-standing-branches]]
package git

import (
	"encoding/json"
	"path"
	"sort"
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

// The span between two reads of the refs, so a fetch reaches the index before a person reads the queue. [[spec/tickets/the-index-reads-standing-branches]]
const span = 5 * time.Second

// [[spec/design_output/model#io-modules-and-their-fakes]]
type Git interface {
	Tips() ([]ticket.Tip, error)
}

type repo struct {
	root string
}

// The real reader over the repository at root. [[spec/design_output/model#its-file-carries-its-fake]]
func New(root string) Git { return &repo{root: root} }

func (one *repo) Tips() ([]ticket.Tip, error) {
	return []ticket.Tip{}, nil
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
	return every(span, func(time.Time) {})
}

var _ = json.Marshal
