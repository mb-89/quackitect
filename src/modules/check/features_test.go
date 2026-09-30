// The reads the editor's features answer, moved here from src/lsp with the
// cases that hold them: the hover, the completion, the links and the fold.
// [[spec/tickets/lsp-module-serves-the-features]]
package check

import (
	"reflect"
	"sort"
	"strings"
	"testing"
	"unicode/utf16"
)

// A tree over the texts named, under the root the links open files at. [[spec/tickets/lsp-module-serves-the-features]]
func featureTree(files map[string]string) *Tree {
	texts := Texts{}
	for name, text := range files {
		texts[name] = text
	}
	tree := TreeOver("/tree", texts)
	tree.Words = 5
	return tree
}

const hoverSchema = `kind: paragraph
layers:
  vocabulary:
    terms: spec/vocabulary/terms.yml
    endings: spec/config/stems.yaml
`

const hoverTerms = `terms:
  - {word: door, means: "the one place the tree guards an outside thing"}
  - {word: level zero, means: "the plugin holding every door"}
  - {word: vale, means: "a prose linter", source: "https://vale.sh"}
  - {word: read, means: "to take in a file"}
`

const hoverStems = `endings:
  - end: s
    to: [none]
  - end: ies
    to: [y]
prefixes: [un, re]
`

const hoverNote = "The doors hold, and level zero runs vale. We unread it and walk.\n"

func hoverTexts(terms string) Texts {
	return Texts{
		"spec/schemas/paragraph.schema.yaml": hoverSchema,
		"spec/vocabulary/terms.yml":          terms,
		"spec/config/stems.yaml":             hoverStems,
		"spec/notes/one.md":                  hoverNote,
	}
}

func hoverOn(tree *Tree, word string) string {
	at := strings.Index(hoverNote, word)
	said := HoverAt(tree, "spec/notes/one.md", 0, at+1)
	if said == nil {
		return ""
	}
	return said.Contents.Value
}

// [[spec/design_output/lsp#the-hover-shows-a-term]]
func TestHoverShowsATermAndItsLine(t *testing.T) {
	tree := featureTree(hoverTexts(hoverTerms))
	cases := map[string]string{
		"doors":  "**door**: the one place the tree guards an outside thing",
		"level":  "**level zero**: the plugin holding every door",
		"zero":   "**level zero**: the plugin holding every door",
		"unread": "**read**: to take in a file",
		"vale":   "**vale**: a prose linter\n\nhttps://vale.sh",
	}
	for word, want := range cases {
		if got := hoverOn(tree, word); got != want {
			t.Errorf("a hover over %s answers %q, and wants %q", word, got, want)
		}
	}
	for _, word := range []string{"hold", "walk", "We"} {
		if got := hoverOn(tree, word); got != "" {
			t.Errorf("a hover over %s answers %q, and wants none", word, got)
		}
	}
}

// The dictionary reads on each ask, so a save reaches the next hover. [[spec/design_output/lsp#the-hover-shows-a-term]]
func TestHoverReadsTheSavedTerms(t *testing.T) {
	texts := hoverTexts(hoverTerms)
	tree := TreeOver("/tree", texts)
	tree.Words = 5
	if got := hoverOn(tree, "walk"); got != "" {
		t.Fatalf("walk stands on no list yet, and the hover answers %q", got)
	}
	texts["spec/vocabulary/terms.yml"] = hoverTerms + "  - {word: walk, means: \"to move on foot\"}\n"
	if got := hoverOn(tree, "walk"); got != "**walk**: to move on foot" {
		t.Errorf("a hover after the save answers %q", got)
	}
}

const handoverSchema = `kind: handover
governs:
  - HANDOVER.md
frontmatter:
  type: object
  additionalProperties: false
  required:
    - kind
    - status
  properties:
    kind:
      const: handover
      x-link: true
      description: the schema this note is minted from
    status:
      enum: [todo, held, done]
      description: where the work stands
    depends_on:
      type: [array, string]
      description: the branches this one waits for
body:
  headingLevel: 1
  order: strict
  extraSections: false
  sections:
    - header: Where it stands
      required: true
      description: what the last session finished
    - header: What waits
      required: true
      list: true
      ordered: true
      maxItems: 2
      description: what the next reader does
`

