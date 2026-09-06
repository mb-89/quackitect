package main

import "quackitect/filter"

// THE LOG SYNTAX HAS ONE READER, AND IT IS NOT IN HERE.
//
// The engine and the viewer each carried a reader of their own, and a person
// typing into the heading box had to know which window they were in. The one
// that survives is the syntax a person types, and it lives in module
// quackitect/filter, outside any internal folder, because internal is the
// marker saying no other module may import it.
//
// WHAT IS LEFT HERE IS THE CALLER. A Record already answers the three things
// the reader asks a row for, so it is the row, and nothing builds a second one
// per keystroke. These names are what the rest of the viewer already says, so
// the move is in this file and nowhere else.
type Filter = filter.Filter

var (
	// ParseFilter reads what a person typed into the heading box.
	ParseFilter = filter.ParseFilter
	// ErrIncomplete is somebody still typing, which is not an error.
	ErrIncomplete = filter.ErrIncomplete
	// CompileError is a pattern that will not compile, which is.
	CompileError = filter.CompileError
)

// FilterHelp is the syntax written out, and it belongs with the reader that
// implements it rather than beside the pane that prints it.
const FilterHelp = filter.FilterHelp

// A Record IS the row the reader asks about, checked here so a change to
// either side is a compile error rather than a surprise at the heading box.
var _ filter.Row = Record{}
