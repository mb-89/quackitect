// The file changes a Copilot edit call proposes, decoded before the call
// reaches disk, so the hooks door judges each as one Write.
// [[spec/tickets/copilot-hooks-run-in-go]]
package edits

import (
	"errors"
	"regexp"
	"slices"
	"strings"
	"unicode"

	"quackitect/src/modules/hooks/write"
)

// One changed file: its path and its whole text, or gone where a patch deletes it. [[spec/tickets/copilot-hooks-run-in-go]]
type Mutation struct {
	Path string
	Text string
	Gone bool
}

// The tools that decode as a patch and as a list of replacements, and the lines that frame a patch. [[spec/tickets/copilot-hooks-run-in-go]]
const (
	patchTool  = "apply_patch"
	multiTool  = "multi_replace_string_in_file"
	patchOpen  = "*** Begin Patch"
	patchClose = "*** End Patch"
	patchMark  = "*** "
)

// The tools writing a whole file, the tools replacing one string, the names a writing tool wears, and the head of a patch section. [[spec/tickets/copilot-hooks-run-in-go]]
var (
	createTools = map[string]bool{"create_file": true, "create": true, write.WriteTool: true}
	editTools   = map[string]bool{"replace_string_in_file": true, "edit": true, write.EditTool: true, "str_replace_editor": true}
	writesLike  = regexp.MustCompile(`(?i)edit|replace|patch|notebook|rename|create.*file|delete.*file`)
	patchHead   = regexp.MustCompile(`^\*\*\* (Add|Update|Delete) File: (.+)$`)
)

// The files an edit tool's call changes, each with its resulting text, read through read. A tool that writes past the exact ones refuses. [[spec/tickets/copilot-mutations-take-wholeafter]]
func Mutations(tool string, args map[string]any, read func(path string) (string, error)) ([]Mutation, error) {
	switch {
	case tool == patchTool:
		patch, ok := firstText(args, "input", "patch")
		if !ok {
			return nil, errors.New("Missing patch text.")
		}
		return PatchChanges(patch, read)
	case tool == multiTool:
		return replacements(args, read)
	case createTools[tool]:
		path, named := firstText(args, "filePath", "file_path", "path")
		content, held := args["content"].(string)
		if !named || !held {
			return nil, errors.New("The write needs a path and content.")
		}
		return []Mutation{{Path: path, Text: write.WholeAfter(map[string]any{"tool": write.WriteTool, "content": content}, "", false)}}, nil
	case editTools[tool]:
		one, err := replacement(args, read)
		if err != nil {
			return nil, err
		}
		return []Mutation{one}, nil
	case writesLike.MatchString(tool):
		return nil, errors.New("Use create_file, replace_string_in_file, or an exact apply_patch.")
	}
	return nil, nil
}

// The first of the keys the arguments hold, and whether it holds text. [[spec/tickets/copilot-hooks-run-in-go]]
func firstText(args map[string]any, keys ...string) (string, bool) {
	for _, key := range keys {
		if said, ok := args[key]; ok && said != nil {
			text, isText := said.(string)
			return text, isText
		}
	}
	return "", false
}

// One file each replacement reaches, in the order the call first names it, each replacement reading the text the one before it left. [[spec/tickets/copilot-hooks-run-in-go]]
func replacements(args map[string]any, read func(path string) (string, error)) ([]Mutation, error) {
	list, ok := args["replacements"].([]any)
	if !ok {
		return nil, errors.New("Missing replacements.")
	}
	held := map[string]string{}
	var order []string
	readHeld := func(path string) (string, error) {
		if text, ok := held[path]; ok {
			return text, nil
		}
		return read(path)
	}
	for _, one := range list {
		fields, _ := one.(map[string]any)
		change, err := replacement(fields, readHeld)
		if err != nil {
			return nil, err
		}
		if _, seen := held[change.Path]; !seen {
			order = append(order, change.Path)
		}
		held[change.Path] = change.Text
	}
	out := make([]Mutation, 0, len(order))
	for _, path := range order {
		out = append(out, Mutation{Path: path, Text: held[path]})
	}
	return out, nil
}

// One exact replacement, applied through the write door's edit where the old string stands once in the file. [[spec/tickets/copilot-mutations-take-wholeafter]]
func replacement(args map[string]any, read func(path string) (string, error)) (Mutation, error) {
	path, named := firstText(args, "filePath", "file_path", "path")
	before, from := firstText(args, "oldString", "old_string", "old_str")
	after, to := firstText(args, "newString", "new_string", "new_str")
	if !named || !from || before == "" || !to {
		return Mutation{}, errors.New("Use an exact, nonempty old string and a replacement string.")
	}
	text, err := read(path)
	if err != nil {
		return Mutation{}, err
	}
	at := strings.Index(text, before)
	if at < 0 || strings.Contains(text[at+1:], before) {
		return Mutation{}, errors.New("The edit needs unique matching context. Read the file and retry.")
	}
	edit := map[string]any{"tool": write.EditTool, "old_string": before, "new_string": after}
	return Mutation{Path: path, Text: write.WholeAfter(edit, text, true)}, nil
}