const ticketSchema = `kind: ticket
frontmatter:
  type: object
  properties:
    kind:
      const: ticket
      x-link: true
    steps:
      type: array
body:
  headingLevel: 1
  order: strict
  extraSections: false
  sections:
    - header: Ask
      required: true
    - x-one-per: steps
    - header: Discussion
      required: true
      position: last
`

const flagSchema = `kind: flag
governs:
  - spec/flags/**
frontmatter:
  type: object
  properties:
    kind:
      const: flag
      x-link: true
    urgent:
      type: boolean
      description: whether it stops work
    group:
      enum: [one, two]
      x-link: true
body:
  headingLevel: 2
  sections:
    - header: Why
      required: true
`

func offeredTree(more map[string]string) *Tree {
	files := map[string]string{
		"spec/schemas/handover.schema.yaml": handoverSchema,
		"spec/schemas/flag.schema.yaml":     flagSchema,
		"spec/schemas/ticket.schema.yaml":   ticketSchema,
		"spec/design_output/one.md":         "# Scope\n\nA line.\n\n# The stop hook holds a turn\n\nMore.\n",
	}
	for name, text := range more {
		files[name] = text
	}
	return featureTree(files)
}

func labels(said []Completion) []string {
	out := []string{}
	for _, one := range said {
		out = append(out, one.Label)
	}
	sort.Strings(out)
	return out
}

// The items at the end of the given line, off the buffer the tree holds. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func offeredAt(t *testing.T, tree *Tree, path, text string, line int) []Completion {
	t.Helper()
	tree.Holds(path, text)
	row := strings.Split(text, "\n")[line]
	return Offers(tree, path, line, len(utf16.Encode([]rune(row))))
}

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestAKeyOffersThePropertiesTheNoteLacks(t *testing.T) {
	tree := offeredTree(nil)
	text := "---\nkind: [[handover]]\n\n---\n"
	got := offeredAt(t, tree, "HANDOVER.md", text, 2)
	if said := strings.Join(labels(got), ","); said != "depends_on,status" {
		t.Fatalf("a key offers %s", said)
	}
	for _, one := range got {
		if one.Label == "status" && (one.InsertText != "status: " || one.Detail != "where the work stands") {
			t.Fatalf("status offers %+v", one)
		}
	}
}

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestAValueOffersTheEnumTheConstAndABoolean(t *testing.T) {
	tree := offeredTree(nil)
	status := offeredAt(t, tree, "HANDOVER.md", "---\nkind: [[handover]]\nstatus:\n---\n", 2)
	if said := strings.Join(labels(status), ","); said != "done,held,todo" {
		t.Fatalf("status offers %s", said)
	}
	if edit := status[0].TextEdit; edit == nil || edit.NewText != " todo" || edit.Range.Start.Character != 7 {
		t.Fatalf("a value replaces the text past the colon, and it answers %+v", edit)
	}
	kind := offeredAt(t, tree, "HANDOVER.md", "---\nkind: \n---\n", 1)
	if said := strings.Join(labels(kind), ","); said != "[[handover]]" {
		t.Fatalf("kind offers %s on a governed path", said)
	}
	urgent := offeredAt(t, tree, "spec/flags/a.md", "---\nkind: [[flag]]\nurgent: \n---\n", 2)
	if said := strings.Join(labels(urgent), ","); said != "false,true" {
		t.Fatalf("a boolean offers %s", said)
	}
	group := offeredAt(t, tree, "spec/flags/a.md", "---\nkind: [[flag]]\ngroup:\n---\n", 2)
	if said := strings.Join(labels(group), ","); said != "[[one]],[[two]]" {
		t.Fatalf("a link offers %s", said)
	}
}

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestANoteWithNoKindOffersOne(t *testing.T) {
	tree := offeredTree(nil)
	governed := offeredAt(t, tree, "spec/flags/b.md", "---\n\n---\n", 1)
	if said := strings.Join(labels(governed), ","); said != "group,kind: [[flag]],urgent" {
		t.Fatalf("a governed note with no kind offers %s", said)
	}
	bare := offeredAt(t, tree, "spec/free.md", "", 0)
	if said := strings.Join(labels(bare), ","); said != "kind: [[flag]],kind: [[handover]],kind: [[ticket]]" {
		t.Fatalf("a bare note offers %s", said)
	}
	if bare[0].InsertText != "---\nkind: [[flag]]\n---\n" {
		t.Fatalf("a bare note opens its frontmatter, and it answers %q", bare[0].InsertText)
	}
}

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestAHeadingOffersTheChaptersTheNoteLacks(t *testing.T) {
	tree := offeredTree(nil)
	text := "---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\n# "
	if said := strings.Join(labels(offeredAt(t, tree, "HANDOVER.md", text, 7)), ","); said != "What waits" {
		t.Fatalf("a heading offers %s", said)
	}
	deeper := strings.TrimSuffix(text, "# ") + "## "
	if got := offeredAt(t, tree, "HANDOVER.md", deeper, 7); len(got) != 0 {
		t.Fatalf("a heading past the schema's level offers %v", labels(got))
	}
	ticket := "---\nkind: [[ticket]]\nsteps:\n  - name: do\n---\n\n# Ask\n\n# "
	if said := strings.Join(labels(offeredAt(t, tree, "spec/tickets/a.md", ticket, 8)), ","); said != "Discussion,do" {
		t.Fatalf("a ticket's heading offers %s, and a step names its own chapter", said)
	}
}

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestAPointerOffersPathsAndSlugs(t *testing.T) {
	tree := offeredTree(nil)
	paths := offeredAt(t, tree, "spec/two.md", "See [[spec/des", 0)
	found := false
	for _, one := range paths {
		if one.Label == "spec/design_output/one" && one.TextEdit != nil && one.TextEdit.NewText == "spec/design_output/one]]" && one.TextEdit.Range.Start.Character == 6 {
			found = true
		}
	}
	if !found {
		t.Fatalf("a pointer offers %v", labels(paths))
	}
	slugs := offeredAt(t, tree, "spec/two.md", "See [[spec/design_output/one#", 0)
	if said := strings.Join(labels(slugs), ","); said != "scope,the-stop-hook-holds-a-turn" {
		t.Fatalf("a chapter offers %s", said)
	}
}

