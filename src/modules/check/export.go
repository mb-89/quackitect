// The names the lsp module and the wiring call, exported off the rules that
// moved here, so one copy answers the editor, the check and the write door.
// [[spec/tickets/lsp-rules-move-to-check]]
package check

// [[spec/tickets/lsp-rules-move-to-check]]
var (
	CheckNote         = checkNote
	GovernorOf        = governorOf
	IsDraft           = isDraft
	IsNoteSchema      = isNoteSchema
	KindOf            = kindOf
	MarkerLines       = markerLines
	Matches           = matches
	Minted            = mintedNote
	OverLong          = overLong
	PastHistory       = pastHistory
	PlaceholderFaults = placeholderFaults
	RelativeTo        = relativeTo
	SchemaFaults      = schemaFaults
	SchemasIn         = schemasIn
	SlugOf            = slugOf
	StrangerFault     = strangerFault
	SurveyFindsNode   = surveyFindsNode
	TextFaults        = textFaults
	UnreasonedIn      = unreasoned
	DoorsWalked       = doorsWalked
)

// The note's chapters and the slug of each, which the completion offers. [[spec/tickets/lsp-rules-move-to-check]]
func (one *Tree) Chapters(path string) ([]Section, []string) {
	note := one.parsed(path)
	return note.sections, note.slugs
}

// The file a pointer's name lands on, or nothing. [[spec/tickets/lsp-rules-move-to-check]]
func (one places) FileOf(name string) string { return one.fileOf(name) }

// Whether the path names a file of the tree. [[spec/tickets/lsp-rules-move-to-check]]
func (one places) Holds(path string) bool { return one.paths[path] }

// What a pointer names, and the line and columns it stands at. [[spec/tickets/lsp-rules-move-to-check]]
func (one pointerAtLine) Target() string { return one.target }

// [[spec/tickets/lsp-rules-move-to-check]]
func (one pointerAtLine) Line() int { return one.line }

// [[spec/tickets/lsp-rules-move-to-check]]
func (one pointerAtLine) Start() int { return one.start }

// [[spec/tickets/lsp-rules-move-to-check]]
func (one pointerAtLine) End() int { return one.end }