// The files a Begin Patch / End Patch envelope adds, updates and deletes, in the order it names them. [[spec/tickets/copilot-hooks-run-in-go]]
func PatchChanges(patch string, read func(path string) (string, error)) ([]Mutation, error) {
	lines := strings.Split(strings.TrimRightFunc(strings.ReplaceAll(patch, "\r\n", "\n"), unicode.IsSpace), "\n")
	if lines[0] != patchOpen || len(lines) == 1 || lines[len(lines)-1] != patchClose {
		return nil, errors.New("Use a complete Begin Patch / End Patch envelope.")
	}
	lines = lines[1 : len(lines)-1]
	var order []string
	changes := map[string]Mutation{}
	for len(lines) > 0 {
		head := patchHead.FindStringSubmatch(lines[0])
		if head == nil {
			return nil, errors.New("Unsupported patch operation. Use an exact replacement.")
		}
		end := 1
		for end < len(lines) && !strings.HasPrefix(lines[end], patchMark) {
			end++
		}
		one, err := sectionOf(head[1], head[2], lines[1:end], changes, read)
		if err != nil {
			return nil, err
		}
		if _, seen := changes[one.Path]; !seen {
			order = append(order, one.Path)
		}
		changes[one.Path] = one
		lines = lines[end:]
	}
	out := make([]Mutation, 0, len(order))
	for _, path := range order {
		out = append(out, changes[path])
	}
	return out, nil
}

// The change one patch section makes: a delete, an added file, or an update over the text an earlier section left. [[spec/tickets/copilot-hooks-run-in-go]]
func sectionOf(kind, path string, body []string, changes map[string]Mutation, read func(path string) (string, error)) (Mutation, error) {
	switch kind {
	case "Delete":
		if len(body) > 0 {
			return Mutation{}, errors.New("Unexpected content after a deletion.")
		}
		return Mutation{Path: path, Gone: true}, nil
	case "Add":
		added := make([]string, 0, len(body))
		for _, line := range body {
			if !strings.HasPrefix(line, "+") {
				return Mutation{}, errors.New("Invalid added file.")
			}
			added = append(added, line[1:])
		}
		return Mutation{Path: path, Text: strings.Join(added, "\n") + "\n"}, nil
	}
	text, err := read(path)
	if earlier, ok := changes[path]; ok {
		if earlier.Gone {
			return Mutation{}, errors.New("Cannot update a deleted file.")
		}
		text, err = earlier.Text, nil
	}
	if err != nil {
		return Mutation{}, err
	}
	text, err = updated(text, body)
	return Mutation{Path: path, Text: text}, err
}

// The text after an update section's hunks, each hunk's context matching one place alone. [[spec/tickets/copilot-hooks-run-in-go]]
func updated(text string, body []string) (string, error) {
	var before, after []string
	for _, line := range body {
		if strings.HasPrefix(line, "@@") {
			var err error
			if text, err = hunkOver(text, before, after); err != nil {
				return "", err
			}
			before, after = nil, nil
			continue
		}
		if line == "" || !strings.ContainsRune(" +-", rune(line[0])) {
			return "", errors.New("Unsupported patch line. Use exact context.")
		}
		if line[0] != '+' {
			before = append(before, line[1:])
		}
		if line[0] != '-' {
			after = append(after, line[1:])
		}
	}
	return hunkOver(text, before, after)
}

// The text with one hunk's lines swapped in, keeping the file's line ending. [[spec/tickets/copilot-hooks-run-in-go]]
func hunkOver(text string, before, after []string) (string, error) {
	if len(before) == 0 && len(after) == 0 {
		return text, nil
	}
	if len(before) == 0 {
		return "", errors.New("An insertion needs existing context.")
	}
	eol := "\n"
	if strings.Contains(text, "\r\n") {
		eol = "\r\n"
	}
	rows := strings.Split(text, eol)
	var matches []int
	for at := 0; at+len(before) <= len(rows); at++ {
		if slices.Equal(rows[at:at+len(before)], before) {
			matches = append(matches, at)
		}
	}
	if len(matches) != 1 {
		return "", errors.New("The patch needs unique matching lines. Read the file and retry.")
	}
	at := matches[0]
	return strings.Join(slices.Concat(rows[:at], after, rows[at+len(before):]), eol), nil
}
