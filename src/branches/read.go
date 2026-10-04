// What git answers, read as rows: the refs off one for-each-ref, and the
// paths and the contents off cat-file --batch, as src/scripts/work-read.js
// reads them. Everything here takes text and answers rows.
// [[spec/design_output/work#the-listing-reads-git-once]]
package branches

import (
	"strconv"
	"strings"
)

// The bytes an object name takes beside a tree entry, and where a batch header holds the size. [[spec/design_output/work#the-listing-reads-git-once]]
const (
	nameBytes = 20
	sizeAt    = 2
	// The base and the width a commit time reads in. [[spec/design_output/work#the-listing-reads-git-once]]
	decimal   = 10
	wholeBits = 64
)

// The fields every git answers, past the ahead-behind an older git lacks. [[spec/design_output/work#the-listing-reads-git-once]]
const refFormat = "%(refname:short) %(objectname) %(committerdate:unix)"

// A ref as the listing reads it. [[spec/design_output/work#the-listing-reads-git-once]]
type ref struct {
	Branch string
	Tip    string
	When   int64
	Merged bool
}

// The refs off for-each-ref, each merged where the set names it. [[spec/design_output/work#the-listing-reads-git-once]]
func refsIn(said string, merged map[string]bool) []ref {
	var out []ref
	for _, row := range strings.Split(said, "\n") {
		parts := strings.Fields(row)
		if len(parts) < 2 || parts[1] == "" {
			continue
		}
		branch := strings.TrimPrefix(parts[0], "origin/")
		var when int64
		if len(parts) > 2 {
			when, _ = strconv.ParseInt(parts[2], decimal, wholeBits)
		}
		out = append(out, ref{Branch: branch, Tip: parts[1], When: when, Merged: merged[branch]})
	}
	return out
}

// The batch's answers by their asks: a header a line, then the payload and a newline. [[spec/design_output/work#the-listing-reads-git-once]]
func framed(stream string, asks []string) map[string]string {
	out := map[string]string{}
	at := 0
	for _, ask := range asks {
		ends := strings.IndexByte(stream[at:], '\n')
		if ends < 0 {
			break
		}
		head := strings.Split(stream[at:at+ends], " ")
		at += ends + 1
		if len(head) <= sizeAt {
			out[ask] = ""
			continue
		}
		size, err := strconv.Atoi(head[sizeAt])
		if err != nil {
			out[ask] = ""
			continue
		}
		to := min(at+size, len(stream))
		out[ask] = stream[at:to]
		at = min(to+1, len(stream))
	}
	return out
}

// The names a raw tree object holds: a mode, a name, a zero byte, then the object's bytes. [[spec/design_output/work#the-listing-reads-git-once]]
func namesIn(tree string) []string {
	var out []string
	at := 0
	for at < len(tree) {
		space := strings.IndexByte(tree[at:], ' ')
		if space < 0 {
			break
		}
		space += at
		zero := strings.IndexByte(tree[space:], 0)
		if zero < 0 {
			break
		}
		zero += space
		out = append(out, tree[space+1:zero])
		at = zero + 1 + nameBytes
	}
	return out
}
