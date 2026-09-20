// A value this tree resolves draws as a link, and a click opens what it names.
// The terminal takes the link as the escape every terminal reads, and the
// editor's own terminal opens a file address in the editor.
// [[spec/design_output/tree-view#a-value-carries-a-link]]

package draw

import (
	"path/filepath"
	"regexp"
	"strings"
)

// The escape a terminal reads as a link: the address, the text, then the close. [[spec/design_output/tree-view#a-value-carries-a-link]]
const (
	LinkOpen  = "\x1b]8;;"
	linkShut  = "\x1b\\"
	linkClose = "\x1b]8;;\x1b\\"
)

// A note link in a text, which names a note this tree holds. [[spec/design_output/tree-view#a-value-carries-a-link]]
var noteLink = regexp.MustCompile(`\[\[([^\]|#]+)(#[^\]|]*)?(?:\|([^\]]*))?\]\]`)

// [[spec/design_output/tree-view#a-value-carries-a-link]]
func Linked(text, address string) string {
	if address == "" {
		return text
	}
	return LinkOpen + address + linkShut + text + linkClose
}

// A file's address, absolute and forward-slashed, the way a terminal opens it. [[spec/design_output/tree-view#a-value-carries-a-link]]
func FileAddress(root, path string) string {
	whole := filepath.ToSlash(filepath.Join(root, filepath.FromSlash(path)))
	if !strings.HasPrefix(whole, "/") {
		whole = "/" + whole
	}
	return "file://" + whole
}

// A ticket's note stands under the tickets folder by its name. [[spec/design_output/tree-view#a-value-carries-a-link]]
func TicketPath(name string) string {
	return "spec/tickets/" + name + ".md"
}

// A note a link names stands as a path with its ending, or as a ticket by its bare name. [[spec/design_output/tree-view#a-value-carries-a-link]]
func NotePath(said string) string {
	said = strings.TrimSpace(said)
	if strings.Contains(said, "/") {
		if strings.HasSuffix(said, ".md") || strings.HasSuffix(said, ".yaml") || strings.HasSuffix(said, ".yml") {
			return said
		}
		return said + ".md"
	}
	return TicketPath(said)
}

// Every note link in a line draws as a link, and the rest stands as it is. [[spec/design_output/tree-view#a-value-carries-a-link]]
func WithLinks(root, line string) string {
	return noteLink.ReplaceAllStringFunc(line, func(said string) string {
		parts := noteLink.FindStringSubmatch(said)
		return Linked(said, FileAddress(root, NotePath(parts[1])))
	})
}