// The editor counts the cursor in UTF-16 units, so a wide character before it keeps the cursor in place. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestTheCursorCountsUTF16Units(t *testing.T) {
	tree := offeredTree(nil)
	got := offeredAt(t, tree, "spec/two.md", "ä 😀 [[", 0)
	if len(got) == 0 {
		t.Fatal("a pointer past ä and an emoji offers nothing")
	}
	if got[0].TextEdit == nil || got[0].TextEdit.Range.Start.Character != 7 {
		t.Fatalf("the item opens at %+v, and wants unit 7", got[0].TextEdit)
	}
}

// A key naming a folder under x-values offers every file there as a link. [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
const pickedSchema = `kind: ticket
governs:
  - spec/tickets/**
frontmatter:
  type: object
  properties:
    kind:
      const: ticket
      x-link: true
    process:
      x-link: true
      x-values: spec/processes
      description: the route the mint copies from
body:
  headingLevel: 1
  sections:
    - header: Ask
      required: true
`

func TestAProcessKeyOffersEveryProcess(t *testing.T) {
	tree := offeredTree(map[string]string{
		"spec/schemas/ticket.schema.yaml": pickedSchema,
		"spec/processes/standard.yaml":    "for: a change\n",
		"spec/processes/trivial.yaml":     "for: a fix\n",
	})
	got := offeredAt(t, tree, "spec/tickets/a.md", "---\nkind: [[ticket]]\nprocess: \n---\n", 2)
	if said := strings.Join(labels(got), ","); said != "[[spec/processes/standard]],[[spec/processes/trivial]]" {
		t.Fatalf("the process key offers %s", said)
	}
}

