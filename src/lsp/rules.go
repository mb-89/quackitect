// Every name the protocol files call off the rules, aliased to the check
// module that holds them, so the files and their tests read as they did.
// [[spec/tickets/lsp-rules-move-to-check]]
package main

import "quackitect/src/modules/check"

// [[spec/tickets/lsp-rules-move-to-check]]
type (
	Tree    = check.Tree
	Finding = check.Finding
	Box     = check.Box
	Front   = check.Front
	Kinds   = check.Kinds
	places  = check.Places
)

// [[spec/tickets/lsp-rules-move-to-check]]
const (
	Bin                  = check.Bin
	DeadAnchor           = check.DeadAnchor
	EditorIni            = check.EditorIni
	EngineOwnsField      = check.EngineOwnsField
	EveryPointerResolves = check.EveryPointerResolves
	FileCeiling          = check.FileCeiling
	FunctionCeiling      = check.FunctionCeiling
	Install              = check.Install
	MagicNumber          = check.MagicNumber
	Offered              = check.Offered
	RestatedPointer      = check.RestatedPointer
	RestatedRule         = check.RestatedRule
	Settings             = check.Settings
	SeverityError        = check.SeverityError
	SeverityHint         = check.SeverityHint
	SeverityWarning      = check.SeverityWarning
	ToolsAt              = check.ToolsAt
	Unreasoned           = check.Unreasoned
	ValeIni              = check.ValeIni
	closed               = check.Closed
	conflictMarkers      = check.ConflictMarkers
	shown                = check.Shown
	someFunction         = check.SomeFunction
	syntaxRule           = check.SyntaxRule
)

// [[spec/tickets/lsp-rules-move-to-check]]
var (
	Rules                 = check.Rules
	errNoIndex            = check.ErrNoIndex
	anchorFaults          = check.AnchorFaults
	anchorSweep           = check.AnchorSweep
	at                    = check.At
	biomeOnWindows        = check.BiomeOnWindows
	carriesTheName        = check.CarriesTheName
	chapterOf             = check.ChapterOf
	chaptersWanted        = check.ChaptersWanted
	checkNote             = check.CheckNote
	checkNoteIn           = check.CheckNoteIn
	editorDrawsWriteRules = check.EditorDrawsWriteRules
	everyPointerResolves  = check.EveryPointerResolvesOver
	extensionsOnOffer     = check.ExtensionsOnOffer
	fault                 = check.Fault
	frontOf               = check.FrontOf
	functionNamed         = check.FunctionNamed
	goFaults              = check.GoFaults
	governorOf            = check.GovernorOf
	groupAsksNobody       = check.GroupAsksNobody
	isDraft               = check.IsDraft
	isHistory             = check.IsHistory
	isNoteSchema          = check.IsNoteSchema
	itoa                  = check.Itoa
	jsonFaults            = check.JsonFaults
	kindOf                = check.KindOf
	left                  = check.Left
	listed                = check.Listed
	magicIn               = check.MagicIn
	matches               = check.Matches
	nameHoldsTheWords     = check.NameHoldsTheWords
	noConflictMarkers     = check.NoConflictMarkers
	noLogDeleted          = check.NoLogDeleted
	noteFaults            = check.NoteFaults
	nothingPrivateTravels = check.NothingPrivateTravels
	overLong              = check.OverLong
	pastHistory           = check.PastHistory
	placeholderFaults     = check.PlaceholderFaults
	placesIn              = check.PlacesIn
	pointerEndings        = check.PointerEndings
	pointersIn            = check.PointersIn
	readNote              = check.ReadNote
	readers               = check.Readers
	relativeTo            = check.RelativeTo
	restatedFaults        = check.RestatedFaults
	schemaFaults          = check.SchemaFaults
	schemasIn             = check.SchemasIn
	sectionsOf            = check.SectionsOf
	settingsNameBinaries  = check.SettingsNameBinaries
	sharedRun             = check.SharedRun
	sizeFaults            = check.SizeFaults
	slashed               = check.Slashed
	slugOf                = check.SlugOf
	sorted                = check.Sorted
	surveyFindsNode       = check.SurveyFindsNode
	surveyNamesInstalls   = check.SurveyNamesInstalls
	textual               = check.Textual
	treeFaults            = check.TreeFaults
	unreasoned            = check.UnreasonedIn
	wordsIn               = check.WordsIn
)
