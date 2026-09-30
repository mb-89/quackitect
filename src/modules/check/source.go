// The files a tree reads: slash paths under the root and their text. The LSP
// hands its disk in, and the sweep hands the files the index mirrors, so the
// rules read one shape and import no io/fs.
// [[spec/tickets/lsp-rules-move-to-check]]
package check

import (
	"errors"
	"path"
	"sort"
	"strings"
)

// Every read a rule makes past the buffers, each path a slash path under the root: Names answers the files standing directly in a folder, and Paths every file, drafts among them. [[spec/tickets/lsp-rules-move-to-check]]
type Source interface {
	Read(path string) (string, bool)
	Exists(path string) bool
	Folder(path string) bool
	Names(folder string) []string
	Paths() []string
}

// A tree off the index answers this, so no follower waits on it. [[spec/design_output/lsp#the-panel-follows-the-index]]
var ErrNoIndex = errors.New("this tree reads no index")

// The files the index moves since the last pull, and the ones it drops. A tree off the index moves nothing. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *Tree) Pulls() (moved, gone []string, err error) {
	from, ok := one.source.(interface {
		Pulls() ([]string, []string, error)
	})
	if !ok {
		return nil, nil, nil
	}
	moved, gone, err = from.Pulls()
	if len(moved)+len(gone) > 0 {
		one.Forgets()
	}
	return moved, gone, err
}

// The index's tick past the one named. A tree off the index answers ErrNoIndex. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *Tree) Changes(since int64) (int64, error) {
	from, ok := one.source.(interface {
		Changes(int64) (int64, error)
	})
	if !ok {
		return since, ErrNoIndex
	}
	return from.Changes(since)
}

// The files by slash path and their text, the shape the index mirrors. [[spec/tickets/lsp-rules-move-to-check]]
type Texts map[string]string

func (one Texts) Read(at string) (string, bool) {
	text, held := one[at]
	return text, held
}

func (one Texts) Exists(at string) bool {
	_, held := one[at]
	return held || one.Folder(at)
}

func (one Texts) Folder(at string) bool {
	under := strings.TrimSuffix(at, "/") + "/"
	for each := range one {
		if strings.HasPrefix(each, under) {
			return true
		}
	}
	return false
}

func (one Texts) Names(folder string) []string {
	out := []string{}
	for each := range one {
		if dir := path.Dir(each); dir == folder || (dir == "." && folder == "") {
			out = append(out, path.Base(each))
		}
	}
	sort.Strings(out)
	return out
}

func (one Texts) Paths() []string {
	out := make([]string, 0, len(one))
	for each := range one {
		out = append(out, each)
	}
	sort.Strings(out)
	return out
}
