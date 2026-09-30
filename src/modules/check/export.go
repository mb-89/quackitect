// The names the LSP calls, exported off the rules that moved here, so one copy
// answers the editor, the check and the write door. src/lsp/rules.go aliases
// each back to the name its files call.
// [[spec/tickets/lsp-rules-move-to-check]]
package check

// [[spec/tickets/lsp-rules-move-to-check]]
var (
	AnchorFaults             = anchorFaults
	AnchorSweep              = anchorSweep
	At                       = at
	BiomeOnWindows           = biomeOnWindows
	CarriesTheName           = carriesTheName
	ChapterOf                = chapterOf
	ChaptersWanted           = chaptersWanted
	CheckNote                = checkNote
	CheckNoteIn              = checkNoteIn
	EditorDrawsWriteRules    = editorDrawsWriteRules
	EveryPointerResolvesOver = everyPointerResolves
	ExtensionsOnOffer        = extensionsOnOffer
	Fault                    = fault
	FrontOf                  = frontOf
	FunctionNamed            = functionNamed
	GoFaults                 = goFaults
	GovernorOf               = governorOf
	GroupAsksNobody          = groupAsksNobody
	IsDraft                  = isDraft
	IsHistory                = isHistory
	IsNoteSchema             = isNoteSchema
	Itoa                     = itoa
	JsonFaults               = jsonFaults
	KindOf                   = kindOf
	Left                     = left
	Listed                   = listed
	MagicIn                  = magicIn
	MarkerLines              = markerLines
	Matches                  = matches
	Minted                   = mintedNote
	NameHoldsTheWords        = nameHoldsTheWords
	NoConflictMarkers        = noConflictMarkers
	NoLogDeleted             = noLogDeleted
	NoteFaults               = noteFaults
	NothingPrivateTravels    = nothingPrivateTravels
	OverLong                 = overLong
	PastHistory              = pastHistory
	PlaceholderFaults        = placeholderFaults
	PlacesIn                 = placesIn
	PointerEndings           = pointerEndings
	PointersIn               = pointersIn
	ReadNote                 = readNote
	Readers                  = readers
	RelativeTo               = relativeTo
	RestatedFaults           = restatedFaults
	SchemaFaults             = schemaFaults
	SchemasIn                = schemasIn
	SectionsOf               = sectionsOf
	SettingsNameBinaries     = settingsNameBinaries
	SharedRun                = sharedRun
	SizeFaults               = sizeFaults
	Slashed                  = slashed
	SlugOf                   = slugOf
	Sorted                   = sorted
	StrangerFault            = strangerFault
	SurveyFindsNode          = surveyFindsNode
	SurveyNamesInstalls      = surveyNamesInstalls
	TextFaults               = textFaults
	Textual                  = textual
	TreeFaults               = treeFaults
	UnreasonedIn             = unreasoned
	WordsIn                  = wordsIn
)

// [[spec/tickets/lsp-rules-move-to-check]]
const (
	Closed          = closed
	ConflictMarkers = conflictMarkers
	Shown           = shown
	SomeFunction    = someFunction
	SyntaxRule      = syntaxRule
)

// [[spec/tickets/lsp-rules-move-to-check]]
type Places = places

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
