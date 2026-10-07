// The git IO module: it reads every work branch standing on origin, with the
// ticket files on its tip and trunk's copy of its group ticket, and writes them
// on its out-port tips. Its file carries the real reader and the fake.
// [[spec/tickets/the-index-reads-standing-branches]]
package git

import (
	"bytes"
	"encoding/json"
	"os"
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
	StoodPort = "stood"
	// [[spec/tickets/check-sweep-reads-tracked]]
	TrackedPort = "tracked"
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

// The log writes each second in decimal, and a second fits an int64. [[spec/tickets/verbs-queue-order]]
const (
	secondsBase = 10
	secondsBits = 64
)

// The span between two reads of the refs, so a fetch reaches the index before a person reads the queue. [[spec/tickets/the-index-reads-standing-branches]]
const span = 5 * time.Second

// [[spec/design_output/model#io-modules-and-their-fakes]]
type Git interface {
	Tips() ([]ticket.Tip, error)
	Trunk() ([]ticket.File, error)
	Stood() (map[string]int64, error)
	Tracked() ([]string, error)
}

// The refs as the last read found them, and the tips read off them, so a read over unmoved refs spawns one git. [[spec/tickets/the-index-reads-standing-branches]]
type repo struct {
	root    string
	refs    string
	last    []ticket.Tip
	trunkAt string
	trunk   []ticket.File
	headAt  string
	stood   map[string]int64
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

// The second each path under the ticket folder came in on the checkout's history, off one git log, the reading stoodHere in src/scripts/pull-queue.js holds. It reads again where the checkout moves. [[spec/tickets/verbs-queue-order]]
func (one *repo) Stood() (map[string]int64, error) {
	head, err := one.run(nil, "rev-parse", "--verify", "--quiet", "HEAD")
	if err != nil {
		return map[string]int64{}, nil
	}
	// A fetch that deepens a shallow clone moves no HEAD, so the shallow file's content keys the reading beside it. [[spec/tickets/verbs-queue-order]]
	commit := strings.TrimSpace(head) + " " + one.shallow()
	if one.stood != nil && commit == one.headAt {
		return one.stood, nil
	}
	said, err := one.run(nil, "log", "--diff-filter=A", "--format=%ct", "--name-only", "--", strings.TrimSuffix(ticketsFolder, "/"))
	if err != nil {
		return nil, err
	}
	one.headAt, one.stood = commit, stoodIn(said)
	return one.stood, nil
}

// The paths git's own index holds, in the order git lists them, as trackedIn in src/index/door.go reads them. [[spec/tickets/check-sweep-reads-tracked]]
func (one *repo) Tracked() ([]string, error) {
	said, err := one.run(nil, "ls-files", "-z")
	if err != nil {
		return nil, err
	}
	out := []string{}
	for _, at := range strings.Split(said, "\x00") {
		if at != "" {
			out = append(out, at)
		}
	}
	return out, nil
}

// The boundary commits of a shallow clone, and nothing for a whole history. [[spec/tickets/verbs-queue-order]]
func (one *repo) shallow() string {
	at, err := one.run(nil, "rev-parse", "--path-format=absolute", "--git-path", "shallow")
	if err != nil {
		return ""
	}
	body, _ := os.ReadFile(strings.TrimSpace(at))
	return string(body)
}

// The log names a second, then the paths that commit adds, newest first, so the first second a path meets is its newest add. [[spec/design_output/pull#the-queue-is-a-score]]
func stoodIn(said string) map[string]int64 {
	out := map[string]int64{}
	var when int64
	for _, row := range strings.Split(said, "\n") {
		line := strings.TrimSpace(row)
		if line == "" {
			continue
		}
		if second, err := strconv.ParseInt(line, secondsBase, secondsBits); err == nil {
			when = second
			continue
		}
		if _, stands := out[line]; !stands {
			out[line] = when
		}
	}
	return out
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
	stood    map[string]int64
	tracked  map[string]bool
}

func NewFake() *FakeGit {
	return &FakeGit{branches: map[string]map[string]string{}, trunk: map[string]string{}, stood: map[string]int64{}, tracked: map[string]bool{}}
}

// Adds these paths on the checkout's history at the second given, so a path under the ticket folder came in then. [[spec/tickets/verbs-queue-order]]
func (one *FakeGit) Add(second int64, paths ...string) {
	one.mu.Lock()
	defer one.mu.Unlock()
	for _, at := range paths {
		one.tracked[at] = true
		if strings.HasPrefix(at, ticketsFolder) {
			one.stood[at] = second
		}
	}
}

// The paths the checkout's history adds, in path order. [[spec/tickets/check-sweep-reads-tracked]]
func (one *FakeGit) Tracked() ([]string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	out := make([]string, 0, len(one.tracked))
	for at := range one.tracked {
		out = append(out, at)
	}
	sort.Strings(out)
	return out, nil
}

// [[spec/tickets/verbs-queue-order]]
func (one *FakeGit) Stood() (map[string]int64, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	out := make(map[string]int64, len(one.stood))
	for at, second := range one.stood {
		out[at] = second
	}
	return out, nil
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
		q.OutIn(c, StoodPort, map[string]int64{}, q.Doc("the second each path under the ticket folder came in on the checkout's history"), q.IO()),
		// [[spec/tickets/check-sweep-reads-tracked]]
		q.OutIn(c, TrackedPort, []string{}, q.Doc("the paths git's own index holds"), q.IO()),
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
		stood, err := from.Stood()
		if err != nil {
			stood = map[string]int64{}
		}
		tracked, err := from.Tracked()
		if err != nil {
			tracked = []string{}
		}
		// Each port commits alone, and stands sent once its commit lands, so a port past the bus cap leaves the others landing and retries on the next span. [[spec/tickets/sweep-reads-tracked-after-restart]]
		for port, value := range map[string]any{Port: tips, TrunkPort: trunk, StoodPort: stood, TrackedPort: tracked} {
			if key, _ := json.Marshal(value); string(key) != last[port] && commit(map[string]any{port: value}) == nil {
				last[port] = string(key)
			}
		}
	}
	send()
	return every(span, func(time.Time) { send() })
}