func TestAProcessOfferSkipsAFileInAFolderBelow(t *testing.T) {
	tree := offeredTree(map[string]string{
		"spec/schemas/ticket.schema.yaml": pickedSchema,
		"spec/processes/trivial.yaml":     "for: a fix\n",
		"spec/processes/old/gone.yaml":    "for: a relic\n",
	})
	got := offeredAt(t, tree, "spec/tickets/a.md", "---\nkind: [[ticket]]\nprocess: \n---\n", 2)
	if said := strings.Join(labels(got), ","); said != "[[spec/processes/trivial]]" {
		t.Fatalf("the process key offers %s", said)
	}
}

// A pointer draws as a link over its brackets, a chapter lands on its heading's line, and a pointer landing nowhere draws none. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func TestAPointerOpensItsTarget(t *testing.T) {
	tree := featureTree(map[string]string{
		"spec/design_output/one.md": "# Scope\n\nA line.\n\n# The stop hook holds a turn\n\nMore.\n",
		"spec/guidance/two.md":      "# A rule\n\nSee [[spec/design_output/one]], then [[spec/design_output/one#the-stop-hook-holds-a-turn]].\nA `[[spec/design_output/one]]` span, and [[nobody]], and [[one]].\n",
	})
	got := LinksIn(tree, "spec/guidance/two.md")
	if len(got) != 3 {
		t.Fatalf("three pointers land, and the span and the dead one draw none, and it answers %+v", got)
	}
	whole := got[0]
	if whole.Range.Start != (Position{Line: 2, Character: 4}) || whole.Range.End != (Position{Line: 2, Character: 30}) {
		t.Fatalf("the link spans the brackets whole, and it answers %+v", whole.Range)
	}
	if !strings.HasSuffix(whole.Target, "/spec/design_output/one.md") || !strings.HasPrefix(whole.Target, "file://") {
		t.Fatalf("a path without its ending opens the note, and it answers %q", whole.Target)
	}
	if !strings.HasSuffix(got[1].Target, "/spec/design_output/one.md#L5") {
		t.Fatalf("a chapter lands on its heading's line, and it answers %q", got[1].Target)
	}
	if got[2].Range.Start.Line != 3 || !strings.HasSuffix(got[2].Target, "/spec/design_output/one.md") {
		t.Fatalf("a note's id opens the note, past the span on its line, and it answers %+v", got[2])
	}
}

// A column counts UTF-16 units, so a pointer past a wide character keeps its place. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func TestALinkCountsUTF16Units(t *testing.T) {
	tree := featureTree(map[string]string{
		"spec/design_output/one.md": "# Scope\n",
		"spec/guidance/two.md":      "# A rule\n\nä 😀 [[spec/design_output/one]]\n",
	})
	got := LinksIn(tree, "spec/guidance/two.md")
	if len(got) != 1 || got[0].Range.Start.Character != 5 {
		t.Fatalf("one link, after a character of one unit and one of two, and it answers %+v", got)
	}
}

// The fold stands over the frontmatter, so the drawing stands over it. [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
func TestTheFrontmatterFoldsFromFenceToFence(t *testing.T) {
	got := FoldsOf("---\nkind: [[ticket]]\nprocess:\n---\n\n# Ask\n")
	want := []FoldingRange{{StartLine: 0, EndLine: 3, Kind: "region"}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("the fold reads %v", got)
	}
}

func TestANoteWithNoFrontmatterFoldsNothing(t *testing.T) {
	for _, text := range []string{"# Ask\n", "---\nkind: open\n"} {
		if got := FoldsOf(text); got == nil || len(got) != 0 {
			t.Fatalf("%q folds %v, and wants an empty list the reply marshals as []", text, got)
		}
	}
}

// A cursor counts UTF-16 units, so four units in reach the byte past the emoji. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestAColumnReachesTheByteItNames(t *testing.T) {
	row := "ä 😀 x"
	if at := byteAt(row, 4); at != len("ä 😀") {
		t.Fatalf("four units in reach the byte past the emoji, and it answers %d", at)
	}
}

// A link escapes what a URI path cannot carry bare, as the old server's net/url did. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func TestALinkEscapesItsPath(t *testing.T) {
	if got := uriOf("/tree/a b/ä#1.md"); got != "file:///tree/a%20b/%C3%A4%231.md" {
		t.Fatalf("the URI reads %q", got)
	}
}
